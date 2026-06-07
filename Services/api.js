// Thin HTTP layer over the org backend (org/serverOrg1.js).
// Each action maps to a REST endpoint that submits/evaluates a Fabric transaction.
import { API_BASE_URL, REQUEST_TIMEOUT } from "./config";

async function request(path, { method = "GET", body, query } = {}) {
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(query).toString();
    url += `?${qs}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// ── Action registry ──
// The offline sync queue stores an { action, payload } record and replays it
// here once connectivity returns. Keep payloads JSON-serializable.
export const Actions = {
  CREATE_WHEAT_BATCH: "CREATE_WHEAT_BATCH",
  SEND_WHEAT_BATCH: "SEND_WHEAT_BATCH",
  REPORT_CONSUMER_ISSUE: "REPORT_CONSUMER_ISSUE",
  RECORD_QUALITY_TEST: "RECORD_QUALITY_TEST",
};

export async function dispatch(action, payload) {
  switch (action) {
    case Actions.CREATE_WHEAT_BATCH:
      return request("/api/createWheatBatch", { method: "POST", body: payload });
    case Actions.SEND_WHEAT_BATCH:
      return request("/api/sendWheatBatch", { method: "POST", body: payload });
    case Actions.REPORT_CONSUMER_ISSUE:
      return request("/api/reportConsumerIssue", { method: "POST", body: payload });
    case Actions.RECORD_QUALITY_TEST:
      return request("/api/recordQualityTest", { method: "POST", body: payload });
    default:
      throw new Error(`Unknown sync action: ${action}`);
  }
}

// ── Auth ──
export function login(username, password) {
  return request("/api/login", { method: "POST", body: { username, password } });
}

// Read-only helpers (not queued — only used while online).
export function queryWheatBatch(username, wheatBatchID) {
  return request("/api/queryWheatBatch", { query: { username, wheatBatchID } });
}

export function queryAllWheatBatches(username) {
  return request("/api/queryAllWheatBatches", { query: { username } });
}

export function queryAllProducts(username) {
  return request("/api/queryAllProducts", { query: { username } });
}

export function queryProduct(username, productID) {
  return request("/api/queryProduct", { query: { username, productID } });
}

export function queryQualityReports(username, subjectID) {
  return request("/api/queryQualityReports", { query: { username, subjectID } });
}

export function queryAllQualityReports(username) {
  return request("/api/queryAllQualityReports", { query: { username } });
}

export function queryProductMovements(username, productID) {
  return request("/api/queryProductMovements", { query: { username, productID } });
}
