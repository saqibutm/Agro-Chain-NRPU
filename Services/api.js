// Data layer — Supabase backend replacing Hyperledger Fabric REST gateway.
// Function signatures are kept identical to the original so all screens work
// unchanged. The offline SyncQueue calls dispatch() which maps Actions to
// Supabase inserts.
import { supabase } from "./supabase";

// ── Action registry ──────────────────────────────────────────────────────────
export const Actions = {
  CREATE_WHEAT_BATCH:   "CREATE_WHEAT_BATCH",
  SEND_WHEAT_BATCH:     "SEND_WHEAT_BATCH",
  REPORT_CONSUMER_ISSUE:"REPORT_CONSUMER_ISSUE",
  RECORD_QUALITY_TEST:  "RECORD_QUALITY_TEST",
};

// Current authenticated user's ID, read from the local session (no network
// round trip) — used to stamp created_by/reported_by on every write so
// records keep an audit trail of who created them.
async function _currentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// ── Write dispatcher (used by SyncQueue for offline replay) ──────────────────
export async function dispatch(action, payload) {
  const createdBy = await _currentUserId();

  switch (action) {

    case Actions.CREATE_WHEAT_BATCH: {
      const { error } = await supabase.from("wheat_batches").insert({
        wheat_batch_id: payload.wheatBatchID,
        entity_id:      payload.entityID,
        variety:        payload.variety  || null,
        quantity:       payload.quantity || 0,
        harvest_date:   payload.harvestDate || null,
        qr_code:        payload.qrCode   || payload.wheatBatchID,
        latitude:       payload.latitude || null,
        longitude:      payload.longitude|| null,
        status:         "Created",
        created_by:     createdBy,
      });
      if (error) throw new Error(error.message);
      return { success: true };
    }

    case Actions.SEND_WHEAT_BATCH: {
      const { error: tErr } = await supabase.from("batch_transfers").insert({
        wheat_batch_id: payload.wheatBatchID,
        from_entity_id: payload.fromEntityID,
        to_entity_id:   payload.toEntityID,
        quantity:       payload.quantity || 0,
        transfer_date:  payload.transferDate || null,
        location:       payload.location || null,
        created_by:     createdBy,
      });
      if (tErr) throw new Error(tErr.message);
      // Update batch status — error is non-fatal; transfer is already recorded.
      const { error: uErr } = await supabase
        .from("wheat_batches")
        .update({ status: "In Transit" })
        .eq("wheat_batch_id", payload.wheatBatchID);
      if (uErr) console.warn("batch status update failed:", uErr.message);
      return { success: true };
    }

    case Actions.RECORD_QUALITY_TEST: {
      const { error } = await supabase.from("quality_reports").insert({
        report_id:  payload.reportID,
        subject_id: payload.subjectID,
        lab_id:     payload.labID    || null,
        tested_by:  payload.testedBy || null,
        test_date:  payload.testDate || null,
        moisture:   payload.moisture ?? null,
        protein:    payload.protein  ?? null,
        gluten:     payload.gluten   ?? null,
        pesticides: payload.pesticides || false,
        aflatoxin:  payload.aflatoxin  || false,
        result:     payload.result || "Pass",
        grade:      payload.grade  || "A",
        cert_hash:  payload.certHash || null,
        created_by: createdBy,
      });
      if (error) throw new Error(error.message);
      return { success: true };
    }

    case Actions.REPORT_CONSUMER_ISSUE: {
      const { error } = await supabase.from("consumer_issues").insert({
        product_id:  payload.productID,
        district:    payload.district    || null,
        description: payload.description || null,
        reported_by: createdBy,
      });
      if (error) throw new Error(error.message);
      return { success: true };
    }

    default:
      throw new Error(`Unknown sync action: ${action}`);
  }
}

// ── Read helpers ─────────────────────────────────────────────────────────────

export async function queryWheatBatch(username, wheatBatchID) {
  const { data, error } = await supabase
    .from("wheat_batches")
    .select("*")
    .eq("wheat_batch_id", wheatBatchID)
    .single();
  if (error) throw new Error(error.message);
  return { batch: _mapBatch(data) };
}

export async function queryAllWheatBatches(username) {
  const { data, error } = await supabase
    .from("wheat_batches")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { batches: data.map(_mapBatch) };
}

