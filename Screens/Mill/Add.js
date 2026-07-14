import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Platform, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import Alert from "../../Abstracts/Alert";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import Button from "../../Abstracts/Button";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SyncStatusBar from "../../Abstracts/SyncStatusBar";
import Backward from "../../Abstracts/Backward";
import { useSync } from "../../Services/SyncContext";
import { Actions, queryMyMills } from "../../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../../Services/config";
import { useI18n } from "../../i18n/I18nContext";
import { useAuth } from "../../Services/AuthContext";
import { FontSize } from "../../Abstracts/Theme";
const { width, height } = Dimensions.get("window");

const AddMill = ({ route, navigation }) => {
	const { submit } = useSync();
	const { t } = useI18n();
	const { user } = useAuth();
	const username = user?.username || DEFAULT_USERNAME;
	// farmer_id may be passed from ValidCrop / ValidFarmer
	const fromEntityID = route?.params?.farmer_id || username;

	const [form, setForm] = useState({
		mill_name: "",
		location: "",
		batch_number: "",
		quantity_received: "",
		product_date: "",
		expiry_date: ""
	});
	const [datePickerKey, setDatePickerKey] = useState(null); // "product_date" | "expiry_date"

	// This operator's own registered mill locations (Screens/Mill/ManageMills.js)
	// — when they have any, default to picking from that list instead of
	// free-typing the name/location fresh on every transfer.
	const [myMills, setMyMills] = useState([]);
	const [millPickerOpen, setMillPickerOpen] = useState(false);
	const [manualEntry, setManualEntry] = useState(true);

	const loadMyMills = useCallback(async () => {
		if (DEMO_MODE) return;
		try {
			const { mills } = await queryMyMills();
			setMyMills(mills);
			if (mills.length > 0) setManualEntry(false);
		} catch {
			// Non-fatal — the form still works with manual entry.
		}
	}, []);

	useEffect(() => { loadMyMills(); }, [loadMyMills]);

	const selectMill = (mill) => {
		setForm((f) => ({ ...f, mill_name: mill.name, location: mill.location || "" }));
		setMillPickerOpen(false);
	};

	// Filled in when returning from QRScanner (see the "Scan QR Code" button
	// below) — QRScanner navigates back here with { scannedBatchNumber }.
	useEffect(() => {
		if (route?.params?.scannedBatchNumber) {
			setForm((f) => ({ ...f, batch_number: route.params.scannedBatchNumber }));
		}
	}, [route?.params?.scannedBatchNumber]);

	const showDatePicker = (key) => setDatePickerKey(key);
	const hideDatePicker = () => setDatePickerKey(null);

	const handleConfirm = (date) => {
		if (date && datePickerKey) {
			setForm({ ...form, [datePickerKey]: date.toISOString().split("T")[0] });
		}
		hideDatePicker();
	};

	const handleChange = (value, key) => {
		setForm({ ...form, [key]: value });
	};

	const handleSubmit = async () => {
		if (!form.mill_name || !form.batch_number) {
			Alert.alert(t("missingFields"), `${t("millName")} and ${t("batchNumber")} are required.`);
			return;
		}

		const payload = {
			username,
			fromEntityID,
			toEntityID: form.mill_name,
			wheatBatchID: form.batch_number,
			quantity: parseFloat(form.quantity_received) || 0,
			transferDate: form.product_date,
			location: form.location,
		};

		const { mode, error } = await submit(Actions.SEND_WHEAT_BATCH, payload);

		if (mode === "failed") {
			// Permanent error (e.g. that batch number doesn't exist) — won't
			// resolve by retrying, so surface it now instead of queuing it forever.
			Alert.alert(t("missingFields"), error);
			return;
		}
		if (mode === "queued") {
			Alert.alert(
				t("savedOffline"),
				error ? `${t("offlineQueue")}\n(${error})` : t("offlineQueue")
			);
		} else {
			Alert.alert("Success", t("millBatchReceived"));
		}
		navigation.navigate("ValidMill");
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
					<Text style={styles.headText}>{t("addMill")}</Text>
				</View>
				{myMills.length > 0 && !manualEntry ? (
					<View style={styles.dropdownWrap}>
						<TouchableOpacity
							style={styles.dropdownSelector}
							activeOpacity={0.8}
							onPress={() => setMillPickerOpen((open) => !open)}
						>
							<Text style={form.mill_name ? styles.dropdownSelectorText : styles.dropdownPlaceholder}>
								{form.mill_name || t("chooseMill")}
							</Text>
							<Text style={styles.dropdownChevron}>{millPickerOpen ? "▲" : "▼"}</Text>
						</TouchableOpacity>
						{millPickerOpen && (
							<View style={styles.dropdownList}>
								{myMills.map((mill) => (
									<TouchableOpacity
										key={mill.id}
										style={styles.dropdownOption}
										onPress={() => selectMill(mill)}
									>
										<Text style={styles.dropdownOptionText}>{mill.name}</Text>
										{!!mill.location && <Text style={styles.dropdownOptionSub}>{mill.location}</Text>}
									</TouchableOpacity>
								))}
							</View>
						)}
						<Text style={styles.switchModeLink} onPress={() => { setManualEntry(true); setMillPickerOpen(false); }}>
							{t("enterMillManually")}
						</Text>
					</View>
				) : (
					<>
						<Input
							style={{ borderBottomWidth: 1, marginVertical: 8 }}
							value={form.mill_name}
							setValue={(e) => handleChange(e, "mill_name")}
							placeholder={t("millName")}
							width={width * 0.86}
							fontSize={FontSize.F18}
							borderRadius={0}
							borderWidth={0}
						/>
						<Input
							style={{ borderBottomWidth: 1, marginVertical: 8 }}
							value={form.location}
							setValue={(e) => handleChange(e, "location")}
							placeholder={t("location")}
							width={width * 0.86}
							fontSize={FontSize.F18}
							borderRadius={0}
							borderWidth={0}
						/>
						{myMills.length > 0 ? (
							<Text style={styles.switchModeLink} onPress={() => setManualEntry(false)}>
								{t("chooseMill")}
							</Text>
						) : (
							<Text style={styles.switchModeLink} onPress={() => navigation.navigate("ManageMills")}>
								{t("registerMillHint")}
							</Text>
						)}
					</>
				)}
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.batch_number}
					setValue={(e) => handleChange(e, "batch_number")}
					placeholder={t("batchNumber")}
					width={width * 0.86}
					fontSize={FontSize.F18}
					borderRadius={0}
					borderWidth={0}
				/>
				<Button
					text={t("scanQrCode")}
					onPress={() => navigation.navigate("QRScanner", { returnScreen: "AddMill", returnParamKey: "scannedBatchNumber" })}
					width={width * 0.86}
					color="green"
					borderWidth={1.5}
					borderColor="green"
					fontSize={FontSize.F16}
					style={{ marginVertical: 4, alignSelf: "center" }}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.quantity_received}
					setValue={(e) => handleChange(e, "quantity_received")}
					placeholder={t("quantityReceived")}
					width={width * 0.86}
					fontSize={FontSize.F18}
					borderRadius={0}
					borderWidth={0}
					keyboardType={"numeric"}
				/>
				{Platform.OS === "web" ? (
					<input
						style={{
							width: "90%", border: "0px", backgroundColor: "transparent",
							paddingTop: 6, paddingBottom: 6, paddingLeft: 7, fontSize: FontSize.F18,
							borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#aaaaaa"
						}}
						type="date"
						value={form.product_date}
						onChange={(e) => handleChange(e.target.value, "product_date")}
					/>
				) : (
					<Button
						text={`${t("productionDate")} ${form.product_date || ""}`}
						onPress={() => showDatePicker("product_date")}
						fontSize={FontSize.F18}
						width={width * 0.86}
						justifyContent={"flex-start"}
						paddingHorizontal={5}
						style={{ borderBottomWidth: 0.5, marginVertical: 3, alignSelf: "start" }}
					/>
				)}
				{Platform.OS === "web" ? (
					<input
						style={{
							width: "90%", border: "0px", backgroundColor: "transparent",
							paddingTop: 6, paddingBottom: 6, paddingLeft: 7, fontSize: FontSize.F18,
							borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#aaaaaa"
						}}
						type="date"
						value={form.expiry_date}
						onChange={(e) => handleChange(e.target.value, "expiry_date")}
					/>
				) : (
					<Button
						text={`${t("expiryDate")} ${form.expiry_date || ""}`}
						onPress={() => showDatePicker("expiry_date")}
						fontSize={FontSize.F18}
						width={width * 0.86}
						justifyContent={"flex-start"}
						paddingHorizontal={5}
						style={{ borderBottomWidth: 0.5, marginVertical: 3, alignSelf: "start" }}
					/>
				)}
				<DateTimePickerModal
					isVisible={datePickerKey !== null}
					mode="date"
					onConfirm={handleConfirm}
					onCancel={hideDatePicker}
				/>
				<Button
					text={t("addMill")}
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
	},
	dropdownWrap: {
		width: width * 0.86,
		marginVertical: 8,
		zIndex: 10,
	},
	dropdownSelector: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderColor: "#aaaaaa",
		paddingVertical: 10,
	},
	dropdownSelectorText: { color: "#000", fontSize: FontSize.F18 },
	dropdownPlaceholder: { color: "#00000080", fontSize: FontSize.F18 },
	dropdownChevron: { color: "green", fontSize: 12 },
	dropdownList: {
		marginTop: 4,
		borderWidth: 1.5,
		borderColor: "green",
		borderRadius: 8,
		backgroundColor: "white",
		overflow: "hidden",
	},
	dropdownOption: {
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: "#dCe8dC",
	},
	dropdownOptionText: { color: "#222", fontSize: FontSize.F16, fontWeight: "600" },
	dropdownOptionSub: { color: "#777", fontSize: FontSize.F13, marginTop: 2 },
	switchModeLink: {
		color: "green",
		fontSize: FontSize.F13,
		fontWeight: "600",
		marginTop: 6,
		textDecorationLine: "underline",
	},
})

export default AddMill;
