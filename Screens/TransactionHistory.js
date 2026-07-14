import React, { useEffect, useState, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View, Dimensions, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import Backward from "../Abstracts/Backward";
import { queryAllWheatBatches } from "../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../Services/config";
import { useAuth } from "../Services/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { ALL_PRODUCTS } from "../Services/demoData";
import { cacheGet, cacheSet, CacheKeys } from "../Services/cache";
const { width, height } = Dimensions.get("window");

const TransactionHistory = ({ navigation }) => {
    const { t } = useI18n();
    const { user } = useAuth();
    const username = user?.username || DEFAULT_USERNAME;

    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cachedAt, setCachedAt] = useState(null);

    const load = useCallback(async (isRefresh = false) => {
        if (!isRefresh) {
            const cached = await cacheGet(CacheKeys.WHEAT_BATCHES);
            if (cached) {
                setBatches(cached.data);
                setCachedAt(cached.savedAt);
                setLoading(false);
            }
        }

        try {
            let data;
            if (DEMO_MODE) {
                data = ALL_PRODUCTS.map(p => ({
                    batchID: p.productID,
                    batchNumber: p.productID,
                    entityID: p.farmOrigin?.farmer || "—",
                    district: p.farmOrigin?.district || "—",
                    date: p.productionDate || "—",
                    cropType: p.commodity || "Wheat",
                    status: p.status || "Delivered",
                }));
            } else {
                const raw = await queryAllWheatBatches(username);
                const batches = Array.isArray(raw) ? raw : (raw?.batches ?? []);
                data = batches.map((b) => ({
                    batchID:     b.productID || b.wheatBatchID,
                    batchNumber: b.wheatBatchID || b.productID,
                    entityID:    b.entityID || "—",
                    district:    "—",
                    date:        b.harvestDate || b.productionDate || "—",
                    cropType:    b.commodity === "sugarcane" ? t("sugarcane") : t("wheat"),
                    status:      b.status || "Created",
                }));
            }
            setBatches(data);
            setCachedAt(Date.now());
            await cacheSet(CacheKeys.WHEAT_BATCHES, data);
        } catch {
            // Keep cached/demo data on error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [username]);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(true); };

    const formatAge = (ts) => {
        if (!ts) return "";
        const mins = Math.floor((Date.now() - ts) / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("transactionHistory")}</Text>
            </View>
            {cachedAt && (
                <Text style={styles.syncNote}>{t("lastSynced")} {formatAge(cachedAt)}</Text>
            )}
            {loading ? (
                <ActivityIndicator size="large" color="green" style={{ marginTop: height * 0.1 }} />
            ) : batches.length === 0 ? (
                <Text style={styles.empty}>{t("noData")}</Text>
            ) : (
                <ScrollView
                    style={{ marginTop: height * 0.02 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="green" />}
                >
                    {batches.map((item, index) => (
                        <TouchableOpacity
                            key={item.batchID || index}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate("ProductDetail", { productID: item.batchID })}
                            style={[styles.item, index === batches.length - 1 && { borderBottomWidth: 0, paddingBottom: height * 0.03 }]}
                        >
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View>
                                    <Text style={styles.id}>{t("batchId")}: {item.batchNumber || item.batchID}</Text>
                                    <Text style={styles.sub}>{t("farmer")}: {item.entityID}</Text>
                                </View>
                                <Text style={styles.date}>{item.date}</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 2 }}>
                                <Text style={styles.location}>{item.district}</Text>
                                <Text style={[styles.status, item.status === "Delivered" && styles.statusDone]}>{item.status}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1
    },
    syncNote: {
        textAlign: "center",
        color: "#888",
        fontSize: 12,
        marginTop: 4,
    },
    empty: {
        textAlign: "center",
        color: "#888",
        marginTop: height * 0.1,
        fontSize: 16,
    },
    item: {
        marginVertical: height * 0.01,
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
        paddingBottom: 6,
    },
    id: {
        fontWeight: "600",
        fontSize: 15,
    },
    sub: {
        fontSize: 14,
        color: "gray",
    },
    date: {
        fontWeight: "600",
        fontSize: 13,
        color: "#444",
    },
    location: {
        color: "#575757",
        fontSize: 13,
    },
    status: {
        fontSize: 12,
        fontWeight: "600",
        color: "gray",
    },
    statusDone: {
        color: "green",
    },
})

export default TransactionHistory
