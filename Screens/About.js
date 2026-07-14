import React from "react";
import { View, Text, Image, ScrollView, StyleSheet, Dimensions } from "react-native";
import Backward from "../Abstracts/Backward";
import { FontSize, Colors } from "../Abstracts/Theme";
import { useI18n } from "../i18n/I18nContext";
const { width, height } = Dimensions.get("window");

// ── Local design tokens ──────────────────────────────────────────────────────
// Stays within the app's existing green brand while giving the acknowledgment
// section a consistent, intentional palette and spacing rhythm.
const C = {
    primary: "green",        // matches buttons/headers used across the app
    primaryDark: "#1b5e20",
    ink: "#1b3a1b",
    body: Colors.DarkGrey,   // #575757
    muted: "#8aa08a",
    line: "#dCe8dC",
    cardBg: "#f7faf7",
    tint: "#eef5ee",
    surface: "#ffffff",
};
const S = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 }; // spacing scale

/*
 * ── How to add the official logos ──────────────────────────────────────────
 * Drop the image files into the /Images folder, then replace the `source` of
 * the matching <InstitutionLogo/> with a require():
 *
 *   HEC logo  -> Images/hec-logo.png   (pass source={require("../Images/hec-logo.png")})
 *   UAF logo  -> Images/uaf-logo.png   (pass source={require("../Images/uaf-logo.png")})
 *
 * When `source` is provided the real image is shown; otherwise a branded
 * monogram placeholder renders, so the bundler never fails on a missing file.
 * ───────────────────────────────────────────────────────────────────────────
 */
const InstitutionLogo = ({ monogram, name, role, source }) => (
    <View style={styles.instTile} accessible accessibilityLabel={`${name} — ${role}`}>
        <View style={styles.logoCircle}>
            {source ? (
                <Image source={source} style={styles.logoImg} resizeMode="contain" />
            ) : (
                <Text style={styles.logoMonogram}>{monogram}</Text>
            )}
        </View>
        <Text style={styles.instRole}>{role}</Text>
        <Text style={styles.instName} numberOfLines={3}>{name}</Text>
    </View>
);

// Labeled metadata row used for the institution / funding facts.
const MetaRow = ({ label, children }) => (
    <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{children}</Text>
    </View>
);

