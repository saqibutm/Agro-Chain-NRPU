import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import Alert from "../Abstracts/Alert";
import Backward from "../Abstracts/Backward";
import Button from "../Abstracts/Button";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useSync } from "../Services/SyncContext";
import { useAuth } from "../Services/AuthContext";
import { Actions, queryProduct, queryProductMovements, queryQualityReports } from "../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../Services/config";
import { getProductById, WHEAT_PRODUCTS } from "../Services/demoData";
import { cacheGet, cacheSet, CacheKeys } from "../Services/cache";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
const { width, height } = Dimensions.get("window");

// Build the consumer-facing product object from Supabase records.
function buildProduct(product, movements, reports) {
    // Use the most recent lab report, if any.
    const latest = (reports || []).slice().sort(
        (a, b) => new Date(b.testDate || 0) - new Date(a.testDate || 0)
    )[0];

    const quality = latest
        ? {
            result: latest.result === "Fail" ? "Failed" : "Passed",
            moisture: latest.moistureContent ?? "—",
            protein: latest.proteinContent ?? "—",
            gluten: latest.glutenContent ?? "—",
            pesticides: !!latest.pesticidesDetected,
            aflatoxin: !!latest.aflatoxinDetected,
            testedBy: latest.testedBy,
            hasReport: true,
        }
        : { result: "—", moisture: "—", protein: "—", pesticides: false, aflatoxin: false, hasReport: false };

    return {
        productID: product.productID,
        productName: product.productName || product.productType || product.productID,
        flourType: product.productType,
        qualityGrade: latest?.grade || product.qualityGrade || "—",
        quality,
        farmOrigin: {
            farmer: product.wheatBatchID ? `Batch ${product.wheatBatchID}` : "—",
            district: "—",
            province: "—",
        },
        journey: (movements || []).map((m) => ({
            stage: m.stage || "Transfer",
            entity: `${m.fromEntity || "—"} → ${m.toEntity || "—"}`,
            location: m.location || "—",
            date: m.date || "—",
        })),
    };
}

// Consumer-facing traceability view. Populated from GET /public/verify/:qrCode;
// falls back to sample data so the screen is demonstrable without a backend.
const sampleProduct = {
    productID: "FL-2024-555",
    productName: "Atta 10kg",
    flourType: "Atta",
    qualityGrade: "A",
    quality: { result: "Passed", moisture: 11.2, protein: 12.5, gluten: 28.0, pesticides: false, aflatoxin: false, testedBy: "Punjab Food Lab", hasReport: true },
    farmOrigin: { farmer: "Ahmed Khan", district: "Faisalabad", province: "Punjab" },
    geoPoints: [
        { label: "Harvested (Faisalabad)", latitude: 31.4220558, longitude: 73.0923253, timestamp: "2026-03-10" },
        { label: "Collection Center", latitude: 31.4504, longitude: 73.1350, timestamp: "2026-03-12" },
        { label: "Warehouse (Lahore)", latitude: 31.5497, longitude: 74.3436, timestamp: "2026-03-14" },
        { label: "Flour Mill (Lahore)", latitude: 31.5820, longitude: 74.3294, timestamp: "2026-03-20" },
        { label: "Retailer (Lahore)", latitude: 31.5204, longitude: 74.3587, timestamp: "2026-03-24" },
    ],
    journey: [
        { stage: "Harvested", entity: "Ahmed Khan (Farmer)", location: "Faisalabad", date: "2026-03-10" },
        { stage: "Collection Center", entity: "Chak 204 Center", location: "Faisalabad", date: "2026-03-12" },
        { stage: "Transport", entity: "Punjab Logistics", location: "→ Lahore", date: "2026-03-13" },
        { stage: "Warehouse", entity: "PASSCO Silo 7", location: "Lahore", date: "2026-03-14" },
        { stage: "Flour Mill", entity: "Sunshine Flour Mills", location: "Lahore", date: "2026-03-20" },
        { stage: "Distributor", entity: "Metro Distribution", location: "Lahore", date: "2026-03-22" },
        { stage: "Retailer", entity: "Al-Fatah Store", location: "Lahore", date: "2026-03-24" },
    ],
};

