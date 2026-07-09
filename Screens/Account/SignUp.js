import React, { useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import Alert from "../../Abstracts/Alert";
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { FontSize } from "../../Abstracts/Theme";
import { useI18n } from "../../i18n/I18nContext";
import { useAuth } from "../../Services/AuthContext";
import { supabase } from "../../Services/supabase";
import { DEMO_MODE } from "../../Services/config";
import { ROLES, authStyles, PHONE_RE } from "./AuthShared";
const { width, height } = Dimensions.get("window");

export default function SignUp({ navigation }) {
    const { t } = useI18n();
    const { signIn, adoptSession } = useAuth();
    const [phone, setPhone]                     = useState("");
    const [password, setPassword]               = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole]                       = useState("farmer");
    const [submitting, setSubmitting]           = useState(false);

    const handleSignUp = async () => {
        const normalizedPhone = phone.trim();

        if (!normalizedPhone || !password || !confirmPassword) {
            Alert.alert(t("missingFields"), t("enterCredentials"));
            return;
        }
        if (!PHONE_RE.test(normalizedPhone)) {
            Alert.alert(t("signUp"), t("invalidMobileNumber"));
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert(t("signUp"), t("passwordMismatch"));
            return;
        }
        if (password.length < 6) {
            Alert.alert(t("signUp"), t("passwordTooShort"));
            return;
        }

        setSubmitting(true);
        try {
            if (DEMO_MODE) {
                // In demo mode just sign in with the provided credentials.
                await signIn(normalizedPhone, password, role);
                return;
            }

            const email = `${normalizedPhone}@agrochain.local`;
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: normalizedPhone, role } },
            });
            if (error) throw error;

            if (data.session) {
                // Email confirmation is disabled, so signUp already returned an
                // authenticated session — adopt it directly instead of paying
                // for a second signInWithPassword round trip.
                await adoptSession(data.user.id, normalizedPhone, role);
            } else {
                // Supabase requires email confirmation before a session exists.
                // (Authentication → Settings → Disable email confirmations to skip this.)
                Alert.alert(
                    t("accountCreated"),
                    "Account created. If you cannot sign in, ask your administrator to confirm your account in the Supabase dashboard.",
                    [{ text: "Sign In", onPress: () => navigation.navigate("SingIn") }]
                );
            }
        } catch (err) {
            Alert.alert(t("signUp"), err.message || "Could not create account.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container style={{ alignItems: "center", justifyContent: "flex-start", paddingHorizontal: width * 0.02, paddingVertical: height * 0.02, flex: 1 }}>
            <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: height * 0.04 }} showsVerticalScrollIndicator={false}>
                <Image source={require("../../Images/Logo.png")} resizeMode="contain" style={{ width: width * 0.55, height: height * 0.2 }} />
                <Text style={styles.headText}>{t("appName")}</Text>
                <Text style={styles.titleText}>{t("createAccount")}</Text>

                <Input
                    style={{ marginTop: height * 0.02 }}
                    value={phone}
                    setValue={setPhone}
                    placeholder={t("mobileNumber")}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.014}
                    backgroundColor="white"
                    keyboardType="number-pad"
                    maxLength={11}
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
                    backgroundColor="white"
                    secureTextEntry
                />
                <Input
                    style={{ marginTop: height * 0.015 }}
                    value={confirmPassword}
                    setValue={setConfirmPassword}
                    placeholder={t("confirmPassword")}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.014}
                    backgroundColor="white"
                    secureTextEntry
                />

                {/* Role selector */}
                <Text style={authStyles.roleLabel}>{t("selectRole")}</Text>
                <View style={authStyles.roleGrid}>
                    {ROLES.map((r) => (
                        <TouchableOpacity
                            key={r.key}
                            activeOpacity={0.8}
                            style={[authStyles.roleBtn, role === r.key && authStyles.roleBtnActive]}
                            onPress={() => setRole(r.key)}
                        >
                            <Text style={[authStyles.roleTxt, role === r.key && authStyles.roleTxtActive]}>
                                {t(r.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    text={submitting ? t("signingUp") : t("signUp")}
                    width={width * 0.86}
                    onPress={submitting ? undefined : handleSignUp}
                    backgroundColor="green"
                    color="white"
                    style={{ marginTop: height * 0.03 }}
                />

                <Text style={authStyles.switchText}>
                    {t("alreadyHaveAccount")}{" "}
                    <Text style={authStyles.switchLink} onPress={() => navigation.navigate("SingIn")}>
                        {t("login")}
                    </Text>
                </Text>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F36,
        fontWeight: "bold",
        color: "green",
        marginBottom: height * 0.005,
        marginTop: -height * 0.005,
    },
    titleText: {
        fontSize: FontSize.F24,
        fontWeight: "600",
        color: "green",
        marginBottom: 6,
    },
});
