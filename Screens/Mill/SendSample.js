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
import { Actions, queryLabDirectory } from "../../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../../Services/config";
import { MAX_SAMPLE_GRAMS } from "../../Services/units";
import { useI18n } from "../../i18n/I18nContext";
import { useAuth } from "../../Services/AuthContext";
import { FontSize } from "../../Abstracts/Theme";
const { width, height } = Dimensions.get("window");

// A mill pulls a small sample from a batch it received and sends it to a lab
// for testing — distinct from Screens/Mill/Add.js, which records the bulk
// batch handoff. See supabase/schema.sql's sample_transfers table: this is
// what lets Screens/LabDashboard.js show "samples sent to me" instead of
// letting any lab test any ID at any time.
const SendSample = ({ route, navigation }) => {
	const { submit } = useSync();
	const { t } = useI18n();
	const { user } = useAuth();
	const username = user?.username || DEFAULT_USERNAME;

	const [form, setForm] = useState({
		batch_number: "",
		sample_id: "",
		quantity: "",
		to_lab_username: "",
		sent_date: new Date().toISOString().split("T")[0],
	});
	const [sampleIdEdited, setSampleIdEdited] = useState(false);
	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// This mill's own registered mill locations aren't needed here — only the
	// destination lab is picked. See Screens/Mill/Add.js for the equivalent
	// "my mills" picker on the transfer-recording form.
	const [labs, setLabs] = useState([]);
	const [labPickerOpen, setLabPickerOpen] = useState(false);
	const [manualEntry, setManualEntry] = useState(true);

	const loadLabs = useCallback(async () => {
		if (DEMO_MODE) return;
		try {
			const { labs: rows } = await queryLabDirectory();
			setLabs(rows);
			if (rows.length > 0) setManualEntry(false);
		} catch {
			// Non-fatal — the form still works with manual entry.
		}
	}, []);

	useEffect(() => { loadLabs(); }, [loadLabs]);

	const handleChange = (value, key) => {
		setForm((f) => ({ ...f, [key]: value }));
	};

	// Filled in when returning from QRScanner — QRScanner navigates back here
	// with { scannedBatchNumber }, same convention as Screens/Mill/Add.js.
	useEffect(() => {
		if (route?.params?.scannedBatchNumber) {
			setForm((f) => ({ ...f, batch_number: route.params.scannedBatchNumber }));
		}
	}, [route?.params?.scannedBatchNumber]);

	// Suggest a sample ID from the batch ID so the field is rarely typed from
	// scratch — but never overwrite something the user already edited by hand.
	useEffect(() => {
		if (!sampleIdEdited && form.batch_number) {
			const suffix = Date.now().toString().slice(-4);
			setForm((f) => ({ ...f, sample_id: `${f.batch_number}-S${suffix}` }));
		}
	}, [form.batch_number, sampleIdEdited]);

	const selectLab = (labUsername) => {
		setForm((f) => ({ ...f, to_lab_username: labUsername }));
		setLabPickerOpen(false);
	};

	const handleConfirmDate = (date) => {
		if (date) handleChange(date.toISOString().split("T")[0], "sent_date");
		setDatePickerVisible(false);
	};

	const handleSubmit = async () => {
		if (!form.batch_number || !form.sample_id || !form.to_lab_username) {
			Alert.alert(t("missingFields"), t("sendSampleRequired"));
			return;
		}
		const quantity = parseFloat(form.quantity) || 0;
		if (quantity > MAX_SAMPLE_GRAMS) {
			Alert.alert(t("sendSample"), t("sampleQuantityTooHigh"));
			return;
		}

		setSubmitting(true);
		const payload = {
			wheatBatchID:  form.batch_number,
			sampleID:      form.sample_id,
			fromMillID:    username,
			toLabUsername: form.to_lab_username,
			quantity,
			sentDate:      form.sent_date,
		};

		const { mode, error } = await submit(Actions.SEND_SAMPLE_TO_LAB, payload);
		setSubmitting(false);

		if (mode === "failed") {
			// Permanent error (e.g. that batch number doesn't exist, or this
			// sample ID was already used) — won't resolve by retrying.
			Alert.alert(t("missingFields"), error);
			return;
		}
		if (mode === "queued") {
			Alert.alert(
				t("savedOffline"),
				error ? `${t("offlineQueue")}\n(${error})` : t("offlineQueue")
			);
		} else {
			Alert.alert(t("sendSample"), t("sampleSent"));
		}
		// Refreshed label reflecting this sample send — same QR/batch ID as
		// always, updated status ("Processing"). See BatchQRCode.js.
		navigation.navigate("BatchQRCode", { wheatBatchID: form.batch_number, nextScreen: null });
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
					<Text style={styles.headText}>{t("sendSample")}</Text>
				</View>

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
					onPress={() => navigation.navigate("QRScanner", { returnScreen: "SendSample", returnParamKey: "scannedBatchNumber" })}
					width={width * 0.86}
					color="green"
					borderWidth={1.5}
					borderColor="green"
					fontSize={FontSize.F16}
					style={{ marginVertical: 4, alignSelf: "center" }}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.sample_id}
					setValue={(e) => { setSampleIdEdited(true); handleChange(e, "sample_id"); }}
					placeholder={t("sampleId")}
					width={width * 0.86}
					fontSize={FontSize.F18}
					borderRadius={0}
					borderWidth={0}
				/>
				<Input
					style={{ borderBottomWidth: 1, marginVertical: 8 }}
					value={form.quantity}
					setValue={(e) => handleChange(e, "quantity")}
					placeholder={`${t("sampleQuantity")}, ${t("max")} ${MAX_SAMPLE_GRAMS}g`}
					width={width * 0.86}
					fontSize={FontSize.F18}
					borderRadius={0}
					borderWidth={0}
					keyboardType="numeric"
				/>

				{labs.length > 0 && !manualEntry ? (
					<View style={styles.dropdownWrap}>
						<TouchableOpacity
							style={styles.dropdownSelector}
							activeOpacity={0.8}
							onPress={() => setLabPickerOpen((open) => !open)}
						>
							<Text style={form.to_lab_username ? styles.dropdownSelectorText : styles.dropdownPlaceholder}>
								{form.to_lab_username || t("chooseLab")}
							</Text>
							<Text style={styles.dropdownChevron}>{labPickerOpen ? "▲" : "▼"}</Text>
						</TouchableOpacity>
						{labPickerOpen && (
							<View style={styles.dropdownList}>
								{labs.map((labUsername) => (
									<TouchableOpacity
										key={labUsername}
										style={styles.dropdownOption}
										onPress={() => selectLab(labUsername)}
									>
										<Text style={styles.dropdownOptionText}>{labUsername}</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
						<Text style={styles.switchModeLink} onPress={() => { setManualEntry(true); setLabPickerOpen(false); }}>
							{t("enterLabManually")}
						</Text>
					</View>
				) : (
					<>
						<Input
							style={{ borderBottomWidth: 1, marginVertical: 8 }}
							value={form.to_lab_username}
							setValue={(e) => handleChange(e, "to_lab_username")}
							placeholder={t("labUsername")}
							width={width * 0.86}
							fontSize={FontSize.F18}
							borderRadius={0}
							borderWidth={0}
						/>
						{labs.length > 0 && (
							<Text style={styles.switchModeLink} onPress={() => setManualEntry(false)}>
								{t("chooseLab")}
							</Text>
						)}
					</>
				)}

				{Platform.OS === "web" ? (
					<input
						style={{
							width: "90%", border: "0px", backgroundColor: "transparent",
							paddingTop: 6, paddingBottom: 6, paddingLeft: 7, fontSize: FontSize.F18,
							borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#aaaaaa"
						}}
						type="date"
						value={form.sent_date}
						onChange={(e) => handleChange(e.target.value, "sent_date")}
					/>
				) : (
					<Button
						text={`${t("sentDate")} ${form.sent_date}`}
						onPress={() => setDatePickerVisible(true)}
						fontSize={FontSize.F18}
						width={width * 0.86}
						justifyContent={"flex-start"}
						paddingHorizontal={5}
						style={{ borderBottomWidth: 0.5, marginVertical: 8, alignSelf: "start" }}
					/>
				)}
				<DateTimePickerModal
					isVisible={datePickerVisible}
					mode="date"
					onConfirm={handleConfirmDate}
					onCancel={() => setDatePickerVisible(false)}
				/>

				<Button
					text={submitting ? "…" : t("sendSample")}
					onPress={submitting ? undefined : handleSubmit}
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
	switchModeLink: {
		color: "green",
		fontSize: FontSize.F13,
		fontWeight: "600",
		marginTop: 6,
		textDecorationLine: "underline",
	},
});

export default SendSample;