const About = ({ navigation }) => {
    const { t } = useI18n();

    return (
        <View style={styles.screen}>
            {/* Branded app bar (consistent with the Product Journey header) */}
            <View style={styles.appBar}>
                <Backward color="white" onPress={() => navigation.goBack()} />
                <Text style={styles.appBarTitle} accessibilityRole="header">{t("about")}</Text>
                <View style={styles.appBarSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Hero: app identity */}
                <View style={styles.hero}>
                    <View style={styles.logoChip}>
                        <Image
                            source={require("../Images/Logo.png")}
                            style={styles.appLogo}
                            resizeMode="contain"
                            accessibilityLabel="AgroChain logo"
                        />
                    </View>
                    <Text style={styles.appName}>{t("appName")}</Text>
                    <Text style={styles.appTagline}>
                        Wheat &amp; Sugar Traceability using IoT and Blockchain
                    </Text>
                    <Text style={styles.developedBy}>
                        Developed by the Precision Agriculture Lab / Department of Computer
                        Science, University of Agriculture, Faisalabad
                    </Text>
                </View>

                {/* Section eyebrow */}
                <View style={styles.eyebrowRow}>
                    <View style={styles.eyebrowRule} />
                    <Text style={styles.eyebrow}>{t("projectAcknowledgment")}</Text>
                    <View style={styles.eyebrowRule} />
                </View>

                {/* Acknowledgment card */}
                <View style={styles.card} accessible accessibilityLabel={t("projectAcknowledgment")}>
                    {/* Institution logos with roles */}
                    <View style={styles.instRow}>
                        <InstitutionLogo
                            monogram="HEC"
                            role={t("fundingAgency")}
                            name="Higher Education Commission, Pakistan"
                        />
                        <InstitutionLogo
                            monogram="UAF"
                            role={t("hostInstitution")}
                            name="University of Agriculture Faisalabad"
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Project title — the visual anchor of the card */}
                    <Text style={styles.projectTitle}>
                        AgroChain
                    </Text>
                    <Text style={styles.projectSubtitle}>
                        A Wheat and Sugar Traceability Solution using IoT and Blockchain
                    </Text>

                    {/* NRPU project number */}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{t("projectNumber")} 15516</Text>
                    </View>

                    {/* Intro paragraph */}
                    <Text style={styles.paragraph}>
                        This application was developed as part of a research project funded by the
                        Higher Education Commission (HEC) of Pakistan under the National Research
                        Program for Universities (NRPU).
                    </Text>

                    {/* Facts */}
                    <MetaRow label={t("hostInstitution")}>
                        Precision Agriculture Lab / Department of Computer Science, University of
                        Agriculture, Faisalabad, Pakistan
                    </MetaRow>
                    <MetaRow label={t("fundingAgency")}>
                        Higher Education Commission (HEC), Pakistan — National Research Program for
                        Universities (NRPU)
                    </MetaRow>

                    {/* Funding acknowledgment callout */}
                    <View style={styles.callout}>
                        <Text style={styles.calloutText}>
                            “The authors gratefully acknowledge the financial support provided by the
                            Higher Education Commission (HEC), Pakistan, under the National Research
                            Program for Universities (NRPU).”
                        </Text>
                    </View>
                </View>

                <Text style={styles.version}>{t("appName")} · v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "white" },

    // App bar
    appBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.primary,
        paddingTop: height * 0.06,
        paddingBottom: S.md,
        paddingHorizontal: width * 0.05,
    },
    appBarTitle: {
        flex: 1,
        textAlign: "center",
        color: "white",
        fontSize: FontSize.F22,
        fontWeight: "bold",
        letterSpacing: 0.3,
    },
    appBarSpacer: { width: 22 }, // balances the back arrow so the title is truly centered

    // Layout
    scroll: {
        paddingHorizontal: width * 0.05,
        paddingTop: S.xl,
        paddingBottom: height * 0.06,
        alignItems: "center",
    },

    // Hero
    hero: { alignItems: "center", width: "100%", maxWidth: 560, marginBottom: S.xl },
    logoChip: {
        backgroundColor: C.surface,
        borderRadius: 20,
        padding: S.md,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    appLogo: { width: width * 0.36, maxWidth: 160, height: height * 0.1 },
    appName: { fontSize: FontSize.F32, fontWeight: "bold", color: C.primary, marginTop: S.md },
    appTagline: {
        fontSize: FontSize.F14,
        color: C.body,
        textAlign: "center",
        marginTop: S.xs,
        paddingHorizontal: S.md,
        lineHeight: FontSize.F14 * 1.4,
    },
    developedBy: {
        fontSize: FontSize.F13,
        fontWeight: "700",
        color: C.primaryDark,
        textAlign: "center",
        marginTop: S.sm,
        paddingHorizontal: S.md,
        lineHeight: FontSize.F13 * 1.4,
    },

    // Section eyebrow
    eyebrowRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        maxWidth: 560,
        marginBottom: S.md,
    },
    eyebrowRule: { flex: 1, height: 1, backgroundColor: C.line },
    eyebrow: {
        fontSize: FontSize.F12,
        fontWeight: "800",
        color: C.primary,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginHorizontal: S.md,
    },

    // Card
    card: {
        width: "100%",
        maxWidth: 560,
        backgroundColor: C.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.line,
        borderTopWidth: 4,
        borderTopColor: C.primary,
        padding: width * 0.055,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },

    // Institution tiles
    instRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        gap: S.md,
    },
    instTile: { alignItems: "center", width: width * 0.34, maxWidth: 150 },
    logoCircle: {
        width: width * 0.2,
        maxWidth: 88,
        height: width * 0.2,
        maxHeight: 88,
        borderRadius: 999,
        backgroundColor: C.surface,
        borderWidth: 2,
        borderColor: C.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    logoMonogram: { fontSize: FontSize.F22, fontWeight: "900", color: C.primary, letterSpacing: 0.5 },
    logoImg: { width: "76%", height: "76%" },
    instRole: {
        fontSize: FontSize.F10,
        fontWeight: "800",
        color: C.muted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginTop: S.sm,
        textAlign: "center",
    },
    instName: {
        fontSize: FontSize.F13,
        fontWeight: "600",
        color: C.ink,
        textAlign: "center",
        marginTop: 2,
        lineHeight: FontSize.F13 * 1.3,
    },

    divider: { height: 1, backgroundColor: C.line, marginVertical: S.lg },

    // Project title block
    projectTitle: {
        fontSize: FontSize.F26,
        fontWeight: "800",
        color: C.primaryDark,
        textAlign: "center",
        letterSpacing: 0.3,
    },
    projectSubtitle: {
        fontSize: FontSize.F16,
        fontWeight: "600",
        color: C.ink,
        textAlign: "center",
        marginTop: S.xs,
        lineHeight: FontSize.F16 * 1.4,
    },
    badge: {
        alignSelf: "center",
        backgroundColor: C.primary,
        borderRadius: 18,
        paddingVertical: S.sm,
        paddingHorizontal: S.lg,
        marginTop: S.md,
    },
    badgeText: { color: "white", fontSize: FontSize.F14, fontWeight: "700", letterSpacing: 0.3 },

    paragraph: {
        fontSize: FontSize.F14,
        color: C.body,
        lineHeight: FontSize.F14 * 1.6,
        marginTop: S.lg,
    },

    // Metadata rows
    metaRow: { marginTop: S.lg },
    metaLabel: {
        fontSize: FontSize.F12,
        fontWeight: "800",
        color: C.primary,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: S.xs,
    },
    metaValue: { fontSize: FontSize.F14, color: "#333", lineHeight: FontSize.F14 * 1.55 },

    // Funding callout
    callout: {
        marginTop: S.lg,
        backgroundColor: C.tint,
        borderLeftWidth: 4,
        borderLeftColor: C.primary,
        borderRadius: 10,
        padding: S.md,
    },
    calloutText: {
        fontSize: FontSize.F13,
        fontStyle: "italic",
        color: C.ink,
        lineHeight: FontSize.F13 * 1.7,
    },

    version: { fontSize: FontSize.F12, color: C.muted, marginTop: S.xl, letterSpacing: 0.5 },
});

export default About;
