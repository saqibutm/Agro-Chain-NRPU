// App-wide sync state: online status, pending count, and auto-flush on reconnect.
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { enqueue, pendingCount, processQueue, abandonedItems } from "./SyncQueue";
import { dispatch } from "./api";

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [abandoned, setAbandoned] = useState([]); // items that failed MAX_ATTEMPTS times
  const isOnlineRef = useRef(true);

  const refreshPending = useCallback(async () => {
    setPending(await pendingCount());
    setAbandoned(await abandonedItems());
  }, []);

  // Flush the queue (no-op while offline or already syncing).
  const sync = useCallback(async () => {
    if (!isOnlineRef.current || syncing) return;
    setSyncing(true);
    try {
      await processQueue();
    } finally {
      setSyncing(false);
      await refreshPending();
    }
  }, [syncing, refreshPending]);

  // Submit a write: go straight to the network when online, otherwise queue it.
  const submit = useCallback(
    async (action, payload) => {
      if (isOnlineRef.current) {
        try {
          return { mode: "online", result: await dispatch(action, payload) };
        } catch (err) {
          // Network blipped mid-request — fall back to the queue.
          await enqueue(action, payload);
          await refreshPending();
          return { mode: "queued", error: err.message };
        }
      }
      await enqueue(action, payload);
      await refreshPending();
      return { mode: "queued" };
    },
    [refreshPending]
  );

  useEffect(() => {
    refreshPending();
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      const wasOffline = !isOnlineRef.current;
      isOnlineRef.current = online;
      setIsOnline(online);
      if (online && wasOffline) sync(); // auto-flush on reconnect
    });
    return unsubscribe;
  }, [refreshPending, sync]);

  return (
    <SyncContext.Provider value={{ isOnline, pending, syncing, abandoned, submit, sync, refreshPending }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within a SyncProvider");
  return ctx;
};
