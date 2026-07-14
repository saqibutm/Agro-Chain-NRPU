import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import Container from "../Abstracts/Container";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useSync } from "../Services/SyncContext";
import { useAuth } from "../Services/AuthContext";
import { queryAllWheatBatches, queryAllProducts, queryAllQualityReports, queryRecentActivity } from "../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../Services/config";
import { getKpis as getDemoKpis, getRecentActivity } from "../Services/demoData";
import { cacheGet, cacheSet, CacheKeys } from "../Services/cache";
const { width, height } = Dimensions.get("window");

// Per-role quick-action lists (labelKey → i18n key, screen → navigator name).
const ROLE_ACTIONS = {
    farmer:    [
        { labelKey: "newBatch",          screen: "AddCrop"       },
        { labelKey: "qrScanner",         screen: "QRScanner"     },
        { labelKey: "fraudAlerts",       screen: "FraudAlerts"   },
        { labelKey: "faqs",              screen: "FAQs"          },
    ],
    mill:      [
        { labelKey: "myMills",           screen: "ManageMills"   },
        { labelKey: "addMill",           screen: "AddMill"       },
        { labelKey: "qrScanner",         screen: "QRScanner"     },
        { labelKey: "fraudAlerts",       screen: "FraudAlerts"   },
        { labelKey: "faqs",              screen: "FAQs"          },
    ],
    lab:       [
        { labelKey: "recordQualityTest", screen: "LabDashboard"  },
        { labelKey: "qrScanner",         screen: "QRScanner"     },
        { labelKey: "fraudAlerts",       screen: "FraudAlerts"   },
        { labelKey: "faqs",              screen: "FAQs"          },
    ],
    regulator: [
        { labelKey: "fraudAlerts",       screen: "FraudAlerts"   },
        { labelKey: "qrScanner",         screen: "QRScanner"     },
        { labelKey: "camera",            screen: "CameraScreen"  },
        { labelKey: "faqs",              screen: "FAQs"          },
    ],
    consumer:  [
        { labelKey: "qrScanner",         screen: "QRScanner"     },
        { labelKey: "fraudAlerts",       screen: "FraudAlerts"   },
        { labelKey: "productJourney",    screen: "ProductJourney"},
        { labelKey: "faqs",              screen: "FAQs"          },
    ],
};

// KPI indices to show per role (from the kpis[] array built in component):
// 0=batchesCreated  1=inTransit  2=delivered  3=products  4=passRate  5=qualityFlags
const ROLE_KPIS = {
    farmer:    [0, 1, 2, 5],
    mill:      [0, 1, 2, 4],
    lab:       [4, 5, 0, 1],
    regulator: [0, 1, 2, 3, 4, 5],
    consumer:  [2, 3, 4, 5],
};

// Greeting i18n key per role.
const ROLE_GREETING = {
    farmer:    "farmer",
    mill:      "roleMill",
    lab:       "roleLab",
    regulator: "roleRegulator",
    consumer:  "roleConsumer",
};

// Derive dashboard KPIs from batches/products/quality reports.
function computeKpis(batches, products, reports) {
	const created = batches.length;
	const inTransit = batches.filter((b) =>
		(b.currentStage || b.status || "").toLowerCase().includes("transit")
	).length;
	const delivered = batches.filter((b) =>
		["processed", "delivered", "packaged"].includes((b.status || "").toLowerCase())
	).length;

	// Quality metrics derived from lab reports (grade + result).
	const total = reports.length;
	const failed = reports.filter(
		(r) => r.result === "Fail" || r.pesticidesDetected || r.aflatoxinDetected
	).length;
	const passRate = total > 0 ? Math.round(((total - failed) / total) * 100) : null;

	return { created, inTransit, delivered, products: products.length, passRate, qualityFlags: failed };
}

// KPI tile — big number + label, color-coded by status.
// Becomes tappable when an onPress handler is provided.
const KpiCard = ({ value, label, color, onPress }) => {
	const content = (
		<>
			<Text style={[styles.kpiValue, { color }]}>{value}</Text>
			<Text style={styles.kpiLabel}>{label}</Text>
			{onPress && <Text style={styles.kpiChevron}>›</Text>}
		</>
	);
	if (onPress) {
		return (
			<TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.kpiCard, { borderTopColor: color }]}>
				{content}
			</TouchableOpacity>
		);
	}
	return <View style={[styles.kpiCard, { borderTopColor: color }]}>{content}</View>;
};

