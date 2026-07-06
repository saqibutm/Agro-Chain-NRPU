import React, { useState } from "react";
import { StyleSheet, Text, Platform, View, Dimensions, Alert } from "react-native";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SyncStatusBar from "../../Abstracts/SyncStatusBar";
import Backward from "../../Abstracts/Backward";
import { useSync } from "../../Services/SyncContext";
import { Actions } from "../../Services/api";
import { DEFAULT_USERNAME } from "../../Services/config";
import { useI18n } from "../../i18n/I18nContext";
import { useAuth } from "../../Services/AuthContext";
import { getCurrentLocation } from "../../Services/location";
import { FontSize } from "../../Abstracts/Theme";
const { width, height } = Dimensions.get("window");

const AddFarmer = ({ navigation }) => {
	const { submit } = useSync();
	const { t } = useI18n();
	const { user } = useAuth();
	const username = user?.username || DEFAULT_USERNAME;

	const [form, setForm] = useState({
		farmer_id: "",
		address: "",
		batch_number: "",
		date_harvested: ""
	});
	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

	const hideDatePicker = () => setDatePickerVisibility(false);

	const handleConfirm = (date) => {
		if (date) {
			setForm({ ...form, date_harvested: date.toISOString().split("T")[0] });
		}
		hideDatePicker();
	};

	const handleChange = (e, key) => {
		setForm({ ...form, [key]: e });
	};

	const handleSubmit = async () => {
		if (!form.farmer_id || !form.batch_number) {
			Alert.alert(t("missingFields"), `${t("farmerId")} and ${t("batchNumber")} are required.`);
			return;
		}

		const { latitude, longitude } = await getCurrentLocation();

		const payload = {
			username,
			entityID: form.farmer_id,
			wheatBatchID: form.batch_number,
			variety: "Unspecified",
			quantity: 0,
			harvestDate: form.date_harvested,
			qrCode: form.batch_number,
			latitude: latitude ?? 0,
			longitude: longitude ?? 0,
		};

		const { mode, error } = await submit(Actions.CREATE_WHEAT_BATCH, payload);

		if (mode === "queued") {
			Alert.alert(
				t("savedOffline"),
				error
					? `${t("offlineQueue")}\n(${error})`
					: t("offlineQueue")
			);
		} else {
			Alert.alert("Success", t("farmerRegistered"));
		}
		navigation.navigate("ValidFarmer");
	};

	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Container style={{
				alignItems: "center", justifyContent: "flex-start",
				paddingHorizontal: 20, paddingVertical: 30, flex: 1
			}}>
				<SyncStatusBar />
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Backward onPress={() => navigation.goBack()} />
					<Text style={styles.headText}>{t("addFarmer")}</Text>
				</View>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.farmer_id}
					setValue={(e) => handleChange(e, "farmer_id")}
					placeholder={t("farmerId")}
					width={width * 0.86}
					fontSize={FontSize.F20}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.address}
					setValue={(e) => handleChange(e, "address")}
					placeholder={t("address")}
					width={width * 0.86}
					fontSize={FontSize.F20}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.batch_number}
					setValue={(e) => handleChange(e, "batch_number")}
					placeholder={t("batchNumber")}
					width={width * 0.86}
					fontSize={FontSize.F20}
					borderRadius={0}
					borderWidth={0}
				/>
				{Platform.OS === "web" ? (
					<input
						style={{
							width: "90%", border: "0px", backgroundColor: "transparent",
							paddingTop: 6, paddingBottom: 6, paddingLeft: 7, fontSize: FontSize.F20,
							borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#398ee4",
						}}
						type="date"
						value={form.date_harvested}
						onChange={(e) => handleChange(e.target.value, "date_harvested")}
					/>
				) : (
					<Button
						text={`${t("productionDate")} ${form.date_harvested}`}
						onPress={() => setDatePickerVisibility(true)}
						width={width * 0.86}
						justifyContent={"flex-start"}
						paddingHorizontal={5}
						style={{ borderBottomWidth: 0.5, marginVertical: 8, alignSelf: "start" }}
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
					onPress={handleSubmit}
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
		fontSize: FontSize.F26,
		fontWeight: "bold",
		marginBottom: 20,
		marginTop: height * 0.04,
		textAlign: "center",
		flex: 1,
	}
})

export default AddFarmer;
