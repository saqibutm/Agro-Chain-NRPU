import React, { useState } from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import Alert from "../../Abstracts/Alert";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import { useI18n } from "../../i18n/I18nContext";
const { width, height } = Dimensions.get("window");

const ValidFarmer = ({ navigation }) => {
	const { t } = useI18n();
	const [form, setForm] = useState({ farmer_id: "" });

	const handleSubmit = () => {
		if (!form.farmer_id.trim()) {
			Alert.alert(t("missingFields"), `${t("farmerId")} is required.`);
			return;
		}
		navigation.navigate("AddMill", { farmer_id: form.farmer_id });
	};

	return (
		<Container>
			<Text style={styles.headText}>{t("addFarmerValidation")}</Text>
			<Input
				style={{ borderBottomWidth: 1, marginVertical: 8, marginTop: height * 0.04 }}
				value={form.farmer_id}
				setValue={(e) => setForm({ farmer_id: e })}
				placeholder={t("farmerId")}
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

export default ValidFarmer;
