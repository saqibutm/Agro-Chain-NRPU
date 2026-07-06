// Thin banner showing connectivity + pending-sync state. Render near the top
// of a screen; it hides itself when online with nothing pending or abandoned.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useSync } from "../Services/SyncContext";
import { discardAbandoned } from "../Services/SyncQueue";
import { FontSize } from "./Theme";

const SyncStatusBar = () => {
  const { isOnline, pending, syncing, abandoned, sync, refreshPending } = useSync();

  const hasAbandoned = abandoned && abandoned.length > 0;

  if (isOnline && pending === 0 && !syncing && !hasAbandoned) return null;

  // Abandoned items take priority — shown even when online.
  if (hasAbandoned) {
    return (
      <View style={styles.abandonedWrap}>
        <Text style={styles.abandonedText}>
          ⚠ {abandoned.length} write(s) failed permanently and cannot sync.
        </Text>
        <TouchableOpacity
          onPress={async () => { await discardAbandoned(); await refreshPending(); }}
          style={styles.discardBtn}
        >
          <Text style={styles.discardText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let bg = "#2e7d32";
  let label = "";

  if (!isOnline) {
    bg = "#c62828";
    label = pending > 0 ? `Offline · ${pending} change(s) queued` : "Offline";
  } else if (syncing) {
    bg = "#ef6c00";
    label = "Syncing…";
  } else if (pending > 0) {
    bg = "#ef6c00";
    label = `${pending} change(s) pending`;
  }

  return (
    <TouchableOpacity
      activeOpacity={isOnline ? 0.7 : 1}
      onPress={isOnline ? sync : undefined}
      style={[styles.bar, { backgroundColor: bg }]}
    >
      {syncing && <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />}
      <Text style={styles.text}>
        {label}
        {isOnline && pending > 0 && !syncing ? "  ·  Tap to sync" : ""}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "100%",
  },
  text: {
    color: "white",
    fontSize: FontSize.F13,
    fontWeight: "600",
    textAlign: "center",
  },
  abandonedWrap: {
    backgroundColor: "#b71c1c",
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  abandonedText: {
    color: "white",
    fontSize: FontSize.F12,
    fontWeight: "600",
    flex: 1,
  },
  discardBtn: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
  },
  discardText: {
    color: "white",
    fontSize: FontSize.F12,
    fontWeight: "700",
  },
});

export default SyncStatusBar;
