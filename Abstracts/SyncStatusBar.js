// Thin banner showing connectivity + pending-sync state. Render near the top
// of a screen; it hides itself when online with nothing pending.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useSync } from "../Services/SyncContext";
import { FontSize } from "./Theme";

const SyncStatusBar = () => {
  const { isOnline, pending, syncing, sync } = useSync();

  if (isOnline && pending === 0 && !syncing) return null;

  let bg = "#2e7d32"; // green - syncing/synced
  let label = "";

  if (!isOnline) {
    bg = "#c62828"; // red - offline
    label = pending > 0 ? `Offline · ${pending} change(s) queued` : "Offline";
  } else if (syncing) {
    bg = "#ef6c00"; // orange - syncing
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
});

export default SyncStatusBar;
