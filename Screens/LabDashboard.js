import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Switch, Platform, Alert, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Container from "../Abstracts/Container";
import Input from "../Abstracts/TextInput";
import Button from "../Abstracts/Button";
import Backward from "../Abstracts/Backward";
import SyncStatusBar from "../Abstracts/SyncStatusBar";
import { FontSize } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
import { useSync } from "../Services/SyncContext";
import { useAuth } from "../Services/AuthContext";
import { Actions } from "../Services/api";
import { DEFAULT_USERNAME } from "../Services/config";
const { width, height } = Dimensions.get("window");

const GRADES = ["A", "B", "C"];

// Segmented option selector (used for Grade and Result).
const Segmented = ({ options, value, onChange, activeColor = "green" }) => (
	<View style={styles.segment}>
		{options.map((opt) => {
			const active = value === opt.value;
			return (
				<TouchableOpacity
					key={opt.value}
					activeOpacity={0.8}
					onPress={() => onChange(opt.value)}
					style={[styles.segmentBtn, active && { backgroundColor: opt.color || activeColor }]}
				>
					<Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt.label}</Text>
				</TouchableOpacity>
			);
		})}
	</View>
);

const LabDashboard = ({ navigation }) => {
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
		moisture: "",
		protein: "",
		gluten: "",
		pesticides: false,
		aflatoxin: false,
		result: "Pass",
		grade: "A",
	});
	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

	const handleConfirmDate = (date) => {
		if (date) set("testDate", date.toISOString().split("T")[0]);
		setDatePickerVisible(false);
	};

	const handleSubmit = async () => {
		if (!form.reportID || !form.subjectID) {
			Alert.alert(t("recordQualityTest"), t("fillRequired"));
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
			moisture: parseFloat(form.moisture) || 0,
			protein: parseFloat(form.protein) || 0,
			gluten: parseFloat(form.gluten) || 0,
			pesticides: form.pesticides,
			aflatoxin: form.aflatoxin,
			result: form.result,
			grade: form.grade,
			certHash: "",
		};

		const { mode, error } = await submit(Actions.RECORD_QUALITY_TEST, payload);
		setSubmitting(false);

		if (mode === "queued") {
			Alert.alert(
				t("savedOffline"),
				error ? `${t("savedOffline")} (${error})` : t("savedOffline")
			);
		} else {
			Alert.alert(t("recordQualityTest"), t("qualityRecorded"));
		}
		navigation.goBack();
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
				<Text style={styles.subtitle}>{t("recordQualityTest")}</Text>

				<Input {...inputProps} value={form.reportID} setValue={(e) => set("reportID", e)} placeholder={t("reportId")} />
				<Input {...inputProps} value={form.subjectID} setValue={(e) => set("subjectID", e)} placeholder={t("subjectId")} />
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

				<Input {...inputProps} value={form.moisture} setValue={(e) => set("moisture", e)} placeholder={`${t("moisture")} (%)`} keyboardType="numeric" />
				<Input {...inputProps} value={form.protein} setValue={(e) => set("protein", e)} placeholder={`${t("protein")} (%)`} keyboardType="numeric" />
				<Input {...inputProps} value={form.gluten} setValue={(e) => set("gluten", e)} placeholder={`${t("gluten")} (%)`} keyboardType="numeric" />

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
	switchRow: {
		flexDirection: "row", alignItems: "center", justifyContent: "space-between",
		width: width * 0.86, marginVertical: height * 0.008,
	},
	switchLabel: { fontSize: FontSize.F16, color: "#333" },
	fieldLabel: { fontSize: FontSize.F16, fontWeight: "600", color: "#444", alignSelf: "flex-start", marginTop: height * 0.018, marginBottom: 6 },
	segment: { flexDirection: "row", width: width * 0.86, gap: 8 },
	segmentBtn: {
		flex: 1, borderWidth: 1.5, borderColor: "green", borderRadius: 8,
		paddingVertical: 10, alignItems: "center",
	},
	segmentText: { fontSize: FontSize.F16, color: "green", fontWeight: "600" },
	segmentTextActive: { color: "white" },
});

export default LabDashboard;
