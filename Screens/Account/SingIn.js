import React, { useState } from "react";
import { View, Text, Dimensions, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { Colors, FontSize } from '../../Abstracts/Theme'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../Services/AuthContext'
const { width, height } = Dimensions.get("window");

const ROLES = [
    { key: "farmer",    labelKey: "farmer"        },
    { key: "mill",      labelKey: "roleMill"       },
    { key: "lab",       labelKey: "roleLab"        },
    { key: "regulator", labelKey: "roleRegulator"  },
    { key: "consumer",  labelKey: "roleConsumer"   },
    { key: "admin",     labelKey: "roleAdmin"      },
];

export default function SingIn({ navigation }) {
    const { t } = useI18n();
    const { signIn } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("farmer");
    const [submitting, setSubmitting] = useState(false);

    const handleSingIn = async () => {
        if (!username.trim() || !password) {
            Alert.alert(t("loginFailed"), t("enterCredentials"));
            return;
        }
        setSubmitting(true);
        try {
            await signIn(username, password, role);
        } catch (error) {
            Alert.alert(t("loginFailed"), error.message || "Invalid username or password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container style={{ alignItems: "center", justifyContent: "flex-start", paddingHorizontal: width * 0.02, paddingVertical: height * 0.02, flex: 1 }}>
            <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: height * 0.04 }} showsVerticalScrollIndicator={false}>
                <Image source={require("../../Images/Logo.png")} resizeMode="contain" style={{ width: width * 0.6, height: height * 0.25 }} />
                <Text style={styles.headText}>{t("appName")}</Text>
                <Text style={styles.loginText}>{t("login")}</Text>
                <Input
                    style={{ marginTop: height * 0.02 }}
                    value={username}
                    setValue={setUsername}
                    placeholder={t("username")}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.014}
                    backgroundColor={"white"}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <Input
                    style={{ marginTop: height * 0.015 }}
                    value={password}
                    setValue={setPassword}
                    placeholder={t("password")}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.014}
                    backgroundColor={"white"}
                    secureTextEntry
                />
                <Text style={styles.forgotText} onPress={() => navigation.navigate("ForgetPassword")}>{t("forgotPassword")}</Text>

                {/* Role selector */}
                <Text style={styles.roleLabel}>{t("selectRole")}</Text>
                <View style={styles.roleGrid}>
                    {ROLES.map((r) => (
                        <TouchableOpacity
                            key={r.key}
                            activeOpacity={0.8}
                            style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
                            onPress={() => setRole(r.key)}
                        >
                            <Text style={[styles.roleTxt, role === r.key && styles.roleTxtActive]}>
                                {t(r.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    text={submitting ? t("signingIn") : t("submit")}
                    width={width * 0.86}
                    onPress={submitting ? undefined : handleSingIn}
                    backgroundColor={"green"}
                    color={"white"}
                    style={{ marginTop: height * 0.03 }}
                />
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F40,
        fontWeight: "bold",
        marginBottom: height * 0.01,
        marginTop: -height * 0.01,
        color: "green",
    },
    loginText: {
        fontSize: FontSize.F28,
        fontWeight: "600",
        marginBottom: 10,
        color: "green",
    },
    forgotText: {
        textAlign: "right",
        fontSize: FontSize.F17,
        marginTop: height * 0.01,
        width: width * 0.85,
    },
    roleLabel: {
        alignSelf: "flex-start",
        marginLeft: width * 0.07,
        marginTop: height * 0.025,
        marginBottom: height * 0.01,
        fontSize: FontSize.F16,
        fontWeight: "600",
        color: "green",
    },
    roleGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: width * 0.86,
        gap: 10,
    },
    roleBtn: {
        borderWidth: 1.5,
        borderColor: "green",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    roleBtnActive: {
        backgroundColor: "green",
    },
    roleTxt: {
        color: "green",
        fontSize: FontSize.F15,
        fontWeight: "600",
    },
    roleTxtActive: {
        color: "white",
    },
})
