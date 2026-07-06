import React, { useState, useEffect, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View, Dimensions, RefreshControl, TouchableOpacity } from 'react-native'
import Backward from "../Abstracts/Backward";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
import { FontSize } from '../Abstracts/Theme';
import { useI18n } from '../i18n/I18nContext';
import { useSync } from '../Services/SyncContext';
import { useAuth } from '../Services/AuthContext';
import { queryAllProducts } from '../Services/api';
import { DEFAULT_USERNAME, DEMO_MODE } from '../Services/config';
import { getTrackingItems } from '../Services/demoData';
import { cacheGet, cacheSet, CacheKeys } from '../Services/cache';
const { width, height } = Dimensions.get("window");

const SupplyChainTracking = ({ navigation }) => {
    const { t } = useI18n();
    const { isOnline } = useSync();
    const { user } = useAuth();
    const username = user?.username || DEFAULT_USERNAME;
    const [items, setItems] = useState(DEMO_MODE ? getTrackingItems() : []);
    const [loading, setLoading] = useState(!DEMO_MODE);
    const [live, setLive] = useState(DEMO_MODE);
    const [cachedAt, setCachedAt] = useState(null);

    const loadData = useCallback(async () => {
        if (DEMO_MODE) { setItems(getTrackingItems()); setLive(true); return; }

        const cached = await cacheGet(CacheKeys.PRODUCTS);
        if (cached) {
            setItems(cached.data);
            setCachedAt(cached.savedAt);
            setLive(false);
        }

        if (!isOnline) return;
        setLoading(true);
        try {
            const res = await queryAllProducts(username);
            const mapped = (res.products || []).map((p) => ({
                id: p.productID,
                name: p.productName || p.productType || "—",
                stage: "Product ID",
                date: p.productionDate || "",
                product: p,
            }));
            if (mapped.length) {
                setItems(mapped);
                setLive(true);
                setCachedAt(null);
                await cacheSet(CacheKeys.PRODUCTS, mapped);
            }
        } catch (e) {
            if (!cached) setLive(false);
        } finally {
            setLoading(false);
        }
    }, [isOnline, username]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <View style={{ flex: 1, paddingHorizontal: width * 0.05, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <SyncStatusBar />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("supplyChainTracking")}</Text>
            </View>
            {cachedAt && (
                <Text style={{ fontSize: 11, color: "#888", textAlign: "center", marginBottom: 4 }}>
                    Last synced {Math.round((Date.now() - cachedAt) / 60000)}m ago
                </Text>
            )}
            <ScrollView
                style={{ marginTop: height * 0.02 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={["green"]} />}
            >
                {items.length === 0 ? (
                    <Text style={styles.empty}>{t("noData")}</Text>
                ) : (
                    items.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={live ? 0.7 : 1}
                            onPress={live ? () => navigation.navigate("ProductJourney", { productID: item.id }) : undefined}
                            style={[styles.transactionItem, index === items.length - 1 ? { borderBottomWidth: 0, paddingBottom: height * 0.03 } : { borderBottomWidth: 2 }]}
                        >
                            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: height * 0.01, paddingBottom: height * 0.008 }}>
                                <View>
                                    <Text style={{ fontWeight: "600", fontSize: FontSize.F16 }}>{item.stage} {item.id}</Text>
                                    <Text style={{ fontWeight: "700", fontSize: FontSize.F16, color: "gray" }}>{t("companyName")}: {item.name}</Text>
                                </View>
                                <Text style={{ fontWeight: "600", fontSize: FontSize.F14 }}>{t("date")}: {item.date}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F24,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
    },
    transactionItem: {
        marginVertical: height * 0.01,
        borderBottomColor: "lightgray",
        paddingBottom: 6
    },
    empty: { textAlign: "center", marginTop: height * 0.1, fontSize: FontSize.F18, color: "gray" },
})

export default SupplyChainTracking
