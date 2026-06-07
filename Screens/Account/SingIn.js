import React, { useState } from "react";
import { View, Text, Dimensions, StyleSheet, Alert, Image, ImageBackground } from "react-native";
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { Colors, FontSize } from '../../Abstracts/Theme'
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../Services/AuthContext'
const { width, height } = Dimensions.get("window");

export default function SingIn({ navigation }) {
	const { t } = useI18n();
	const { signIn } = useAuth();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSingIn = async () => {
		if (!username.trim() || !password) {
			Alert.alert(t("loginFailed"), t("enterCredentials"));
			return;
		}
		setSubmitting(true);
		try {
			// Verifies credentials against the Fabric CA and persists the session.
			// On success, the navigator swaps to the authenticated app automatically.
			await signIn(username, password);
		} catch (error) {
			Alert.alert(t("loginFailed"), error.message || "Invalid username or password");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Container style={{ alignItems: "center", justifyContent: "flex-start", paddingHorizontal: width * 0.02, paddingVertical: height * 0.02, flex: 1 }}>
			<Image source={require("../../Images/Logo.png")} style={{ width: width * 0.5, height: height * 0.34 }} />
			<Text style={styles.headText}>{t("appName")}</Text>
			<Text style={styles.loginText}>{t("login")}</Text>
			<Input
				style={{ marginTop: height * 0.03 }}
				value={username}
				setValue={setUsername}
				placeholder={t("username")}
				fontSize={FontSize.F18}
				paddingHorizontal={width * 0.04}
				paddingVertical={height * 0.014}
				backgroundColor={"white"}
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
			/>
			<Text style={styles.forgotText} onPress={() => navigation.navigate("ForgetPassword")}>{t("forgotPassword")}</Text>
			<Button
				text={submitting ? t("signingIn") : t("submit")}
				width={width * 0.86}
				onPress={submitting ? undefined : handleSingIn}
				backgroundColor={"green"}
				color={"white"}
				style={{ marginTop: height * 0.04 }}
			/>
		</Container>
	);
}

const styles = StyleSheet.create({
	headText: {
		fontSize: FontSize.F40,
		fontWeight: "bold",
		marginBottom: height * 0.02,
		marginTop: -height * 0.01,
		color: "green",
	},
	loginText: {
		fontSize: FontSize.F28,
		fontWeight: "600",
		marginBottom: 20,
		marginTop: height * 0.01,
		color: "green",
	},
	forgotText: {
		textAlign: "right",
		fontSize: FontSize.F17,
		marginTop: height * 0.01,
		width: width * 0.85
	}
})