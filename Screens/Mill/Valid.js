import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Alert from "../../Abstracts/Alert";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import { useI18n } from "../../i18n/I18nContext";
const { width, height } = Dimensions.get("window");

const ValidMill = ({ navigation }) => {
	const { t } = useI18n();
	const [form, setForm] = useState({ mill_id: "" });

	const handleSubmit = () => {
		if (!form.mill_id.trim()) {
			Alert.alert(t("missingFields"), `${t("millId")} is required.`);
			return;
		}
		Alert.alert("Success", t("millConfirmed"), [
			{ text: "OK", onPress: () => navigation.navigate("Home") }
		]);
	};

	return (
		<Container>
			<Text style={styles.headText}>{t("validMill")}</Text>
			<Input
				style={{ borderBottomWidth: 1, marginVertical: 8, marginTop: height * 0.04 }}
				value={form.mill_id}
				setValue={(e) => setForm({ mill_id: e })}
				placeholder={t("millId")}
				width={null}
				fontSize={20}
				borderRadius={7}
				borderWidth={0}
			/>
			<Button
				text={t("confirm")}
				width={width * 0.86}
				onPress={handleSubmit}
				backgroundColor={"green"}
				color={"white"}
				style={{ marginTop: height * 0.03 }}
			/>
		</Container>
	);
};

const styles = StyleSheet.create({
	headText: {
		fontSize: 26,
		fontWeight: "bold",
		marginTop: height * 0.04,
		textAlign: "center"
	}
})

export default ValidMill;
