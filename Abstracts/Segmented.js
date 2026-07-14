import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontSize } from "./Theme";

// Pill-style option selector — originally lived only in LabDashboard.js
// (Grade/Result), extracted here once the crop-type picker on
// Screens/Shared/AddWheatBatch.js became a second consumer of the exact
// same behavior.
const Segmented = ({ options, value, onChange, width, activeColor = "green" }) => (
    <View style={[styles.segment, width ? { width } : null]}>
        {options.map((opt) => {
            const active = value === opt.value;
            return (
                <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.8}
                    onPress={() => onChange(opt.value)}
                    style={[styles.segmentBtn, active && { backgroundColor: opt.color || activeColor }]}
                >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const styles = StyleSheet.create({
    segment: { flexDirection: "row", gap: 8 },
    segmentBtn: {
        flex: 1, borderWidth: 1.5, borderColor: "green", borderRadius: 8,
        paddingVertical: 10, alignItems: "center",
    },
    segmentText: { fontSize: FontSize.F16, color: "green", fontWeight: "600" },
    segmentTextActive: { color: "white" },
});

export default Segmented;
