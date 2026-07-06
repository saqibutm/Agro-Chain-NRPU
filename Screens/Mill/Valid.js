import React, { useState } from "react";
import { View, Text } from "react-native";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import { useI18n } from "../../i18n/I18nContext";

const ValidMill = () => {
	const { t } = useI18n();
	const [form, setForm] = useState({
		mill_id: ""
	});

	const handleChange = (e, key) => {
		setForm({
			...form,
			[key]: e
		});
	};

	const handleSubmit = () => {
		// On submit, send the form
	};

	return (
		<Container>
			<Text style={{ textAlign: "center" }}>{t("validMill")}</Text>
			<Input
				style={{ borderBottomWidth: 1, marginVertical: 8 }}
				value={form.farmer_id}
				setValue={(e) => handleChange(e, "mill_id")}
				placeholder={t("millId")}
				width={null}
				fontSize={20}
				borderRadius={7}
				borderWidth={0}
			/>
			<Button text={t("validMill")} style={{ width: "100%" }} width={null} />
		</Container>
	);
};

export default ValidMill;