export async function queryAllProducts(username) {
  const { data, error } = await supabase
    .from("wheat_batches")
    .select("*, batch_transfers(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { products: data.map(_mapProduct) };
}

export async function queryProduct(username, productID) {
  const [batchRes, transferRes, qualRes] = await Promise.all([
    supabase.from("wheat_batches").select("*").eq("wheat_batch_id", productID).single(),
    supabase.from("batch_transfers").select("*").eq("wheat_batch_id", productID).order("created_at", { ascending: true }),
    supabase.from("quality_reports").select("*").eq("subject_id", productID).order("created_at", { ascending: false }),
  ]);
  if (batchRes.error) throw new Error(batchRes.error.message);
  const batch = batchRes.data;
  const transfers = transferRes.data || [];
  const reports = qualRes.data || [];
  return {
    product: {
      ..._mapProduct({ ...batch, batch_transfers: transfers }),
      quality: reports.length > 0 ? {
        result:     reports[0].result,
        moisture:   reports[0].moisture,
        protein:    reports[0].protein,
        gluten:     reports[0].gluten,
        pesticides: reports[0].pesticides,
        aflatoxin:  reports[0].aflatoxin,
        testedBy:   reports[0].tested_by,
        hasReport:  true,
      } : { result: "—", hasReport: false },
    },
  };
}

export async function queryQualityReports(username, subjectID) {
  const { data, error } = await supabase
    .from("quality_reports")
    .select("*")
    .eq("subject_id", subjectID)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { reports: data.map(_mapReport) };
}

export async function queryAllQualityReports(username) {
  const { data, error } = await supabase
    .from("quality_reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { reports: data.map(_mapReport) };
}

export async function queryRecentActivity() {
  const [transferRes, qualRes] = await Promise.all([
    supabase.from("batch_transfers").select("wheat_batch_id, to_entity_id, created_at").order("created_at", { ascending: false }).limit(4),
    supabase.from("quality_reports").select("subject_id, result, grade, created_at").order("created_at", { ascending: false }).limit(3),
  ]);
  const events = [
    ...(transferRes.data || []).map((t) => ({
      date:   t.created_at,
      text:   `${t.wheat_batch_id} → ${t.to_entity_id}`,
      status: "#2e7d32",
    })),
    ...(qualRes.data || []).map((r) => ({
      date:   r.created_at,
      text:   `${r.subject_id} quality: Grade ${r.grade}`,
      status: r.result === "Fail" ? "#c62828" : "#1565c0",
    })),
  ];
  return events.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
}

export async function queryProductMovements(username, productID) {
  const { data, error } = await supabase
    .from("batch_transfers")
    .select("*")
    .eq("wheat_batch_id", productID)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return {
    movements: data.map((t) => ({
      stage:      "Transfer",
      fromEntity: t.from_entity_id,
      toEntity:   t.to_entity_id,
      date:       t.transfer_date || t.created_at?.split("T")[0],
      location:   t.location,
      lat:        null,
      lng:        null,
    })),
  };
}

// ── Internal mappers ─────────────────────────────────────────────────────────

function _mapBatch(b) {
  return {
    productID:      b.wheat_batch_id,
    wheatBatchID:   b.wheat_batch_id,
    entityID:       b.entity_id,
    variety:        b.variety,
    quantity:       b.quantity,
    harvestDate:    b.harvest_date,
    productionDate: b.harvest_date,
    qrCode:         b.qr_code,
    status:         b.status,
    latitude:       b.latitude,
    longitude:      b.longitude,
    createdAt:      b.created_at,
  };
}

function _mapProduct(b) {
  const transfers = b.batch_transfers || [];
  const journey = transfers.map((t, i) => ({
    stage:  i === 0 ? "Farm" : "Transfer",
    entity: t.to_entity_id,
    date:   t.transfer_date || t.created_at?.split("T")[0],
  }));
  const geoPoints = b.latitude
    ? [{ lat: b.latitude, lng: b.longitude }]
    : [];
  return {
    ..._mapBatch(b),
    productName:  `${b.variety || "Wheat"} — ${b.wheat_batch_id}`,
    productType:  "Wheat",
    farmOrigin:   { farmer: b.entity_id, district: "", province: "Punjab" },
    currentStage: b.status,
    journey,
    geoPoints,
    quality:      { result: "—", hasReport: false },
  };
}

function _mapReport(r) {
  return {
    reportID:          r.report_id,
    subjectID:         r.subject_id,
    labID:             r.lab_id,
    testedBy:          r.tested_by,
    testDate:          r.test_date,
    moisture:          r.moisture,
    protein:           r.protein,
    gluten:            r.gluten,
    pesticidesDetected:r.pesticides,
    aflatoxinDetected: r.aflatoxin,
    result:            r.result,
    grade:             r.grade,
    hasReport:         true,
    createdAt:         r.created_at,
  };
}
