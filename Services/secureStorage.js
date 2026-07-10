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

const KEY_PREFIX = "@agrochain/secure-key/";

async function getOrCreateEncryptionKey(storageKey) {
  const keychainKey = KEY_PREFIX + storageKey;
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
    const ciphertextHex = await AsyncStorage.getItem(storageKey);
    if (!ciphertextHex) return null;
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
    const key = await getOrCreateEncryptionKey(storageKey);
    const counter = new aesjs.Counter(5);
    const bytes = aesjs.utils.utf8.toBytes(value);
    const encrypted = new aesjs.ModeOfOperation.ctr(key, counter).encrypt(bytes);
    await AsyncStorage.setItem(storageKey, aesjs.utils.hex.fromBytes(encrypted));
  },

  async removeItem(storageKey) {
    await AsyncStorage.removeItem(storageKey);
    await SecureStore.deleteItemAsync(KEY_PREFIX + storageKey);
  },
};
