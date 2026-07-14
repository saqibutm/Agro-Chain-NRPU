import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import QRCodeSVG from "react-native-qrcode-svg";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Alert from "../../Abstracts/Alert";
import Backward from "../../Abstracts/Backward";
import Button from "../../Abstracts/Button";
import { FontSize } from "../../Abstracts/Theme";
import { useI18n } from "../../i18n/I18nContext";

const { width, height } = Dimensions.get("window");
const QR_SIZE = Math.min(width * 0.6, 240);

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
    </View>
);

// Shown right after a farmer creates a batch (Screens/Shared/AddWheatBatch.js).
// The QR itself only ever encodes the bare batch ID — QRScanner.js and every
// downstream role (mill/lab/regulator/consumer) look up the full record from
// wheat_batches by that ID, so this is the one code that has to stay stable
// and scannable through the whole physical supply chain. Variety/quantity/
// location are printed as human-readable text around it, not inside the code.
const BatchQRCode = ({ navigation, route }) => {
    const { t } = useI18n();
    const qrRef = useRef(null);
    const [busy, setBusy] = useState(false);

    const {
        wheatBatchID = "",
        variety = "",
        quantity = "",
        harvestDate = "",
        latitude = null,
        longitude = null,
        nextScreen = null,
    } = route.params || {};

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
                    <tr><td style="padding: 4px 12px; color: #555;">${t("variety")}</td><td style="padding: 4px 12px; font-weight: bold;">${variety || "-"}</td></tr>
                    <tr><td style="padding: 4px 12px; color: #555;">${t("quantity")}</td><td style="padding: 4px 12px; font-weight: bold;">${quantity || 0} kg</td></tr>
                    <tr><td style="padding: 4px 12px; color: #555;">${t("productionDate")}</td><td style="padding: 4px 12px; font-weight: bold;">${harvestDate || "-"}</td></tr>
                    <tr><td style="padding: 4px 12px; color: #555;">${t("location")}</td><td style="padding: 4px 12px; font-weight: bold;">${locationText}</td></tr>
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

                    <DetailRow label={t("variety")} value={variety || "-"} />
                    <DetailRow label={t("quantity")} value={`${quantity || 0} kg`} />
                    <DetailRow label={t("productionDate")} value={harvestDate || "-"} />
                    <DetailRow label={t("location")} value={locationText} />
                </View>

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
