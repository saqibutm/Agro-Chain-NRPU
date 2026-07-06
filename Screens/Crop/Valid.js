import React, { useState } from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import { useI18n } from "../../i18n/I18nContext";
const { width, height } = Dimensions.get("window");

const ValidCrop = ({ navigation }) => {
	const { t } = useI18n();
	const [form, setForm] = useState({
		farmer_id: ""
	});

	const handleChange = (e, key) => {
		setForm({ ...form, [key]: e });
	};

	const handleSubmit = () => {
		// On submit, send the form
	};

	return (
		<Container>
			<Text style={styles.headText}>{t("addCropValidation")}</Text>
			<Input
				style={{ borderBottomWidth: 1, marginVertical: 8, marginTop: height * 0.04 }}
				value={form.farmer_id}
				setValue={(e) => handleChange(e, "farmer_id")}
				placeholder={t("cropId")}
				width={null}
				fontSize={20}
				borderRadius={7}
				borderWidth={0}
			/>
			<Button
				text={t("login")}
				width={width * 0.86}
				onPress={() => navigation.navigate("AddMill")}
				backgroundColor={"green"}
				color={'white'}
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

export default ValidCrop;