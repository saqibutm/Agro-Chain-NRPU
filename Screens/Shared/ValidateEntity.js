import React, { useState } from "react";
import { StyleSheet, Text, Dimensions } from "react-native";
import Alert from "../../Abstracts/Alert";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import { useI18n } from "../../i18n/I18nContext";
import { checkEntityExists } from "../../Services/api";
import { DEMO_MODE } from "../../Services/config";
const { width, height } = Dimensions.get("window");

// Shared "confirm this ID actually has a batch on record before moving to
// the mill transfer step" screen behind Screens/Farmer/Valid.js and
// Screens/Crop/Valid.js — previously these accepted any typed string with
// no check at all, despite being named "Valid...".
const ValidateEntity = ({ navigation, idLabelKey, headerKey }) => {
	const { t } = useI18n();
	const [form, setForm] = useState({ farmer_id: "" });
	const [checking, setChecking] = useState(false);

	const handleSubmit = async () => {
		const id = form.farmer_id.trim();
		if (!id) {
			Alert.alert(t("missingFields"), `${t(idLabelKey)} is required.`);
			return;
		}

		if (!DEMO_MODE) {
			setChecking(true);
			let exists = true;
			try {
				exists = await checkEntityExists(id);
			} catch {
				// Can't verify right now (offline/unreachable) — let it through
				// rather than block a legitimate offline capture.
			}
			setChecking(false);
			if (!exists) {
				Alert.alert(t(idLabelKey), `No batch found for "${id}". Check the ID and try again.`);
				return;
			}
		}

		navigation.navigate("AddMill", { farmer_id: id });
	};

	return (
		<Container>
			<Text style={styles.headText}>{t(headerKey)}</Text>
			<Input
				style={{ borderBottomWidth: 1, marginVertical: 8, marginTop: height * 0.04 }}
				value={form.farmer_id}
				setValue={(e) => setForm({ farmer_id: e })}
				placeholder={t(idLabelKey)}
				width={null}
				fontSize={20}
				borderRadius={7}
				borderWidth={0}
			/>
			<Button
				text={checking ? "…" : t("confirm")}
				width={width * 0.86}
				onPress={checking ? undefined : handleSubmit}
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
});

export default ValidateEntity;
