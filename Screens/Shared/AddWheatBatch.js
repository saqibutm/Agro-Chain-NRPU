import React, { useState } from "react";
import { StyleSheet, Text, Platform, View, Dimensions } from "react-native";
import Alert from "../../Abstracts/Alert";
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

// Shared "create a wheat batch" form behind both Screens/Farmer/Add.js and
// Screens/Crop/Add.js — they're the same CREATE_WHEAT_BATCH action, just
// reached from two different role menus with different labels.
const AddWheatBatch = ({ navigation, idLabelKey, headerKey, submitLabelKey, validateScreen }) => {
	const { submit } = useSync();
	const { t } = useI18n();
	const { user } = useAuth();
	const username = user?.username || DEFAULT_USERNAME;

	const [form, setForm] = useState({
		farmer_id: "",
		batch_number: "",
		variety: "",
		quantity: "",
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
			Alert.alert(t("missingFields"), `${t(idLabelKey)} and ${t("batchNumber")} are required.`);
			return;
		}

		const { latitude, longitude } = await getCurrentLocation();

		const payload = {
			username,
			entityID: form.farmer_id,
			wheatBatchID: form.batch_number,
			variety: form.variety.trim() || "Unspecified",
			quantity: parseFloat(form.quantity) || 0,
			harvestDate: form.date_harvested,
			qrCode: form.batch_number,
			latitude: latitude ?? 0,
			longitude: longitude ?? 0,
		};

		const { mode, error } = await submit(Actions.CREATE_WHEAT_BATCH, payload);

		if (mode === "failed") {
			// Permanent error (e.g. duplicate batch number) — won't resolve by
			// retrying, so surface it now instead of queuing it forever.
			Alert.alert(t("missingFields"), error);
			return;
		}
		if (mode === "queued") {
			Alert.alert(
				t("savedOffline"),
				error
					? `${t("offlineQueue")}\n(${error})`
					: t("offlineQueue")
			);
		}
		// The batch ID is chosen client-side, so the printable QR code doesn't
		// need to wait for sync — show it next either way, then let the farmer
		// continue into the existing validate-and-transfer flow when ready.
		navigation.navigate("BatchQRCode", {
			wheatBatchID: payload.wheatBatchID,
			variety: payload.variety,
			quantity: payload.quantity,
			harvestDate: payload.harvestDate,
			latitude: payload.latitude,
			longitude: payload.longitude,
			nextScreen: validateScreen,
		});
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
					<Text style={styles.headText}>{t(headerKey)}</Text>
				</View>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.farmer_id}
					setValue={(e) => handleChange(e, "farmer_id")}
					placeholder={t(idLabelKey)}
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
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.variety}
					setValue={(e) => handleChange(e, "variety")}
					placeholder={t("variety")}
					width={width * 0.86}
					fontSize={FontSize.F20}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.quantity}
					setValue={(e) => handleChange(e, "quantity")}
					placeholder={`${t("quantity")} (kg)`}
					width={width * 0.86}
					fontSize={FontSize.F20}
					borderRadius={0}
					borderWidth={0}
					keyboardType="numeric"
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
					text={t(submitLabelKey)}
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
});

export default AddWheatBatch;
