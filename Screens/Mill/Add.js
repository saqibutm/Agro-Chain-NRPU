import React, { useEffect, useState } from "react";
import { View, Text, Platform, Dimensions, StyleSheet } from "react-native";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useI18n } from "../../i18n/I18nContext";
const { width, height } = Dimensions.get("window");

const AddMill = ({ navigation }) => {
	const { t } = useI18n();
	const [form, setForm] = useState({
		mill_name: "",
		location: "",
		batch_number: "",
		quantity_received: "",
		product_date: "",
		expiry_date: ""
	});
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

	const showDatePicker = () => {
		setDatePickerVisibility(true);
	};

	const hideDatePicker = () => {
		setDatePickerVisibility(false);
	};

	const handleConfirm = (date, key) => {
		if (date) {
			setForm({
				...form,
				[key]: date.toISOString().split("T")[0]
			});
		}
		hideDatePicker();
	};

	const handleChange = (e, key) => {
		setForm({
			...form,
			[key]: e
		});
	};

	const handleSubmit = () => {
		// On submit, send the form
	};

	useEffect(() => {}, [form]);

	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Container
				style={{
					alignItems: "center",
					justifyContent: "flex-start",
					paddingHorizontal: 20,
					paddingVertical: 30,
					flex: 1
				}}>
				<Text style={styles.headText}>{t("addMill")}</Text>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.mill_name}
					setValue={(e) => handleChange(e, "mill_name")}
					placeholder={t("millName")}
					width={width * 0.86}
					fontSize={18}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.location}
					setValue={(e) => handleChange(e, "location")}
					placeholder={t("location")}
					width={width * 0.86}
					fontSize={18}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.batch_number}
					setValue={(e) => handleChange(e, "batch_number")}
					placeholder={t("batchNumber")}
					width={width * 0.86}
					fontSize={18}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.quantity_received}
					setValue={(e) => handleChange(e, "quantity_received")}
					placeholder={t("quantityReceived")}
					width={width * 0.86}
					fontSize={18}
					borderRadius={0}
					borderWidth={0}
					keyboardType={"numeric"}
				/>
				{Platform.OS === "web" ? (
					<input
						style={{
							width: "90%",
							border: "0px",
							backgroundColor: "transparent",
							paddingTop: 6,
							paddingBottom: 6,
							paddingLeft: 7,
							fontSize: 20,
							borderBottomWidth: 1,
							borderBottomStyle: "solid",
							borderBottomColor: "#aaaaaa"
						}}
						type="date"
						value={form.date_harvested}
						onChange={(e) => handleChange(e.target.value, "production_date")}
					/>
				) : (
					<Button
						text={t("productionDate")}
						onPress={(e) => showDatePicker(e, "production_date")}
						fontSize={18}
						width={width * 0.86}
						style={{ borderBottomWidth: 0.5, marginVertical: 3 }}
					/>
				)}
				{form.product_date && <Text>{`Production Date: ${form.product_date}`}</Text>}
				{Platform.OS === "web" ? (
					<input
						style={{
							width: "90%",
							border: "0px",
							backgroundColor: "transparent",
							paddingTop: 6,
							paddingBottom: 6,
							paddingLeft: 7,
							fontSize: 20,
							borderBottomWidth: 1,
							borderBottomStyle: "solid",
							borderBottomColor: "#aaaaaa"
						}}
						type="date"
						value={form.date_harvested}
						onChange={(e) => handleChange(e.target.value, "expiry_date")}
					/>
				) : (
					<Button
						text={t("expiryDate")}
						// onPress={showDatePicker}
						fontSize={18}
						onPress={(e) => showDatePicker(e, "expiry_date")}
						width={width * 0.86}
						style={{ borderBottomWidth: 0.5, marginVertical: 3 }}
					/>
				)}
				{form.product_date && <Text>{`Expiry Date: ${form.product_date}`}</Text>}
				<DateTimePickerModal
					isVisible={isDatePickerVisible}
					mode="date"
					onConfirm={(e) => handleConfirm(e, "product_date")}
					onCancel={hideDatePicker}
				/>
				{form.expiry_date && <Text>{`Expiry Date: ${form.expiry_date}`}</Text>}
				<DateTimePickerModal
					isVisible={isDatePickerVisible}
					mode="date"
					onConfirm={(e) => handleConfirm(e, "expiry_date")}
					onCancel={hideDatePicker}
				/>
				<Button
					text={t("addMill")}
					onPress={() => navigation.navigate("ValidFarmer")}
					width={width * 0.86}
					color={"white"}
					backgroundColor={"green"}
					style={{ marginTop: height * 0.03 }}
				/>
			</Container>
		</View>
	);
};

const styles = StyleSheet.create({
	headText: {
		fontSize: 26,
		fontWeight: "bold",
		marginBottom: 20,
		marginTop: height * 0.04,
		textAlign: "center"
	}
})

export default AddMill;
