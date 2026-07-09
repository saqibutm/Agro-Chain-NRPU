// Cross-platform Alert.alert. react-native-web's Alert is a no-op, so on web
// this falls back to window.alert/confirm and still fires button callbacks.
import { Platform, Alert as RNAlert } from "react-native";

function webAlert(title, message, buttons) {
    const text = [title, message].filter(Boolean).join("\n\n");

    if (!buttons || buttons.length === 0) {
        window.alert(text);
        return;
    }
    if (buttons.length === 1) {
        window.alert(text);
        buttons[0].onPress?.();
        return;
    }

    // window.confirm only supports two outcomes (OK/Cancel), so only two of the
    // buttons are reachable on web: the cancel-styled button (or the first
    // button, if none is marked "cancel") maps to Cancel, and the last
    // remaining button maps to OK. Any further buttons are unreachable on web
    // — a platform limitation, not something this shim can work around.
    const cancelIndex = buttons.findIndex((b) => b.style === "cancel");
    const cancelButton = cancelIndex >= 0 ? buttons[cancelIndex] : buttons[0];
    const confirmButton = buttons.filter((b) => b !== cancelButton).pop() ?? cancelButton;

    if (window.confirm(text)) {
        confirmButton.onPress?.();
    } else {
        cancelButton.onPress?.();
    }
}

const Alert = Platform.OS === "web" ? { alert: webAlert } : RNAlert;

export default Alert;
