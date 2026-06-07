// Persistent offline write-queue.
// Captures actions while offline and replays them in order when online.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dispatch } from "./api";

const QUEUE_KEY = "@agrochain/sync_queue";

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Add a write to the queue. Returns the stored record.
export async function enqueue(action, payload) {
  const queue = await getQueue();
  const record = {
    id: makeId(),
    action,
    payload,
    status: "pending", // pending | failed
    attempts: 0,
    error: null,
    createdAt: new Date().toISOString(),
  };
  queue.push(record);
  await saveQueue(queue);
  return record;
}

export async function pendingCount() {
  const queue = await getQueue();
  return queue.length;
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

// Replay every queued action. Successful records are dropped; failures are
// kept and marked so the user can see what didn't go through.
// Returns { processed, succeeded, failed }.
export async function processQueue() {
  let queue = await getQueue();
  if (queue.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  let succeeded = 0;
  const remaining = [];

  for (const record of queue) {
    try {
      await dispatch(record.action, record.payload);
      succeeded += 1; // drop on success
    } catch (err) {
      remaining.push({
        ...record,
        status: "failed",
        attempts: record.attempts + 1,
        error: err.message,
      });
    }
  }

  await saveQueue(remaining);
  return {
    processed: queue.length,
    succeeded,
    failed: remaining.length,
  };
}
