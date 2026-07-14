import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import Alert from "../../Abstracts/Alert";
import Container from "../../Abstracts/Container";
import Backward from "../../Abstracts/Backward";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import SyncStatusBar from "../../Abstracts/SyncStatusBar";
import { FontSize } from "../../Abstracts/Theme";
import { useI18n } from "../../i18n/I18nContext";
import { useSync } from "../../Services/SyncContext";
import { Actions, queryMyMills, deleteMillLocation } from "../../Services/api";
import { getCurrentLocation } from "../../Services/location";
import { DEMO_MODE } from "../../Services/config";

const { width, height } = Dimensions.get("window");

// Read-only sample rows shown in demo mode — there's no backend configured to
// persist to, so "adding" a mill there only ever lives in local state.
const DEMO_MILLS = [
    { id: "demo-1", name: "Faisalabad Flour Mills", location: "Faisalabad" },
    { id: "demo-2", name: "JDW Sugar Mills", location: "Rahim Yar Khan" },
];

// Lets a mill operator register the physical mill location(s) they run, so
// Screens/Mill/Add.js (recording a batch transfer) can offer a picker
// instead of free-typing the name/location on every single transfer.
const ManageMills = ({ navigation }) => {
    const { t } = useI18n();
    const { submit } = useSync();
    const [mills, setMills] = useState(DEMO_MODE ? DEMO_MILLS : []);
    const [loading, setLoading] = useState(!DEMO_MODE);
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        if (DEMO_MODE) return;
        setLoading(true);
        try {
            const { mills: rows } = await queryMyMills();
            setMills(rows);
        } catch (err) {
            Alert.alert(t("myMills"), err.message);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            Alert.alert(t("missingFields"), t("millNameRequired"));
            return;
        }

        if (DEMO_MODE) {
            setMills((m) => [...m, { id: `demo-${Date.now()}`, name: trimmedName, location: location.trim() }]);
            setName("");
            setLocation("");
            return;
        }

        setSubmitting(true);
        const { latitude, longitude } = await getCurrentLocation();
        const payload = { name: trimmedName, location: location.trim() || null, latitude, longitude };
        const { mode, error } = await submit(Actions.CREATE_MILL_LOCATION, payload);
        setSubmitting(false);

        if (mode === "failed") {
            // e.g. this operator already has a mill by that name — won't
            // resolve by retrying, so surface it now instead of queuing forever.
            Alert.alert(t("myMills"), error);
            return;
        }

        setName("");
        setLocation("");
        if (mode === "queued") {
            // Not on the server yet — show it now so the operator sees it was
            // captured, but it won't survive a reload until sync catches up.
            setMills((m) => [...m, { id: `pending-${Date.now()}`, ...payload, pending: true }]);
            Alert.alert(t("savedOffline"), error ? `${t("offlineQueue")}\n(${error})` : t("offlineQueue"));
        } else {
            await load();
        }
    };

    const handleDelete = (mill) => {
        if (mill.pending || DEMO_MODE) {
            // Not on the server yet (or demo mode has no server) — just drop it locally.
            setMills((m) => m.filter((x) => x.id !== mill.id));
            return;
        }
        Alert.alert(
            t("removeMill"),
            t("removeMillConfirm"),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("remove"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMillLocation(mill.id);
                            setMills((m) => m.filter((x) => x.id !== mill.id));
                        } catch (err) {
                            Alert.alert(t("myMills"), err.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Container style={{ paddingHorizontal: 0, paddingVertical: 0, flex: 1 }}>
            <SyncStatusBar />
            <View style={styles.header}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("myMills")}</Text>
            </View>

            <FlatList
                data={mills}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingHorizontal: width * 0.06, paddingBottom: height * 0.05 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.form}>
                        <Text style={styles.formTitle}>{t("addMillLocation")}</Text>
                        <Input
                            style={{ borderBottomWidth: 1, marginVertical: 6 }}
                            value={name}
                            setValue={setName}
                            placeholder={t("millName")}
                            width={width * 0.86}
                            fontSize={FontSize.F17}
                            borderRadius={0}
                            borderWidth={0}
                        />
                        <Input
                            style={{ borderBottomWidth: 1, marginVertical: 6 }}
                            value={location}
                            setValue={setLocation}
                            placeholder={t("location")}
                            width={width * 0.86}
                            fontSize={FontSize.F17}
                            borderRadius={0}
                            borderWidth={0}
                        />
                        <Button
                            text={submitting ? "…" : t("addMillLocation")}
                            onPress={submitting ? undefined : handleAdd}
                            width={width * 0.86}
                            color="white"
                            backgroundColor="green"
                            style={{ marginTop: height * 0.015, marginBottom: height * 0.02 }}
                        />
                        {loading && <ActivityIndicator color="green" style={{ marginBottom: 10 }} />}
                        {!loading && mills.length === 0 && (
                            <Text style={styles.empty}>{t("noMillsYet")}</Text>
                        )}
                        {mills.length > 0 && <Text style={styles.listLabel}>{t("myMills")}</Text>}
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.millName}>
                                {item.name}{item.pending ? ` (${t("pendingChanges")})` : ""}
                            </Text>
                            {!!item.location && <Text style={styles.millLocation}>{item.location}</Text>}
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                            <Text style={styles.deleteText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </Container>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: width * 0.05, paddingTop: height * 0.06, paddingBottom: height * 0.015,
    },
    headText: { fontSize: FontSize.F24, fontWeight: "bold", textAlign: "center", flex: 1 },
    form: { alignItems: "center", paddingTop: height * 0.01 },
    formTitle: { fontSize: FontSize.F18, color: "green", fontWeight: "600", alignSelf: "flex-start", marginBottom: 6 },
    empty: { fontSize: FontSize.F14, color: "#888", textAlign: "center", marginTop: 4, marginBottom: 10 },
    listLabel: {
        fontSize: FontSize.F13, fontWeight: "700", color: "#888", textTransform: "uppercase",
        letterSpacing: 0.5, alignSelf: "flex-start", marginTop: 6, marginBottom: 8,
    },
    row: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        width: width * 0.86, alignSelf: "center",
        paddingVertical: 12, paddingHorizontal: 14,
        backgroundColor: "#f7faf7", borderRadius: 10, borderWidth: 1, borderColor: "#dCe8dC",
        marginBottom: 10,
    },
    millName: { fontSize: FontSize.F16, fontWeight: "700", color: "#1b5e20" },
    millLocation: { fontSize: FontSize.F13, color: "#666", marginTop: 2 },
    deleteBtn: {
        width: 30, height: 30, borderRadius: 15, backgroundColor: "#fdecea",
        alignItems: "center", justifyContent: "center", marginLeft: 10,
    },
    deleteText: { color: "#c62828", fontSize: FontSize.F16, fontWeight: "700" },
});

export default ManageMills;
