import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Switch, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import Alert from "../Abstracts/Alert";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Container from "../Abstracts/Container";
import Input from "../Abstracts/TextInput";
import Button from "../Abstracts/Button";
import Backward from "../Abstracts/Backward";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
import Segmented from "../Abstracts/Segmented";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useSync } from "../Services/SyncContext";
import { useAuth } from "../Services/AuthContext";
import { Actions, queryPendingSamples, queryWheatBatch } from "../Services/api";
import { DEFAULT_USERNAME, DEMO_MODE } from "../Services/config";
const { width, height } = Dimensions.get("window");

const GRADES = ["A", "B", "C"];

const LabDashboard = ({ navigation, route }) => {
	const { t } = useI18n();
	const { submit } = useSync();
	const { user } = useAuth();
	const username = user?.username || DEFAULT_USERNAME;

	const [form, setForm] = useState({
		reportID: "",
		subjectID: "",
		labID: "",
		testedBy: "",
		testDate: "",
		commodity: "wheat",
		moisture: "",
		protein: "",
		gluten: "",
		brix: "",
		pol: "",
		purity: "",
		pesticides: false,
		aflatoxin: false,
		result: "Pass",
		grade: "A",
	});
	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// Samples a mill has sent to this lab and not yet tested — see
	// supabase/schema.sql's sample_transfers table. Picking one below pins
	// selectedSampleID so handleSubmit can flip it to "Tested" on save,
	// instead of the old "type any ID, no gatekeeping" behavior (still
	// available further down for ad-hoc testing not tied to a formal sample).
	const [pendingSamples, setPendingSamples] = useState([]);
	const [loadingSamples, setLoadingSamples] = useState(!DEMO_MODE);
	const [selectedSampleID, setSelectedSampleID] = useState(null);

	const loadPendingSamples = useCallback(async () => {
		if (DEMO_MODE) return;
		setLoadingSamples(true);
		try {
			const { samples } = await queryPendingSamples(username);
			setPendingSamples(samples);
		} catch {
			// Non-fatal — manual entry below still works.
		} finally {
			setLoadingSamples(false);
		}
	}, [username]);

	useEffect(() => { loadPendingSamples(); }, [loadPendingSamples]);

	const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

	const selectSample = (sample) => {
		setSelectedSampleID(sample.sampleID);
		setForm((f) => ({ ...f, subjectID: sample.wheatBatchID, commodity: sample.commodity || "wheat" }));
	};

	// Filled in when returning from QRScanner (see the "Scan QR Code" button
	// below) — QRScanner navigates back here with { scannedSubjectID }.
	// Scanning is treated as ad-hoc entry, so it clears any selected sample.
	useEffect(() => {
		if (route?.params?.scannedSubjectID) {
			setSelectedSampleID(null);
			set("subjectID", route.params.scannedSubjectID);
		}
	}, [route?.params?.scannedSubjectID]);

	// Ad-hoc entry (typed or scanned subject ID, not picked from the pending-
	// samples list above) doesn't come with a known commodity, so look the
	// batch up to pick the right quality-test fields (wheat vs sugarcane).
	// Best-effort: an unrecognized ID (e.g. a consumer-reported product, per
	// quality_reports.subject_id's intentional lack of FK) just keeps
	// whatever commodity was already selected.
	useEffect(() => {
		if (selectedSampleID || !form.subjectID || DEMO_MODE) return;
		let cancelled = false;
		const handle = setTimeout(async () => {
			try {
				const { batch } = await queryWheatBatch(username, form.subjectID);
				if (!cancelled && batch?.commodity) set("commodity", batch.commodity);
			} catch {
				// Unrecognized ID — leave commodity as-is, lab can toggle manually.
			}
		}, 400);
		return () => { cancelled = true; clearTimeout(handle); };
	}, [form.subjectID, selectedSampleID, username]);

	const handleConfirmDate = (date) => {
		if (date) set("testDate", date.toISOString().split("T")[0]);
		setDatePickerVisible(false);
	};

	const handleSubmit = async () => {
		if (!form.reportID || !form.subjectID) {
			Alert.alert(t("recordQualityTest"), t("fillRequired"));
			return;
		}
		const isSugarcane = form.commodity === "sugarcane";
		const numericFieldsFilled = isSugarcane
			? (form.brix || form.pol || form.purity)
			: (form.moisture || form.protein || form.gluten);
		if (!numericFieldsFilled) {
			Alert.alert(t("recordQualityTest"), t(isSugarcane ? "fillNumericFieldsSugarcane" : "fillNumericFields"));
			return;
		}
		setSubmitting(true);
		const payload = {
			username,
			reportID: form.reportID,
			subjectID: form.subjectID,
			labID: form.labID,
			testedBy: form.testedBy,
			testDate: form.testDate,
			moisture: isSugarcane ? null : parseFloat(form.moisture) || 0,
			protein: isSugarcane ? null : parseFloat(form.protein) || 0,
			gluten: isSugarcane ? null : parseFloat(form.gluten) || 0,
			brix: isSugarcane ? parseFloat(form.brix) || 0 : null,
			pol: isSugarcane ? parseFloat(form.pol) || 0 : null,
			purity: isSugarcane ? parseFloat(form.purity) || 0 : null,
			pesticides: form.pesticides,
			aflatoxin: form.aflatoxin,
			result: form.result,
			grade: form.grade,
			certHash: "",
			sampleID: selectedSampleID,
		};

		const { mode, error } = await submit(Actions.RECORD_QUALITY_TEST, payload);
		setSubmitting(false);

		if (mode === "failed") {
			// Permanent error (e.g. duplicate Report ID) — won't resolve by
			// retrying, so surface it now instead of queuing it forever.
			Alert.alert(t("recordQualityTest"), error);
			return;
		}
		if (selectedSampleID) {
			// Optimistic: drop it from the pending list now — a background
			// reload would also catch this once the write actually lands, but
			// that could be a while if it was queued offline.
			setPendingSamples((s) => s.filter((x) => x.sampleID !== selectedSampleID));
		}
		if (mode === "queued") {
			Alert.alert(
				t("savedOffline"),
				error ? `${t("offlineQueue")}\n(${error})` : t("offlineQueue")
			);
		} else {
			Alert.alert(t("recordQualityTest"), t("qualityRecorded"));
		}
		// Refreshed label reflecting this test result — same QR/batch ID as
		// always, updated grade/result. See BatchQRCode.js. Gracefully shows
		// just the QR if subjectID isn't an actual wheat_batches row (e.g. an
		// ad-hoc consumer-reported ID).
		navigation.navigate("BatchQRCode", { wheatBatchID: form.subjectID, nextScreen: null });
	};

	const inputProps = {
		width: width * 0.86,
		fontSize: FontSize.F18,
		borderRadius: 0,
		borderWidth: 0,
		style: { borderBottomWidth: 1, marginVertical: height * 0.008 },
	};

	return (
		<Container style={{ paddingHorizontal: 0, paddingVertical: 0, flex: 1 }}>
			<SyncStatusBar />
			<View style={styles.header}>
				<Backward onPress={() => navigation.goBack()} />
				<Text style={styles.headText}>{t("labDashboard")}</Text>
			</View>

			<ScrollView
				contentContainerStyle={{ alignItems: "center", paddingHorizontal: width * 0.06, paddingBottom: height * 0.05 }}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.subtitle}>{t("pendingSamples")}</Text>
				{loadingSamples ? (
					<ActivityIndicator color="green" style={{ marginBottom: 12 }} />
				) : pendingSamples.length === 0 ? (
					<Text style={styles.empty}>{t("noPendingSamples")}</Text>
				) : (
					<View style={{ width: width * 0.86, marginBottom: height * 0.02 }}>
						{pendingSamples.map((sample) => {
							const active = selectedSampleID === sample.sampleID;
							return (
								<TouchableOpacity
									key={sample.sampleID}
									style={[styles.sampleRow, active && styles.sampleRowActive]}
									onPress={() => selectSample(sample)}
								>
									<View style={{ flex: 1 }}>
										<Text style={styles.sampleId}>{sample.sampleID}</Text>
										<Text style={styles.sampleSub}>
											{t("batchNumber")}: {sample.wheatBatchID} · {sample.commodity === "sugarcane" ? t("sugarcane") : t("wheat")}{sample.variety ? ` · ${sample.variety}` : ""}{sample.batchQuantity != null ? ` (${sample.batchQuantity}kg)` : ""}
										</Text>
										<Text style={styles.sampleSub}>
											{t("from")}: {sample.fromMillID}{sample.quantity ? ` · ${sample.quantity}g` : ""}
										</Text>
										{!!sample.sentDate && (
											<Text style={styles.sampleSub}>{t("sentDate")}: {sample.sentDate}</Text>
										)}
									</View>
									{active && <Text style={styles.sampleCheck}>✓</Text>}
								</TouchableOpacity>
							);
						})}
					</View>
				)}

				<Text style={styles.subtitle}>{t("recordQualityTest")}</Text>

				<Input {...inputProps} value={form.reportID} setValue={(e) => set("reportID", e)} placeholder={t("reportId")} />
				<Input
					{...inputProps}
					value={form.subjectID}
					setValue={(e) => { setSelectedSampleID(null); set("subjectID", e); }}
					placeholder={t("subjectId")}
				/>
				<Button
					text={t("scanQrCode")}
					onPress={() => navigation.navigate("QRScanner", { returnScreen: "LabDashboard", returnParamKey: "scannedSubjectID" })}
					width={width * 0.86}
					color="green"
					borderWidth={1.5}
					borderColor="green"
					fontSize={FontSize.F16}
					style={{ marginVertical: 4, alignSelf: "center" }}
				/>
				<Input {...inputProps} value={form.labID} setValue={(e) => set("labID", e)} placeholder={t("labId")} />
				<Input {...inputProps} value={form.testedBy} setValue={(e) => set("testedBy", e)} placeholder={t("testedBy")} />

				{/* Test date */}
				{Platform.OS === "web" ? (
					<input
						style={{ width: "90%", border: "0px", backgroundColor: "transparent", padding: 6, fontSize: 18, borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "#aaaaaa" }}
						type="date"
						value={form.testDate}
						onChange={(e) => set("testDate", e.target.value)}
					/>
				) : (
					<Button
						text={`${t("testDate")} ${form.testDate}`}
						onPress={() => setDatePickerVisible(true)}
						width={width * 0.86}
						justifyContent="flex-start"
						style={{ borderBottomWidth: 0.5, marginVertical: height * 0.01 }}
					/>
				)}
				<DateTimePickerModal
					isVisible={datePickerVisible}
					mode="date"
					onConfirm={handleConfirmDate}
					onCancel={() => setDatePickerVisible(false)}
				/>

				{/* Crop type — picked up automatically from the selected sample or a
				    recognized subject ID (see the lookup effect above); the lab can
				    still override it, e.g. for an ad-hoc ID that lookup didn't
				    resolve. Determines which quality metrics below apply. */}
				<Text style={styles.fieldLabel}>{t("cropType")}</Text>
				<Segmented
					options={[
						{ value: "wheat", label: t("wheat") },
						{ value: "sugarcane", label: t("sugarcane") },
					]}
					value={form.commodity}
					onChange={(v) => set("commodity", v)}
					width={width * 0.86}
				/>

				{form.commodity === "sugarcane" ? (
					<>
						<Input {...inputProps} value={form.brix} setValue={(e) => set("brix", e)} placeholder={`${t("brix")} (%)`} keyboardType="numeric" />
						<Input {...inputProps} value={form.pol} setValue={(e) => set("pol", e)} placeholder={`${t("pol")} (%)`} keyboardType="numeric" />
						<Input {...inputProps} value={form.purity} setValue={(e) => set("purity", e)} placeholder={`${t("purity")} (%)`} keyboardType="numeric" />
					</>
				) : (
					<>
						<Input {...inputProps} value={form.moisture} setValue={(e) => set("moisture", e)} placeholder={`${t("moisture")} (%)`} keyboardType="numeric" />
						<Input {...inputProps} value={form.protein} setValue={(e) => set("protein", e)} placeholder={`${t("protein")} (%)`} keyboardType="numeric" />
						<Input {...inputProps} value={form.gluten} setValue={(e) => set("gluten", e)} placeholder={`${t("gluten")} (%)`} keyboardType="numeric" />
					</>
				)}

				{/* Contamination toggles */}
				<View style={styles.switchRow}>
					<Text style={styles.switchLabel}>{t("pesticides")}</Text>
					<Switch value={form.pesticides} onValueChange={(v) => set("pesticides", v)} trackColor={{ true: "#c62828" }} />
				</View>
				<View style={styles.switchRow}>
					<Text style={styles.switchLabel}>{t("aflatoxin")}</Text>
					<Switch value={form.aflatoxin} onValueChange={(v) => set("aflatoxin", v)} trackColor={{ true: "#c62828" }} />
				</View>

				{/* Grade */}
				<Text style={styles.fieldLabel}>{t("grade")}</Text>
				<Segmented
					options={GRADES.map((g) => ({ value: g, label: g }))}
					value={form.grade}
					onChange={(v) => set("grade", v)}
					width={width * 0.86}
				/>

				{/* Result */}
				<Text style={styles.fieldLabel}>{t("result")}</Text>
				<Segmented
					options={[
						{ value: "Pass", label: t("pass"), color: "#2e7d32" },
						{ value: "Fail", label: t("fail"), color: "#c62828" },
					]}
					value={form.result}
					onChange={(v) => set("result", v)}
					width={width * 0.86}
				/>

				<Button
					text={submitting ? "…" : t("save")}
					onPress={submitting ? undefined : handleSubmit}
					width={width * 0.86}
					color="white"
					backgroundColor="green"
					style={{ marginTop: height * 0.03 }}
				/>
			</ScrollView>
		</Container>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row", alignItems: "center",
		paddingHorizontal: width * 0.05, paddingTop: height * 0.06, paddingBottom: height * 0.015,
	},
	headText: { fontSize: FontSize.F24, fontWeight: "bold", textAlign: "center", flex: 1 },
	subtitle: { fontSize: FontSize.F18, color: "green", fontWeight: "600", marginBottom: height * 0.015, alignSelf: "flex-start" },
	empty: { fontSize: FontSize.F14, color: "#888", marginBottom: height * 0.02, alignSelf: "flex-start" },
	sampleRow: {
		flexDirection: "row", alignItems: "center", justifyContent: "space-between",
		paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8,
		backgroundColor: "#f7faf7", borderRadius: 10, borderWidth: 1, borderColor: "#dCe8dC",
	},
	sampleRowActive: { borderColor: "green", borderWidth: 2, backgroundColor: "#eef5ee" },
	sampleId: { fontSize: FontSize.F15, fontWeight: "700", color: "#1b5e20" },
	sampleSub: { fontSize: FontSize.F12, color: "#666", marginTop: 2 },
	sampleCheck: { fontSize: FontSize.F20, color: "green", fontWeight: "800", marginLeft: 8 },
	switchRow: {
		flexDirection: "row", alignItems: "center", justifyContent: "space-between",
		width: width * 0.86, marginVertical: height * 0.008,
	},
	switchLabel: { fontSize: FontSize.F16, color: "#333" },
	fieldLabel: { fontSize: FontSize.F16, fontWeight: "600", color: "#444", alignSelf: "flex-start", marginTop: height * 0.018, marginBottom: 6 },
});

export default LabDashboard;
