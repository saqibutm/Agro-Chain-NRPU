import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function cacheSet(key, data) {
  const entry = { data, savedAt: Date.now() };
  await AsyncStorage.setItem(key, JSON.stringify(entry));
}

// Returns { data, savedAt } if the entry exists and is within maxAgeMs, else null.
export async function cacheGet(key, maxAgeMs = DEFAULT_TTL_MS) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.savedAt > maxAgeMs) return null;
    return entry;
  } catch {
    return null;
  }
}

export async function cacheClear(key) {
  await AsyncStorage.removeItem(key);
}

export const CacheKeys = {
  KPIS: "@agrochain/cache/kpis",
  PRODUCTS: "@agrochain/cache/products",
  QUALITY_REPORTS: "@agrochain/cache/quality_reports",
  WHEAT_BATCHES: "@agrochain/cache/wheat_batches",
  WEIGHT_VARIANCE: "@agrochain/cache/weight_variance",
  product: (id) => `@agrochain/cache/product/${id}`,
};
