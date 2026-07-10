import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, View, Image, ActivityIndicator, ScrollView } from 'react-native'
import Backward from "../Abstracts/Backward";
import Container from "../Abstracts/Container";
import Button from "../Abstracts/Button";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
import { FontSize } from '../Abstracts/Theme';
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../Services/AuthContext";
import { useSync } from "../Services/SyncContext";
import { queryProduct } from "../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../Services/config";
import { ALL_PRODUCTS, getProductById } from "../Services/demoData";
import { cacheGet, cacheSet, CacheKeys } from "../Services/cache";
const { width, height } = Dimensions.get("window");

const Row = ({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "—"}</Text>
    </View>
);

const ProductDetail = ({ route, navigation }) => {
    const { t } = useI18n();
    const { user } = useAuth();
    const { isOnline } = useSync();
    const username = user?.username || DEFAULT_USERNAME;

    const productID = route?.params?.productID;
    const imageUri = route?.params?.imageUri;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(!!productID);
    const [error, setError] = useState(null);
    const [cachedAt, setCachedAt] = useState(null);

    useEffect(() => {
        if (!productID) return;

        (async () => {
            if (DEMO_MODE) {
                setProduct(getProductById(productID) || ALL_PRODUCTS[0]);
                setLoading(false);
                return;
            }

            // Show the last-known copy immediately, offline or not, so the
            // screen isn't blank while (or if) the live fetch runs.
            const cached = await cacheGet(CacheKeys.product(productID) + ":detail");
            if (cached) {
                setProduct(cached.data.product ?? cached.data);
                setCachedAt(cached.savedAt);
                setLoading(false);
            }

            if (!isOnline) {
                if (!cached) setLoading(false);
                return;
            }

            try {
                const res = await queryProduct(username, productID);
                const data = res?.product ?? res;
                setProduct(data);
                setCachedAt(null);
                setError(null);
                await cacheSet(CacheKeys.product(productID) + ":detail", { product: data });
            } catch (e) {
                if (!cached) setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [productID, username, isOnline]);

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="green" style={{ marginTop: height * 0.1 }} />;
        }
        if (error) {
            return <Text style={styles.error}>{t("noProduct")}: {error}</Text>;
        }
        if (!product && !imageUri) {
            return <Text style={styles.error}>{t("noProduct")}</Text>;
        }

        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {imageUri && (
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.photo}
                        resizeMode="cover"
                    />
                )}
                {cachedAt && (
                    <Text style={styles.cachedNote}>
                        Last synced {Math.round((Date.now() - cachedAt) / 60000)}m ago
                    </Text>
                )}
                {product && (
                    <>
                        <Row label={t("batchId")} value={product.productID || product.wheatBatchID} />
                        <Row label={t("cropName")} value={product.productName || product.commodity || "Wheat"} />
                        <Row label={t("farmerName")} value={product.farmOrigin?.farmer || product.entityID} />
                        <Row label={t("district")} value={product.farmOrigin?.district || product.location} />
                        <Row label={t("harvestDate")} value={product.productionDate || product.harvestDate} />
                        <Row label={t("quantity")} value={product.quantity ? `${product.quantity} kg` : null} />
                        <Row label={t("variety")} value={product.variety} />
                    </>
                )}
                {product?.productID && (
                    <Button
                        text={t("viewOnMap")}
                        width={width * 0.88}
                        color={"white"}
                        backgroundColor={"green"}
                        style={{ marginTop: height * 0.03, marginBottom: height * 0.04 }}
                        onPress={() => navigation.navigate("MapScreen", { productID: product.productID })}
                    />
                )}
                {product?.productID && (
                    <Button
                        text={t("productJourney")}
                        width={width * 0.88}
                        color={"green"}
                        backgroundColor={"white"}
                        style={{ marginBottom: height * 0.04, borderWidth: 1.5, borderColor: "green" }}
                        onPress={() => navigation.navigate("ProductJourney", { productID: product.productID })}
                    />
                )}
            </ScrollView>
        );
    };

    return (
        <View style={{ flex: 1, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <View style={{
                flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
                justifyContent: "space-between", width: width * 0.9, paddingHorizontal: width * 0.05
            }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("productDetails")}</Text>
            </View>
            <SyncStatusBar />
            <Container style={{ flex: 1, marginTop: height * 0.03, paddingHorizontal: width * 0.06 }}>
                {renderContent()}
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F26,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    row: {
        flexDirection: "row",
        paddingVertical: height * 0.012,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e0e0e0",
    },
    label: {
        fontSize: FontSize.F18,
        fontWeight: "600",
        width: width * 0.38,
        color: "#555",
    },
    value: {
        fontSize: FontSize.F18,
        fontWeight: "400",
        flex: 1,
    },
    photo: {
        width: "100%",
        height: height * 0.3,
        borderRadius: 10,
        marginBottom: height * 0.02,
    },
    error: {
        textAlign: "center",
        color: "#888",
        marginTop: height * 0.08,
        fontSize: 16,
    },
    cachedNote: {
        textAlign: "center",
        color: "#888",
        fontSize: FontSize.F13,
        marginBottom: height * 0.015,
    },
})

export default ProductDetail
