import React, { useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, ScrollView } from "react-native";
import Alert from "../../Abstracts/Alert";
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { Colors, FontSize } from '../../Abstracts/Theme'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../Services/AuthContext'
import { authStyles, PHONE_RE } from './AuthShared'
const { width, height } = Dimensions.get("window");

export default function SingIn({ navigation }) {
    const { t } = useI18n();
    const { signIn } = useAuth();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
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
            // Role comes from the account's own profile, not a UI selection —
            // signIn() prefers the stored profile role over this default.
            await signIn(phone.trim(), password);
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
                    showPasswordToggle
                />
                <Text style={styles.forgotText} onPress={() => navigation.navigate("ForgetPassword")}>{t("forgotPassword")}</Text>

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
