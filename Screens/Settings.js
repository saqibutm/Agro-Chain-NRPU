import React, { useState } from "react";
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Linking, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Alert from "../Abstracts/Alert";
import Container from "../Abstracts/Container";
import Backward from "../Abstracts/Backward";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../Services/AuthContext";
const { width, height } = Dimensions.get("window");

const Settings = ({ navigation }) => {
    const { t, language, changeLanguage } = useI18n();
    const { signOut, deleteAccount, updateAvatar, user } = useAuth();
    const [deleting, setDeleting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const applyPickedAvatar = async (result) => {
        if (result.canceled || !result.assets?.[0]?.uri) return;
        setUploadingAvatar(true);
        try {
            await updateAvatar(result.assets[0].uri);
        } catch (err) {
            Alert.alert(t("changeAvatar"), err.message || t("avatarUpdateError"));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const pickFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(t("changeAvatar"), t("photoPermissionDenied"));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        await applyPickedAvatar(result);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(t("changeAvatar"), t("cameraPermissionDenied"));
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        await applyPickedAvatar(result);
    };

    const handleChangeAvatar = () => {
        Alert.alert(
            t("changeAvatar"),
            null,
            [
                { text: t("cancel"), style: "cancel" },
                { text: t("takePhoto"), onPress: takePhoto },
                { text: t("chooseFromLibrary"), onPress: pickFromLibrary },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t("deleteAccountConfirmTitle"),
            t("deleteAccountConfirmMessage"),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("deleteAccountConfirmButton"),
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteAccount();
                        } catch (err) {
                            Alert.alert(t("deleteAccount"), err.message || t("deleteAccountError"));
                        } finally {
                            setDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Container style={{ alignItems: "center", justifyContent: "flex-start", paddingHorizontal: width * 0.07, paddingVertical: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: height * 0.04, }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("settings")}</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={uploadingAvatar ? undefined : handleChangeAvatar}
                    style={styles.avatarWrap}
                >
                    <View style={styles.avatar}>
                        {user?.avatarUrl ? (
                            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarEmoji}>🧑🏽‍🌾</Text>
                        )}
                        {uploadingAvatar && (
                            <View style={styles.avatarOverlay}>
                                <ActivityIndicator color="white" />
                            </View>
                        )}
                    </View>
                    <View style={styles.avatarEditBadge}>
                        <Text style={styles.avatarEditBadgeText}>✎</Text>
                    </View>
                </TouchableOpacity>
                <Text style={{ fontSize: FontSize.F22, fontWeight: "700", marginTop: 10 }}>{user?.username || t("farmer")}</Text>
            </View>

            {/* Language selector */}
            <Text style={styles.sectionLabel}>{t("language")}</Text>
            <View style={styles.langRow}>
                <TouchableOpacity
                    style={[styles.langBtn, language === "en" && styles.langBtnActive]}
                    onPress={() => changeLanguage("en")}
                >
                    <Text style={[styles.langText, language === "en" && styles.langTextActive]}>
                        {t("english")}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.langBtn, language === "ur" && styles.langBtnActive]}
                    onPress={() => changeLanguage("ur")}
                >
                    <Text style={[styles.langText, language === "ur" && styles.langTextActive]}>
                        {t("urdu")}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.btn, { marginTop: height * 0.03 }]} onPress={() => navigation.navigate("About")}>
                <Text style={{ color: "green", fontSize: FontSize.F19, fontWeight: "600" }}>{t("about")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => Linking.openURL("mailto:saqibutm@outlook.com").catch(() =>
                    Alert.alert(t("contactUs"), "saqibutm@outlook.com")
                )}
            >
                <Text style={{ color: "green", fontSize: FontSize.F19, fontWeight: "600" }}>{t("contactUs")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.btn}
                onPress={() => Linking.openURL("https://wa.me/923001750077").catch(() =>
                    Alert.alert(t("contactWhatsapp"), "Could not open WhatsApp. Please make sure it's installed.")
                )}
            >
                <Text style={{ color: "green", fontSize: FontSize.F19, fontWeight: "600" }}>{t("contactWhatsapp")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "red", borderWidth: 0 }]} onPress={signOut}>
                <Text style={{ color: "white", fontSize: FontSize.F19, fontWeight: "500" }}>{t("logout")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.btn, { borderColor: "red" }]}
                onPress={deleting ? undefined : handleDeleteAccount}
            >
                <Text style={{ color: "red", fontSize: FontSize.F19, fontWeight: "500" }}>
                    {deleting ? t("deletingAccount") : t("deleteAccount")}
                </Text>
            </TouchableOpacity>
        </Container>
    );
};

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F28,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1
    },
    sectionLabel: {
        fontSize: FontSize.F18,
        fontWeight: "600",
        color: "green",
        alignSelf: "flex-start",
        marginTop: height * 0.04,
        marginBottom: height * 0.01,
    },
    avatarWrap: {
        width: 100,
        height: 100,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#e8f5e9",
        borderWidth: 2,
        borderColor: "green",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    avatarEmoji: {
        fontSize: 54,
        lineHeight: 64,
    },
    avatarOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.45)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarEditBadge: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "green",
        borderWidth: 2,
        borderColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarEditBadgeText: {
        color: "white",
        fontSize: FontSize.F14,
        fontWeight: "700",
    },
    langRow: {
        flexDirection: "row",
        gap: 12,
        width: width * 0.8,
    },
    langBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: "green",
        paddingVertical: 12,
        borderRadius: width * 0.024,
        alignItems: "center",
    },
    langBtnActive: {
        backgroundColor: "green",
    },
    langText: {
        color: "green",
        fontSize: FontSize.F18,
        fontWeight: "600",
    },
    langTextActive: {
        color: "white",
    },
    btn: {
        borderWidth: 2,
        borderColor: "green",
        padding: 10,
        marginVertical: height * 0.01,
        borderRadius: width * 0.024,
        alignItems: "center",
        width: width * 0.8,
    }
})

export default Settings;
