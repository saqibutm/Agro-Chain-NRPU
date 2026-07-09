import { Dimensions, StyleSheet } from "react-native";
import { FontSize } from "../../Abstracts/Theme";

const { width, height } = Dimensions.get("window");

// Mobile number: exactly 11 digits, starting with 0 (e.g. 03001234567).
// Auth has no email step — this number stands in for both username and email.
export const PHONE_RE = /^0\d{10}$/;

// Roles selectable at sign-in and sign-up. Admin accounts are provisioned
// directly in Supabase and are not selectable here.
export const ROLES = [
    { key: "farmer",    labelKey: "farmer"        },
    { key: "mill",      labelKey: "roleMill"       },
    { key: "lab",       labelKey: "roleLab"        },
    { key: "regulator", labelKey: "roleRegulator"  },
    { key: "consumer",  labelKey: "roleConsumer"   },
];

// Role selector + screen-switch link styles shared by SingIn and SignUp.
export const authStyles = StyleSheet.create({
    roleLabel: {
        alignSelf: "flex-start",
        marginLeft: width * 0.07,
        marginTop: height * 0.025,
        marginBottom: height * 0.01,
        fontSize: FontSize.F16,
        fontWeight: "600",
        color: "green",
    },
    roleGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: width * 0.86,
        gap: 10,
    },
    roleBtn: {
        borderWidth: 1.5,
        borderColor: "green",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    roleBtnActive: { backgroundColor: "green" },
    roleTxt: { color: "green", fontSize: FontSize.F15, fontWeight: "600" },
    roleTxtActive: { color: "white" },
    switchText: {
        marginTop: height * 0.02,
        fontSize: FontSize.F16,
        color: "#555",
    },
    switchLink: {
        color: "green",
        fontWeight: "700",
    },
});
