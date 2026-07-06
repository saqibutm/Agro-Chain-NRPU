import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Platform, View, Dimensions } from "react-native";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useI18n } from "../../i18n/I18nContext";
const { width, height } = Dimensions.get("window");

const AddFarmer = ({ navigation }) => {
	const { t } = useI18n();
	const [form, setForm] = useState({
		farmer_id: "",
		address: "",
		batch_number: "",
		date_harvested: ""
	});
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

	const showDatePicker = () => {
		setDatePickerVisibility(true);
	};

	const hideDatePicker = () => {
		setDatePickerVisibility(false);
	};

	const handleConfirm = (date) => {
		if (date) {
			setForm({
				...form,
				date_harvested: date.toISOString().split("T")[0]
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
				<Text style={styles.headText}>{t("addFarmer")}</Text>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.farmer_id}
					setValue={(e) => handleChange(e, "farmer_id")}
					placeholder={t("farmerId")}
					width={width * 0.86}
					fontSize={20}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.address}
					setValue={(e) => handleChange(e, "address")}
					placeholder={t("address")}
					width={width * 0.86}
					fontSize={20}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.batch_number}
					setValue={(e) => handleChange(e, "batch_number")}
					placeholder={t("batchNumber")}
					width={width * 0.86}
					fontSize={20}
					borderRadius={0}
					borderWidth={0}
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
							borderBottomColor: "#398ee4",
						}}
						type="date"
						value={form.date_harvested}
						onChange={(e) => handleChange(e.target.value, "date_harvested")}
					/>
				) : (
					<Button
						text={t("productionDate")}
						onPress={showDatePicker}
						width={width * 0.86}
						style={{ borderBottomWidth: 0.5, marginVertical: 3 }}
					/>
				)}
				<DateTimePickerModal
					isVisible={isDatePickerVisible}
					mode="date"
					onConfirm={handleConfirm}
					onCancel={hideDatePicker}
				/>
				<Button
					text={t("addFarmer")}
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

export default AddFarmer;
