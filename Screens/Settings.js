import React from "react";
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import Container from "../Abstracts/Container";
import Backward from "../Abstracts/Backward";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../Services/AuthContext";
const { width, height } = Dimensions.get("window");

const Settings = ({ navigation }) => {
    const { t, language, changeLanguage } = useI18n();
    const { signOut } = useAuth();

    return (
        <Container style={{ alignItems: "center", justifyContent: "flex-start", paddingHorizontal: width * 0.07, paddingVertical: 10, flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: height * 0.04, }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>{t("settings")}</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                {/* Farmer avatar. To use a real photo instead, drop an image at
                    Images/farmer.jpg and replace this View with:
                    <Image source={require("../Images/farmer.jpg")} style={styles.avatar} /> */}
                <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>🧑🏽‍🌾</Text>
                </View>
                <Text style={{ fontSize: FontSize.F22, fontWeight: "700", marginTop: 10 }}>Aslam</Text>
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
            <TouchableOpacity style={[styles.btn, { backgroundColor: "red", borderWidth: 0 }]} onPress={signOut}>
                <Text style={{ color: "white", fontSize: FontSize.F19, fontWeight: "500" }}>{t("logout")}</Text>
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
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#e8f5e9",
        borderWidth: 2,
        borderColor: "green",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarEmoji: {
        fontSize: 54,
        lineHeight: 64,
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
