import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import QRCodeSVG from "react-native-qrcode-svg";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Alert from "../../Abstracts/Alert";
import Backward from "../../Abstracts/Backward";
import Button from "../../Abstracts/Button";
import { FontSize } from "../../Abstracts/Theme";
import { useI18n } from "../../i18n/I18nContext";
import { useAuth } from "../../Services/AuthContext";
import { queryProduct } from "../../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../../Services/config";

const { width, height } = Dimensions.get("window");
const QR_SIZE = Math.min(width * 0.6, 240);

const STATUS_COLORS = {
    Created:      "#6a1b9a",
    "In Transit": "#ef6c00",
    Processing:   "#1565c0",
    Delivered:    "#2e7d32",
};
const STATUS_LABEL_KEYS = {
    Created:      "statusCreated",
    "In Transit": "inTransit",
    Processing:   "statusProcessing",
    Delivered:    "delivered",
};

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
);

// Shown after a farmer creates a batch, a mill records a transfer or sends a
// sample, or a lab records a test (Screens/Shared/AddWheatBatch.js,
// Screens/Mill/Add.js, Screens/Mill/SendSample.js, Screens/LabDashboard.js).
// The QR itself only ever encodes the bare batch ID — QRScanner.js and every
// downstream role look up the full record from wheat_batches by that ID, so
// this is the one code that has to stay stable and scannable through the
// whole physical supply chain; it's never regenerated with a new ID. What
// *does* change on each visit is the label around it: this screen fetches
// the batch's current state (status, latest custody, quality result) live,
// so re-printing at the mill or lab step reflects what's true right now,
// not just what the farmer knew at creation time.
const BatchQRCode = ({ navigation, route }) => {
    const { t } = useI18n();
    const { user } = useAuth();
    const username = user?.username || DEFAULT_USERNAME;
    const qrRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [live, setLive] = useState(null);
    const [loadingLive, setLoadingLive] = useState(!DEMO_MODE);

    const {
        wheatBatchID = "",
        variety: seedVariety = "",
        commodity: seedCommodity = null,
        quantity: seedQuantity = "",
        harvestDate: seedHarvestDate = "",
        latitude: seedLatitude = null,
        longitude: seedLongitude = null,
        nextScreen = null,
    } = route.params || {};

    const loadLive = useCallback(async () => {
        if (DEMO_MODE || !wheatBatchID) { setLoadingLive(false); return; }
        setLoadingLive(true);
        try {
            const { product } = await queryProduct(username, wheatBatchID);
            setLive(product);
        } catch {
            // Not found or offline — fall back to whatever was passed in via
            // route params (e.g. a lab-typed subject ID with no batch record).
        } finally {
            setLoadingLive(false);
        }
    }, [wheatBatchID, username]);

    useEffect(() => { loadLive(); }, [loadLive]);

    // Prefer live data (authoritative), fall back to what the caller already
    // knew (e.g. right after AddWheatBatch creates the batch, before this
    // screen's own fetch resolves).
    const commodity   = live?.commodity   || seedCommodity;
    const cropTypeText = commodity === "sugarcane" ? t("sugarcane") : t("wheat");
    const variety     = live?.variety     || seedVariety;
    const quantity    = live?.quantity    ?? seedQuantity;
    const harvestDate = live?.harvestDate || seedHarvestDate;
    const latitude    = live?.latitude    ?? seedLatitude;
    const longitude   = live?.longitude   ?? seedLongitude;
    const status      = live?.status || null;
    const latestStop  = live?.journey?.length > 0 ? live.journey[live.journey.length - 1] : null;
    const quality     = live?.quality;

    const hasLocation = latitude != null && longitude != null && !(latitude === 0 && longitude === 0);
    const locationText = hasLocation
        ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
        : t("locationUnavailable");

    const getQrPngDataUrl = () =>
        new Promise((resolve, reject) => {
            if (!qrRef.current) { reject(new Error("QR not ready")); return; }
            qrRef.current.toDataURL((base64) => resolve(`data:image/png;base64,${base64}`));
        });

    const buildLabelHtml = (qrDataUrl) => `
        <html>
            <body style="font-family: -apple-system, Roboto, sans-serif; text-align: center; padding: 24px;">
                <h2 style="margin-bottom: 4px;">AgroChain</h2>
                <p style="color: #555; margin-top: 0;">${t("batchQrLabel")}</p>
                <img src="${qrDataUrl}" width="220" height="220" />
                <table style="margin: 16px auto; text-align: left; font-size: 14px;">
                    <tr><td style="padding: 4px 12px; color: #555;">${t("batchNumber")}</td><td style="padding: 4px 12px; font-weight: bold;">${wheatBatchID}</td></tr>
                    ${commodity ? `<tr><td style="padding: 4px 12px; color: #555;">${t("cropType")}</td><td style="padding: 4px 12px; font-weight: bold;">${cropTypeText}</td></tr>` : ""}
                    <tr><td style="padding: 4px 12px; color: #555;">${t("variety")}</td><td style="padding: 4px 12px; font-weight: bold;">${variety || "-"}</td></tr>
                    <tr><td style="padding: 4px 12px; color: #555;">${t("quantity")}</td><td style="padding: 4px 12px; font-weight: bold;">${quantity || 0} kg</td></tr>
                    <tr><td style="padding: 4px 12px; color: #555;">${t("productionDate")}</td><td style="padding: 4px 12px; font-weight: bold;">${harvestDate || "-"}</td></tr>
                    <tr><td style="padding: 4px 12px; color: #555;">${t("location")}</td><td style="padding: 4px 12px; font-weight: bold;">${locationText}</td></tr>
                    ${status ? `<tr><td style="padding: 4px 12px; color: #555;">${t("currentStatus")}</td><td style="padding: 4px 12px; font-weight: bold;">${t(STATUS_LABEL_KEYS[status] || status)}</td></tr>` : ""}
                    ${latestStop ? `<tr><td style="padding: 4px 12px; color: #555;">${t("latestCustody")}</td><td style="padding: 4px 12px; font-weight: bold;">${latestStop.entity}${latestStop.location ? ` — ${latestStop.location}` : ""}</td></tr>` : ""}
                    ${quality?.hasReport
                        ? `<tr><td style="padding: 4px 12px; color: #555;">${t("result")}</td><td style="padding: 4px 12px; font-weight: bold;">${t("grade")} ${quality.grade} — ${quality.result === "Fail" ? t("fail") : t("pass")}</td></tr>`
                        : ""}
                </table>
            </body>
        </html>
    `;

    const handlePrint = async () => {
        setBusy(true);
        try {
            const qrDataUrl = await getQrPngDataUrl();
            await Print.printAsync({ html: buildLabelHtml(qrDataUrl) });
        } catch (err) {
            Alert.alert(t("printQr"), err.message || t("printShareError"));
        } finally {
            setBusy(false);
        }
    };

    const handleShare = async () => {
        setBusy(true);
        try {
            const qrDataUrl = await getQrPngDataUrl();
            const { uri } = await Print.printToFileAsync({ html: buildLabelHtml(qrDataUrl) });
            const canShare = await Sharing.isAvailableAsync();
            if (!canShare) {
                Alert.alert(t("shareQr"), t("sharingUnavailable"));
                return;
            }
            await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
        } catch (err) {
            Alert.alert(t("shareQr"), err.message || t("printShareError"));
        } finally {
            setBusy(false);
        }
    };

    const handleDone = () => {
        if (nextScreen) navigation.navigate(nextScreen);
        else navigation.navigate("BottomTab");
    };

    return (
        <View style={styles.screen}>
            <View style={styles.appBar}>
                <Backward color="white" onPress={() => navigation.goBack()} />
                <Text style={styles.appBarTitle}>{t("batchQrTitle")}</Text>
                <View style={styles.appBarSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.hint}>{t("batchQrHint")}</Text>

                <View style={styles.card}>
                    <View style={styles.qrBox}>
                        <QRCodeSVG
                            value={wheatBatchID || "unknown"}
                            size={QR_SIZE}
                            getRef={(ref) => { qrRef.current = ref; }}
                        />
                    </View>
                    <Text style={styles.batchId}>{wheatBatchID}</Text>

                    <View style={styles.divider} />

                    {commodity && <DetailRow label={t("cropType")} value={cropTypeText} />}
                    <DetailRow label={t("variety")} value={variety || "-"} />
                    <DetailRow label={t("quantity")} value={`${quantity || 0} kg`} />
                    <DetailRow label={t("productionDate")} value={harvestDate || "-"} />
                    <DetailRow label={t("location")} value={locationText} />
                </View>

                {loadingLive ? (
                    <ActivityIndicator color="green" style={{ marginTop: height * 0.02 }} />
                ) : (status || latestStop || quality?.hasReport) ? (
                    <View style={[styles.card, { marginTop: height * 0.02 }]}>
                        <Text style={styles.sectionTitle}>{t("currentStatus")}</Text>
                        {status && (
                            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] || "#555" }]}>
                                <Text style={styles.statusBadgeText}>{t(STATUS_LABEL_KEYS[status] || status)}</Text>
                            </View>
                        )}
                        {latestStop && (
                            <DetailRow
                                label={t("latestCustody")}
                                value={latestStop.location ? `${latestStop.entity} — ${latestStop.location}` : latestStop.entity}
                            />
                        )}
                        <DetailRow
                            label={t("result")}
                            value={quality?.hasReport ? `${t("grade")} ${quality.grade} — ${quality.result === "Fail" ? t("fail") : t("pass")}` : t("notYetTested")}
                        />
                    </View>
                ) : null}

                {busy ? (
                    <ActivityIndicator size="large" color="green" style={{ marginTop: height * 0.03 }} />
                ) : (
                    <>
                        <Button
                            text={t("printQr")}
                            onPress={handlePrint}
                            width={width * 0.86}
                            backgroundColor="green"
                            color="white"
                            style={{ marginTop: height * 0.03 }}
                        />
                        <Button
                            text={t("shareQr")}
                            onPress={handleShare}
                            width={width * 0.86}
                            backgroundColor="white"
                            color="green"
                            borderWidth={2}
                            borderColor="green"
                            style={{ marginTop: height * 0.015 }}
                        />
                    </>
                )}

                <Button
                    text={t("done")}
                    onPress={busy ? undefined : handleDone}
                    width={width * 0.86}
                    backgroundColor="transparent"
                    color="#555"
                    style={{ marginTop: height * 0.02, marginBottom: height * 0.04 }}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "white" },
    appBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "green",
        paddingTop: height * 0.06,
        paddingBottom: 14,
        paddingHorizontal: width * 0.05,
    },
    appBarTitle: {
        flex: 1,
        textAlign: "center",
        color: "white",
        fontSize: FontSize.F22,
        fontWeight: "bold",
    },
    appBarSpacer: { width: 22 },
    scroll: {
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.03,
        paddingBottom: height * 0.04,
        alignItems: "center",
    },
    hint: {
        fontSize: FontSize.F13,
        color: "#666",
        textAlign: "center",
        marginBottom: height * 0.02,
        lineHeight: FontSize.F13 * 1.5,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#f7faf7",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#dCe8dC",
        padding: width * 0.06,
        alignItems: "center",
    },
    qrBox: {
        backgroundColor: "white",
        padding: 12,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: FontSize.F14,
        fontWeight: "800",
        color: "#1b5e20",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: "flex-start",
        borderRadius: 14,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    statusBadgeText: {
        color: "white",
        fontSize: FontSize.F13,
        fontWeight: "700",
    },
    batchId: {
        fontSize: FontSize.F20,
        fontWeight: "800",
        color: "#1b5e20",
        marginTop: 12,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: "#dCe8dC",
        width: "100%",
        marginVertical: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 6,
    },
    detailLabel: {
        fontSize: FontSize.F14,
        color: "#666",
    },
    detailValue: {
        fontSize: FontSize.F14,
        fontWeight: "700",
        color: "#222",
        maxWidth: "60%",
        textAlign: "right",
    },
});

export default BatchQRCode;