const Home = ({ navigation }) => {
	const { t } = useI18n();
	const { isOnline } = useSync();
	const { user } = useAuth();
	const username = user?.username || DEFAULT_USERNAME;
	const role = user?.role || "farmer";

	const [stats, setStats] = useState(DEMO_MODE ? getDemoKpis() : { created: 0, inTransit: 0, delivered: 0, products: 0, passRate: null, qualityFlags: 0 });
	const [activity, setActivity] = useState(DEMO_MODE ? getRecentActivity() : []);
	const [loading, setLoading] = useState(false);
	const [live, setLive] = useState(DEMO_MODE);
	const [cachedAt, setCachedAt] = useState(null);

	const loadData = useCallback(async () => {
		if (DEMO_MODE) { setStats(getDemoKpis()); setActivity(getRecentActivity()); setLive(true); return; }

		// Show cached data immediately so the screen is never blank offline.
		const cached = await cacheGet(CacheKeys.KPIS);
		if (cached) {
			setStats(cached.data);
			setCachedAt(cached.savedAt);
			setLive(false);
		}

		if (!isOnline) return;
		setLoading(true);
		try {
			const [batchRes, productRes, qualRes, activityItems] = await Promise.all([
				queryAllWheatBatches(username).catch(() => ({ batches: [] })),
				queryAllProducts(username).catch(() => ({ products: [] })),
				queryAllQualityReports(username).catch(() => ({ reports: [] })),
				queryRecentActivity().catch(() => []),
			]);
			const fresh = computeKpis(batchRes.batches || [], productRes.products || [], qualRes.reports || []);
			setStats(fresh);
			setActivity(activityItems);
			setLive(true);
			setCachedAt(null);
			await cacheSet(CacheKeys.KPIS, fresh);
		} catch (e) {
			if (!cached) setLive(false);
		} finally {
			setLoading(false);
		}
	}, [isOnline, username]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Show live values once loaded; otherwise show "—" placeholders.
	const v = (n) => (live ? String(n) : "—");
	const passRateText = live && stats.passRate !== null ? `${stats.passRate}%` : "—";
	// Pass-rate color: green ≥90%, orange 70–89%, red below 70%.
	const passRateColor =
		stats.passRate === null ? "#6a1b9a" : stats.passRate >= 90 ? "#2e7d32" : stats.passRate >= 70 ? "#ef6c00" : "#c62828";
	const flagsColor = live && stats.qualityFlags > 0 ? "#c62828" : "#2e7d32";

	const kpis = [
		{ value: v(stats.created), label: t("batchesCreated"), color: "#2e7d32" },
		{ value: v(stats.inTransit), label: t("inTransit"), color: "#ef6c00" },
		{ value: v(stats.delivered), label: t("delivered"), color: "#1565c0" },
		{ value: v(stats.products), label: t("productJourney"), color: "#6a1b9a" },
		{ value: passRateText, label: t("passRate"), color: passRateColor },
		{ value: v(stats.qualityFlags), label: t("qualityFlags"), color: flagsColor, onPress: () => navigation.navigate("FraudAlerts") },
	];

	const roleActions = (ROLE_ACTIONS[role] || ROLE_ACTIONS.farmer)
		// ProductJourney needs a productID param — open SupplyChainTracking instead
		.map((a) => a.screen === "ProductJourney"
			? { ...a, screen: "QRScanner" }
			: a
		)
		.map((a) => ({ label: t(a.labelKey), screen: a.screen }));

	const roleKpiIndices = ROLE_KPIS[role] || ROLE_KPIS.farmer;

	return (
		<Container style={{ paddingHorizontal: 0, paddingVertical: 0, flex: 1 }}>
			<SyncStatusBar />
			<ScrollView
				contentContainerStyle={{ paddingHorizontal: width * 0.05, paddingVertical: height * 0.04 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={["green"]} />}
			>
				<Text style={styles.greeting}>{t(ROLE_GREETING[role] || "farmer")}</Text>
				<Text style={styles.subtitle}>{t("dashboard")}</Text>
				{cachedAt && (
					<Text style={styles.staleNote}>
						Last synced {Math.round((Date.now() - cachedAt) / 60000)}m ago
					</Text>
				)}

				{/* KPI grid — filtered by role */}
				<View style={styles.kpiGrid}>
					{kpis
						.filter((_, i) => roleKpiIndices.includes(i))
						.map((k, i) => (
							<KpiCard key={i} {...k} />
						))}
				</View>

				{/* Quick actions */}
				<Text style={styles.sectionTitle}>{t("quickActions")}</Text>
				<View style={styles.actionGrid}>
					{roleActions.map((a, i) => (
						<TouchableOpacity
							key={i}
							activeOpacity={0.8}
							style={styles.actionBtn}
							onPress={() => navigation.navigate(a.screen)}
						>
							<Text style={styles.actionText}>{a.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Recent activity */}
				<Text style={styles.sectionTitle}>{t("recentActivity")}</Text>
				{activity.map((item, i) => (
					<View key={i} style={styles.activityRow}>
						<View style={[styles.activityDot, { backgroundColor: item.status }]} />
						<Text style={styles.activityText}>{item.text}</Text>
					</View>
				))}
			</ScrollView>
		</Container>
	);
};

const styles = StyleSheet.create({
	greeting: { fontSize: FontSize.F32, fontWeight: "bold", color: "green" },
	subtitle: { fontSize: FontSize.F18, color: "gray", marginBottom: height * 0.025 },
	kpiGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
	kpiCard: {
		width: "48%",
		backgroundColor: "#fafafa",
		borderRadius: 12,
		borderTopWidth: 4,
		paddingVertical: height * 0.025,
		paddingHorizontal: 14,
		marginBottom: height * 0.018,
		elevation: 2,
		alignItems: "center",
	},
	kpiValue: { fontSize: FontSize.F35, fontWeight: "800" },
	kpiLabel: { fontSize: FontSize.F14, color: "#555", marginTop: 4, textAlign: "center" },
	kpiChevron: { position: "absolute", top: 6, right: 10, fontSize: FontSize.F20, color: "#999", fontWeight: "700" },
	sectionTitle: { fontSize: FontSize.F20, fontWeight: "700", color: "#222", marginTop: height * 0.02, marginBottom: height * 0.012 },
	actionGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
	actionBtn: {
		width: "48%",
		backgroundColor: "green",
		borderRadius: 10,
		paddingVertical: height * 0.03,
		marginBottom: height * 0.015,
		justifyContent: "center",
		alignItems: "center",
	},
	actionText: { color: "white", fontSize: FontSize.F17, fontWeight: "600", textAlign: "center" },
	activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
	activityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
	activityText: { fontSize: FontSize.F14, color: "#444", flex: 1 },
	staleNote: { fontSize: FontSize.F12, color: "#888", marginBottom: height * 0.01 },
});

export default Home;
