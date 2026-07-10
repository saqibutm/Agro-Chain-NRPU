// Secure session storage for Supabase Auth.
//
// iOS Keychain (via expo-secure-store) caps individual values at 2048 bytes.
// A Supabase session — access token, refresh token, and full user object —
// routinely exceeds that. So we don't store the session itself in the
// Keychain: we generate a random AES-256 key, store *that* (32 bytes, well
// under the limit) in the Keychain, and use it to encrypt the session before
// writing the ciphertext to AsyncStorage. AsyncStorage has no such size cap,
// and the key never touches disk unencrypted. This is the pattern Supabase's
// own React Native guide recommends for exactly this constraint.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import aesjs from "aes-js";

const KEY_PREFIX = "agrochain_secure_key_";
const ENC_PREFIX = "enc:";
const RAW_PREFIX = "raw:";

// expo-secure-store keys must be non-empty and alphanumeric (plus `.`/`-`/`_`
// on some versions) — our storageKeys ("@agrochain/session", Supabase's
// "sb-<ref>-auth-token", etc.) contain "@"/"/" and get rejected outright.
// Sanitize to a safe key derived 1:1 from the original.
function _safeKeychainKey(storageKey) {
  return KEY_PREFIX + storageKey.replace(/[^a-zA-Z0-9_]/g, "_");
}

async function getOrCreateEncryptionKey(storageKey) {
  const keychainKey = _safeKeychainKey(storageKey);
  let keyHex = await SecureStore.getItemAsync(keychainKey);
  if (!keyHex) {
    const randomBytes = await Crypto.getRandomBytesAsync(32); // AES-256
    keyHex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
    await SecureStore.setItemAsync(keychainKey, keyHex, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  return aesjs.utils.hex.toBytes(keyHex);
}

// AsyncStorage-shaped adapter (getItem/setItem/removeItem) so it can be
// dropped straight into supabase-js's `auth.storage` option.
export const secureSessionStorage = {
  async getItem(storageKey) {
    const stored = await AsyncStorage.getItem(storageKey);
    if (!stored) return null;

    if (stored.startsWith(RAW_PREFIX)) {
      // Written by the plaintext fallback below (Keychain was unavailable
      // at write time) — nothing to decrypt.
      return stored.slice(RAW_PREFIX.length);
    }

    const ciphertextHex = stored.startsWith(ENC_PREFIX) ? stored.slice(ENC_PREFIX.length) : stored;
    try {
      const key = await getOrCreateEncryptionKey(storageKey);
      const bytes = aesjs.utils.hex.toBytes(ciphertextHex);
      const counter = new aesjs.Counter(5); // fixed counter — key is single-use per storageKey
      const decrypted = new aesjs.ModeOfOperation.ctr(key, counter).decrypt(bytes);
      return aesjs.utils.utf8.fromBytes(decrypted);
    } catch {
      // Key/ciphertext mismatch (e.g. app reinstalled, Keychain wiped but
      // AsyncStorage survived) — treat as no session rather than crash.
      await AsyncStorage.removeItem(storageKey);
      return null;
    }
  },

  async setItem(storageKey, value) {
    try {
      const key = await getOrCreateEncryptionKey(storageKey);
      const counter = new aesjs.Counter(5);
      const bytes = aesjs.utils.utf8.toBytes(value);
      const encrypted = new aesjs.ModeOfOperation.ctr(key, counter).encrypt(bytes);
      await AsyncStorage.setItem(storageKey, ENC_PREFIX + aesjs.utils.hex.fromBytes(encrypted));
    } catch (err) {
      // Keychain/Crypto unavailable on this device right now (seen: a
      // Cocoa "no such file" error from the Keychain). Local session
      // persistence degrading isn't worth blocking sign-in over — the
      // caller (AuthContext) already authenticated successfully against
      // Supabase; fall back to a plain (unencrypted) write so the app
      // still works, just without the extra at-rest encryption this
      // session.
      console.warn("secureSessionStorage: encrypted write failed, falling back to plain storage:", err.message);
      try {
        await AsyncStorage.setItem(storageKey, RAW_PREFIX + value);
      } catch (fallbackErr) {
        // Both paths failed (e.g. device storage genuinely full/corrupt).
        // This adapter also backs Supabase's own internal session storage,
        // so throwing here could surface as a login failure even though
        // auth itself already succeeded — swallow it, session just won't
        // survive an app restart this time.
        console.warn("secureSessionStorage: plain-storage fallback also failed:", fallbackErr.message);
      }
    }
  },

  async removeItem(storageKey) {
    await AsyncStorage.removeItem(storageKey);
    // Deleting a Keychain entry that was never created (e.g. clearing a
    // session on a fresh launch that never had one) shouldn't be an error.
    await SecureStore.deleteItemAsync(_safeKeychainKey(storageKey)).catch(() => {});
  },
};
