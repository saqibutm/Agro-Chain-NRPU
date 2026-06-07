import React, { useState, useEffect, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View, Dimensions, RefreshControl, TouchableOpacity } from 'react-native'
import Backward from "../Abstracts/Backward";
import { FontSize } from '../Abstracts/Theme';
import { useI18n } from '../i18n/I18nContext';
import { useSync } from '../Services/SyncContext';
import { useAuth } from '../Services/AuthContext';
import { queryAllProducts } from '../Services/api';
import { DEFAULT_USERNAME, DEMO_MODE } from '../Services/config';
import { getTrackingItems } from '../Services/demoData';
const { width, height } = Dimensions.get("window");

// Fallback sample shown when the backend is unreachable.
const sampleData = [
    { id: "ABC", name: "Sunshine Flour Mills", stage: "Crop ID", date: "20-08-2024" },
    { id: "DEF", name: "Metro Distribution", stage: "Product ID", date: "20-08-2024" },
    { id: "GHI", name: "Al-Fatah Store", stage: "Product ID", date: "20-08-2024" },
];

const SupplyChainTracking = ({ navigation }) => {
    const { t } = useI18n();
    const { isOnline } = useSync();
    const { user } = useAuth();
    const username = user?.username || DEFAULT_USERNAME;
    const [items, setItems] = useState(DEMO_MODE ? getTrackingItems() : sampleData);
    const [loading, setLoading] = useState(false);
    const [live, setLive] = useState(DEMO_MODE);

    const loadData = useCallback(async () => {
        if (DEMO_MODE) { setItems(getTrackingItems()); setLive(true); return; }
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
            }
        } catch (e) {
            setLive(false); // keep sample data
        } finally {
            setLoading(false);
        }
    }, [isOnline, username]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <View style={{ flex: 1, paddingHorizontal: width * 0.05, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("supplyChainTracking")}</Text>
            </View>
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