const ProductJourney = ({ navigation, route }) => {
    const { t } = useI18n();
    const { submit, isOnline } = useSync();
    const { user } = useAuth();
    const username = user?.username || DEFAULT_USERNAME;
    const productID = route?.params?.productID;
    // In demo mode, resolve from the bundled dataset (by scanned/tapped id, else a featured product).
    const demoInitial = DEMO_MODE ? (getProductById(productID) || WHEAT_PRODUCTS[0]) : null;
    const initial = route?.params?.product ?? demoInitial ?? sampleProduct;
    const [product, setProduct] = useState(initial);
    const [geoPoints, setGeoPoints] = useState(initial.geoPoints || []);
    const [loading, setLoading] = useState(false);
    const [reported, setReported] = useState(false);
    const [cachedAt, setCachedAt] = useState(null);

    // Fetch real traceability when a productID was passed (e.g. from a QR scan).
    const loadProduct = useCallback(async () => {
        if (DEMO_MODE) {
            const p = getProductById(productID) || WHEAT_PRODUCTS[0];
            setProduct(p);
            setGeoPoints(p.geoPoints || []);
            return;
        }

        if (productID) {
            const cached = await cacheGet(CacheKeys.product(productID));
            if (cached) {
                setProduct(cached.data.product);
                setGeoPoints(cached.data.geoPoints || []);
                setCachedAt(cached.savedAt);
            }
        }

        if (!productID || !isOnline) return;
        setLoading(true);
        try {
            const [prodRes, movRes, qualRes] = await Promise.all([
                queryProduct(username, productID),
                queryProductMovements(username, productID).catch(() => ({ movements: [] })),
                queryQualityReports(username, productID).catch(() => ({ reports: [] })),
            ]);
            if (prodRes.product) {
                const built = buildProduct(prodRes.product, movRes.movements, qualRes.reports);
                let geo = [];
                geo = prodRes.product.geoPoints || [];
                setProduct(built);
                setGeoPoints(geo);
                setCachedAt(null);
                await cacheSet(CacheKeys.product(productID), { product: built, geoPoints: geo });
            }
        } catch (e) {
            // Unreachable — cached or sample data already shown.
        } finally {
            setLoading(false);
        }
    }, [productID, isOnline, username]);

    useEffect(() => { loadProduct(); }, [loadProduct]);

    const passed = product.quality?.result === "Passed";

    const handleReport = async () => {
        await submit(Actions.REPORT_CONSUMER_ISSUE, {
            username,
            productID: product.productID,
            district: product.farmOrigin?.district,
            issueFlag: true,
            issueDesc: "Consumer-reported quality concern",
        });
        setReported(true);
        Alert.alert(t("reportIssue"), "Thank you — your report has been recorded.");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <View style={styles.header}>
                <Backward color="white" onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("productJourney")}</Text>
            </View>
            <SyncStatusBar />
            {cachedAt && (
                <Text style={{ fontSize: 11, color: "#888", textAlign: "center", paddingVertical: 4 }}>
                    Last synced {Math.round((Date.now() - cachedAt) / 60000)}m ago
                </Text>
            )}

            <ScrollView contentContainerStyle={{ padding: width * 0.05, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {loading && (
                    <ActivityIndicator size="small" color="green" style={{ marginBottom: height * 0.015 }} />
                )}
                {/* Verified badge */}
                <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedTick}>✓</Text>
                    <Text style={styles.verifiedText}>{t("verifiedOnBlockchain")}</Text>
                </View>

                <Text style={styles.productName}>{product.productName}</Text>
                <Text style={styles.productId}>ID: {product.productID}</Text>

                {/* Quality panel */}
                <View style={styles.qualityCard}>
                    <View style={styles.qualityHeader}>
                        <Text style={styles.qualityTitle}>{t("qualityReport")}</Text>
                        {product.quality.hasReport && (
                            <View style={[styles.gradePill, { backgroundColor: passed ? "#2e7d32" : "#c62828" }]}>
                                <Text style={styles.gradeText}>
                                    {passed ? t("passed") : t("failed")} · {product.qualityGrade}
                                </Text>
                            </View>
                        )}
                    </View>
                    {product.quality.hasReport ? (
                        <>
                            <Text style={styles.qLine}>{t("moisture")}: {product.quality.moisture}%</Text>
                            <Text style={styles.qLine}>{t("protein")}: {product.quality.protein}%</Text>
                            {product.quality.gluten !== undefined && (
                                <Text style={styles.qLine}>{t("gluten")}: {product.quality.gluten}%</Text>
                            )}
                            <Text style={styles.qLine}>
                                {t("pesticides")}: {product.quality.pesticides ? `${t("detected")} ⚠` : `${t("none")} ✓`}
                            </Text>
                            <Text style={styles.qLine}>
                                {t("aflatoxin")}: {product.quality.aflatoxin ? `${t("detected")} ⚠` : `${t("none")} ✓`}
                            </Text>
                            {product.quality.testedBy ? (
                                <Text style={styles.qLine}>{t("testedBy")}: {product.quality.testedBy}</Text>
                            ) : null}
                        </>
                    ) : (
                        <Text style={styles.qLine}>{t("noQualityReport")}</Text>
                    )}
                </View>

                {/* Farm origin */}
                <Text style={styles.sectionTitle}>{t("farmOrigin")}</Text>
                <Text style={styles.originText}>
                    {product.farmOrigin.farmer} · {product.farmOrigin.district}, {product.farmOrigin.province}
                </Text>

                {/* GPS route */}
                {geoPoints.length > 0 ? (
                    <Button
                        text={`📍 ${t("viewOnMap")}`}
                        onPress={() => navigation.navigate("MapScreen", { points: geoPoints, title: product.productName })}
                        width={width * 0.9}
                        color="white"
                        backgroundColor="#1565c0"
                        style={{ marginTop: height * 0.015 }}
                    />
                ) : (
                    <Text style={[styles.originText, { color: "gray", marginTop: 6 }]}>{t("noLocationData")}</Text>
                )}

                {/* Journey timeline */}
                <Text style={styles.sectionTitle}>{t("productJourney")}</Text>
                {(product.journey || []).map((step, i) => {
                    const last = i === product.journey.length - 1;
                    return (
                        <View key={i} style={styles.timelineRow}>
                            <View style={styles.timelineGutter}>
                                <View style={styles.dot} />
                                {!last && <View style={styles.line} />}
                            </View>
                            <View style={styles.timelineBody}>
                                <Text style={styles.stage}>{step.stage}</Text>
                                <Text style={styles.entity}>{step.entity}</Text>
                                <Text style={styles.meta}>{step.location} · {step.date}</Text>
                            </View>
                        </View>
                    );
                })}

                <Button
                    text={reported ? "✓ Reported" : t("reportIssue")}
                    onPress={reported ? undefined : handleReport}
                    width={width * 0.9}
                    color="white"
                    backgroundColor={reported ? "#9e9e9e" : "#c62828"}
                    style={{ marginTop: height * 0.03 }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row", alignItems: "center", backgroundColor: "green",
        paddingTop: height * 0.06, paddingBottom: height * 0.02, paddingHorizontal: width * 0.05,
    },
    headText: { color: "white", fontSize: FontSize.F22, fontWeight: "bold", flex: 1, textAlign: "center" },
    verifiedBadge: {
        flexDirection: "row", alignItems: "center", alignSelf: "center",
        backgroundColor: "#e8f5e9", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginBottom: height * 0.02,
    },
    verifiedTick: { color: "#2e7d32", fontSize: FontSize.F20, fontWeight: "900", marginRight: 8 },
    verifiedText: { color: "#2e7d32", fontSize: FontSize.F16, fontWeight: "700" },
    productName: { fontSize: FontSize.F26, fontWeight: "bold", textAlign: "center" },
    productId: { fontSize: FontSize.F14, color: "gray", textAlign: "center", marginBottom: height * 0.02 },
    qualityCard: { backgroundColor: "#fafafa", borderRadius: 10, padding: 16, elevation: 1 },
    qualityHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    qualityTitle: { fontSize: FontSize.F18, fontWeight: "700" },
    gradePill: { borderRadius: 14, paddingVertical: 4, paddingHorizontal: 12 },
    gradeText: { color: "white", fontSize: FontSize.F13, fontWeight: "700" },
    qLine: { fontSize: FontSize.F14, color: "#555", marginTop: 3 },
    sectionTitle: { fontSize: FontSize.F18, fontWeight: "700", color: "green", marginTop: height * 0.025, marginBottom: 6 },
    originText: { fontSize: FontSize.F15, color: "#333" },
    timelineRow: { flexDirection: "row" },
    timelineGutter: { width: 24, alignItems: "center" },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "green", marginTop: 4 },
    line: { width: 2, flex: 1, backgroundColor: "#a5d6a7", marginVertical: 2 },
    timelineBody: { flex: 1, paddingBottom: height * 0.02, paddingLeft: 8 },
    stage: { fontSize: FontSize.F16, fontWeight: "700", color: "#222" },
    entity: { fontSize: FontSize.F14, color: "#444" },
    meta: { fontSize: FontSize.F13, color: "gray" },
});

export default ProductJourney;
