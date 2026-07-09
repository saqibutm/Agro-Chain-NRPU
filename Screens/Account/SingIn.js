import React, { useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import Alert from "../../Abstracts/Alert";
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { Colors, FontSize } from '../../Abstracts/Theme'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../Services/AuthContext'
import { ROLES, authStyles, PHONE_RE } from './AuthShared'
const { width, height } = Dimensions.get("window");

export default function SingIn({ navigation }) {
    const { t } = useI18n();
    const { signIn } = useAuth();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("farmer");
    const [submitting, setSubmitting] = useState(false);

    const handleSingIn = async () => {
        if (!phone.trim() || !password) {
            Alert.alert(t("loginFailed"), t("enterCredentials"));
            return;
        }
        if (!PHONE_RE.test(phone.trim())) {
            Alert.alert(t("loginFailed"), t("invalidMobileNumber"));
            return;
        }
        setSubmitting(true);
        try {
            await signIn(phone.trim(), password, role);
        } catch (error) {
            Alert.alert(t("loginFailed"), error.message || "Invalid mobile number or password");
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
                    value={phone}
                    setValue={setPhone}
                    placeholder={t("mobileNumber")}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.014}
                    backgroundColor={"white"}
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
                    backgroundColor={"white"}
                    secureTextEntry
                />
                <Text style={styles.forgotText} onPress={() => navigation.navigate("ForgetPassword")}>{t("forgotPassword")}</Text>

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
                    text={submitting ? t("signingIn") : t("submit")}
                    width={width * 0.86}
                    onPress={submitting ? undefined : handleSingIn}
                    backgroundColor={"green"}
                    color={"white"}
                    style={{ marginTop: height * 0.03 }}
                />

                <Text style={authStyles.switchText}>
                    {t("noAccount")}{" "}
                    <Text style={authStyles.switchLink} onPress={() => navigation.navigate("SignUp")}>
                        {t("signUp")}
                    </Text>
                </Text>
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
})
