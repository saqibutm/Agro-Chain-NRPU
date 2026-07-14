// Data layer — Supabase (Postgres) backend. The offline SyncQueue calls
// dispatch() which maps Actions to Supabase inserts.
import { supabase } from "./supabase";

// ── Action registry ──────────────────────────────────────────────────────────
export const Actions = {
  CREATE_WHEAT_BATCH:   "CREATE_WHEAT_BATCH",
  SEND_WHEAT_BATCH:     "SEND_WHEAT_BATCH",
  REPORT_CONSUMER_ISSUE:"REPORT_CONSUMER_ISSUE",
  RECORD_QUALITY_TEST:  "RECORD_QUALITY_TEST",
  CREATE_MILL_LOCATION: "CREATE_MILL_LOCATION",
  SEND_SAMPLE_TO_LAB:   "SEND_SAMPLE_TO_LAB",
};

// Current authenticated user's ID, read from the local session (no network
// round trip) — used to stamp created_by/reported_by on every write so
// records keep an audit trail of who created them.
async function _currentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// Postgres error classes that mean "this write can never succeed as-is" —
// e.g. a duplicate report ID, or a batch number that doesn't exist yet.
// Retrying (which the offline sync queue would otherwise do up to 5 times)
// wastes time and gives the user false hope; these should fail immediately
// instead of being queued for later.
const PERMANENT_ERROR_CODES = new Set([
  "23505", // unique_violation
  "23503", // foreign_key_violation
  "23502", // not_null_violation
  "23514", // check_violation
  "42501", // insufficient_privilege (RLS policy rejected the write)
]);

export function isPermanentError(err) {
  return !!err?.code && PERMANENT_ERROR_CODES.has(err.code);
}

// Wrap a Supabase/PostgrestError, preserving its Postgres error `code` so
// callers can tell a permanent failure (bad data) from a transient one
// (network blip) — plain `new Error(message)` used to drop this entirely.
function _dispatchError(error) {
  const e = new Error(error.message);
  e.code = error.code;
  return e;
}

// ── Write dispatcher (used by SyncQueue for offline replay) ──────────────────
export async function dispatch(action, payload) {
  const createdBy = await _currentUserId();

  switch (action) {

    case Actions.CREATE_WHEAT_BATCH: {
      const { error } = await supabase.from("wheat_batches").insert({
        wheat_batch_id: payload.wheatBatchID,
        entity_id:      payload.entityID,
        commodity:      payload.commodity || "wheat",
        variety:        payload.variety  || null,
        quantity:       payload.quantity || 0,
        harvest_date:   payload.harvestDate || null,
        qr_code:        payload.qrCode   || payload.wheatBatchID,
        latitude:       payload.latitude || null,
        longitude:      payload.longitude|| null,
        status:         "Created",
        created_by:     createdBy,
      });
      if (error) throw _dispatchError(error);
      return { success: true };
    }

    case Actions.CREATE_MILL_LOCATION: {
      const { error } = await supabase.from("mills").insert({
        owner_id: createdBy,
        name:     payload.name,
        location: payload.location || null,
        latitude: payload.latitude || null,
        longitude:payload.longitude|| null,
      });
      if (error) throw _dispatchError(error);
      return { success: true };
    }

    case Actions.SEND_SAMPLE_TO_LAB: {
      const { error: sErr } = await supabase.from("sample_transfers").insert({
        sample_id:       payload.sampleID,
        wheat_batch_id:  payload.wheatBatchID,
        from_mill_id:    payload.fromMillID,
        to_lab_username: payload.toLabUsername,
        quantity:        payload.quantity || 0,
        sent_date:       payload.sentDate || null,
        status:          "Sent",
        created_by:      createdBy,
      });
      if (sErr) throw _dispatchError(sErr);
      // The batch is now (at least partly) with a lab for testing — error is
      // non-fatal; the sample transfer itself is already recorded.
      const { error: uErr } = await supabase
        .from("wheat_batches")
        .update({ status: "Processing" })
        .eq("wheat_batch_id", payload.wheatBatchID);
      if (uErr) console.warn("batch status update failed:", uErr.message);
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
      if (tErr) throw _dispatchError(tErr);
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
        sample_id:  payload.sampleID || null,
        created_by: createdBy,
      });
      if (error) throw _dispatchError(error);
      // Tied to a formal sample transfer (from the LabDashboard pending-samples
      // inbox, not a free-typed subject ID) — move it out of the pending list.
      // Non-fatal: the quality report itself is already recorded.
      if (payload.sampleID) {
        const { error: sErr } = await supabase
          .from("sample_transfers")
          .update({ status: "Tested" })
          .eq("sample_id", payload.sampleID);
        if (sErr) console.warn("sample status update failed:", sErr.message);
      }
      return { success: true };
    }

    case Actions.REPORT_CONSUMER_ISSUE: {
      const { error } = await supabase.from("consumer_issues").insert({
        product_id:  payload.productID,
        district:    payload.district    || null,
        description: payload.description || null,
        reported_by: createdBy,
      });
      if (error) throw _dispatchError(error);
      return { success: true };
    }

    default:
      throw new Error(`Unknown sync action: ${action}`);
  }
}

