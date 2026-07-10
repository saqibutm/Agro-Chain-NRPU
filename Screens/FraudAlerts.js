import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, RefreshControl } from "react-native";
import Backward from "../Abstracts/Backward";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useSync } from "../Services/SyncContext";
import { useAuth } from "../Services/AuthContext";
import { queryAllQualityReports } from "../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../Services/config";
import { getQualityReports } from "../Services/demoData";
import { cacheGet, cacheSet, CacheKeys } from "../Services/cache";
import { evaluate, checkDuplicateQR, evaluateQualityReports, Severity } from "../Services/fraudDetection";
const { width, height } = Dimensions.get("window");

// Sample rule-engine inputs (Pakistan-specific batch IDs) — in production these
// come from the wheat_batches/batch_transfers/quality_reports tables.
const sampleRecords = [
    { batchID: "WBATCH-FSD-2025-0001", weightAtPickup: 5000, weightAtDelivery: 4760 },
    { batchID: "WBATCH-SWL-2025-0003", wheatInputKg: 1000, flourOutputKg: 920 },
    { batchID: "SBATCH-RYK-2025-0002", wheatInputKg: 1000, flourOutputKg: 450 },
    { batchID: "SBATCH-JHG-2026-0101", departureTime: "2026-03-01T08:00:00Z", arrivalTime: "2026-03-05T08:00:00Z" },
];
const sampleScans = [
    { productID: "WHT-FSD-2025-0001", district: "Faisalabad" },
    { productID: "WHT-FSD-2025-0001", district: "Lahore" },
];

const severityColor = {
    [Severity.HIGH]: "#c62828",
    [Severity.MEDIUM]: "#ef6c00",
    [Severity.LOW]: "#2e7d32",
};

const FraudAlerts = ({ navigation }) => {
    const { t } = useI18n();
    const { isOnline } = useSync();
    const { user } = useAuth();
    const username = user?.username || DEFAULT_USERNAME;
    const [qualityAlerts, setQualityAlerts] = useState(DEMO_MODE ? evaluateQualityReports(getQualityReports()) : []);
    const [loading, setLoading] = useState(false);
    const [cachedAt, setCachedAt] = useState(null);

    // Rule-based alerts from local records (always available, even offline).
    const baseAlerts = [
        ...sampleRecords.flatMap((r) => evaluate(r)),
        ...checkDuplicateQR(sampleScans),
    ];

    // Live alerts derived from quality reports in the traceability database.
    const loadQualityAlerts = useCallback(async () => {
        if (DEMO_MODE) { setQualityAlerts(evaluateQualityReports(getQualityReports())); return; }

        const cached = await cacheGet(CacheKeys.QUALITY_REPORTS);
        if (cached) {
            setQualityAlerts(evaluateQualityReports(cached.data));
            setCachedAt(cached.savedAt);
        }

        if (!isOnline) return;
        setLoading(true);
        try {
            const res = await queryAllQualityReports(username);
            const reports = res.reports || [];
            setQualityAlerts(evaluateQualityReports(reports));
            setCachedAt(null);
            await cacheSet(CacheKeys.QUALITY_REPORTS, reports);
        } catch (e) {
            // Backend unreachable — cached or rule-based alerts remain.
        } finally {
            setLoading(false);
        }
    }, [isOnline, username]);

    useEffect(() => { loadQualityAlerts(); }, [loadQualityAlerts]);

    // Quality alerts (live) sort to the top; high severity first.
    const order = { [Severity.HIGH]: 0, [Severity.MEDIUM]: 1, [Severity.LOW]: 2 };
    const alerts = [...qualityAlerts, ...baseAlerts].sort(
        (a, b) => order[a.severity] - order[b.severity]
    );

    return (
        <View style={{ flex: 1, paddingHorizontal: width * 0.05, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <SyncStatusBar />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("fraudAlerts")}</Text>
            </View>
            {cachedAt && (
                <Text style={{ fontSize: 11, color: "#888", textAlign: "center", marginBottom: 4 }}>
                    Last synced {Math.round((Date.now() - cachedAt) / 60000)}m ago
                </Text>
            )}

            <ScrollView
                style={{ marginTop: height * 0.02 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadQualityAlerts} colors={["green"]} />}
            >
                {alerts.length === 0 ? (
                    <Text style={styles.empty}>No anomalies detected ✓</Text>
                ) : (
                    alerts.map((a, i) => (
                        <View key={i} style={[styles.card, { borderLeftColor: severityColor[a.severity] }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.severity, { color: severityColor[a.severity] }]}>
                                    {a.severity}
                                </Text>
                                <Text style={styles.batch}>{a.batchID}</Text>
                            </View>
                            <Text style={styles.type}>{a.type.replace(/_/g, " ")}</Text>
                            <Text style={styles.message}>{a.message}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    headText: { fontSize: FontSize.F24, fontWeight: "bold", textAlign: "center", flex: 1 },
    empty: { textAlign: "center", marginTop: height * 0.1, fontSize: FontSize.F18, color: "green" },
    card: {
        backgroundColor: "#fafafa",
        borderLeftWidth: 5,
        borderRadius: 8,
        padding: 14,
        marginBottom: height * 0.015,
        elevation: 1,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    severity: { fontSize: FontSize.F13, fontWeight: "800" },
    batch: { fontSize: FontSize.F14, fontWeight: "700", color: "#333" },
    type: { fontSize: FontSize.F16, fontWeight: "700", marginTop: 4, color: "#222" },
    message: { fontSize: FontSize.F14, color: "#555", marginTop: 4, lineHeight: 20 },
});

export default FraudAlerts;