// ── Read helpers ─────────────────────────────────────────────────────────────

// Used by the Farmer/Crop "Valid" screens to confirm an entity ID actually
// has a batch on record before it's forwarded into the mill-transfer step.
export async function checkEntityExists(entityID) {
  const { count, error } = await supabase
    .from("wheat_batches")
    .select("*", { count: "exact", head: true })
    .eq("entity_id", entityID);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

// Used by the Mill "Valid" screen to confirm a transfer to this mill ID
// actually exists before confirming receipt.
export async function checkMillTransferExists(millID) {
  const { count, error } = await supabase
    .from("batch_transfers")
    .select("*", { count: "exact", head: true })
    .eq("to_entity_id", millID);
  if (error) throw new Error(error.message);
  return (count || 0) > 0;
}

// Used by Screens/Mill/ManageMills.js (list) and Screens/Mill/Add.js (picker).
export async function queryMyMills() {
  const userId = await _currentUserId();
  if (!userId) return { mills: [] };
  const { data, error } = await supabase
    .from("mills")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return {
    mills: data.map((m) => ({
      id: m.id,
      name: m.name,
      location: m.location,
      latitude: m.latitude,
      longitude: m.longitude,
    })),
  };
}

// RLS restricts this to the owner, so no explicit ownership check needed here.
export async function deleteMillLocation(id) {
  const { error } = await supabase.from("mills").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Used by Screens/Mill/SendSample.js to pick a destination lab by their
// registered username instead of free-typing it (and risking a typo that
// silently misroutes the sample to nobody's inbox).
export async function queryLabDirectory() {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("role", "lab")
    .order("username", { ascending: true });
  if (error) throw new Error(error.message);
  return { labs: data.map((p) => p.username) };
}

// Used by Screens/LabDashboard.js — samples sent to this lab that haven't
// been tested yet, i.e. the lab's "pending samples" inbox.
export async function queryPendingSamples(username) {
  const { data, error } = await supabase
    .from("sample_transfers")
    .select("*, wheat_batches(variety, quantity)")
    .eq("to_lab_username", username)
    .eq("status", "Sent")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return {
    samples: data.map((s) => ({
      sampleID:     s.sample_id,
      wheatBatchID: s.wheat_batch_id,
      fromMillID:   s.from_mill_id,
      quantity:     s.quantity,
      sentDate:     s.sent_date,
      variety:      s.wheat_batches?.variety || null,
      batchQuantity:s.wheat_batches?.quantity ?? null,
    })),
  };
}

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

// Used by Screens/FraudAlerts.js's live weight-variance check: the farmer's
// declared batch weight ("pickup") vs. what the mill actually recorded
// receiving ("delivery") for that same batch — both stored in kg, so this is
// a straight comparison. Only batches with at least one recorded transfer
// are included. Capped at 200 most-recent batches — this is an in-app
// anomaly scan, not a full ledger audit.
export async function queryWeightVarianceRecords() {
  const { data, error } = await supabase
    .from("wheat_batches")
    .select("wheat_batch_id, quantity, batch_transfers(quantity, created_at)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data
    .filter((b) => b.batch_transfers && b.batch_transfers.length > 0)
    .map((b) => {
      const firstTransfer = [...b.batch_transfers].sort(
        (x, y) => (x.created_at < y.created_at ? -1 : 1)
      )[0];
      return {
        batchID: b.wheat_batch_id,
        weightAtPickup: b.quantity,
        weightAtDelivery: firstTransfer.quantity,
      };
    });
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
        grade:      reports[0].grade,
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
    commodity:      b.commodity || "wheat",
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
    stage:    i === 0 ? "Farm" : "Transfer",
    entity:   t.to_entity_id,
    location: t.location || null,
    date:     t.transfer_date || t.created_at?.split("T")[0],
  }));
  const geoPoints = b.latitude
    ? [{ lat: b.latitude, lng: b.longitude }]
    : [];
  const productType = b.commodity === "sugarcane" ? "Sugarcane" : "Wheat";
  return {
    ..._mapBatch(b),
    productName:  `${b.variety || productType} — ${b.wheat_batch_id}`,
    productType,
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
