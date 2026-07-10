import { Dimensions, View, StyleSheet, Text, Linking } from 'react-native'
import Alert from "../../Abstracts/Alert";
import React from 'react'
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import { FontSize } from '../../Abstracts/Theme'
import Backward from '../../Abstracts/Backward'
const { height, width } = Dimensions.get("screen")

// Self-service email-OTP reset doesn't fit a phone-only, no-email account
// model — instead, route the user to support directly to verify their
// identity and reset the password on their behalf. The number itself isn't
// shown in the UI — the button opens the chat directly.
const ForgetPassword = ({ navigation }) => {
    const openWhatsApp = () => {
        Linking.openURL("https://wa.me/923001750077").catch(() =>
            Alert.alert("Contact Us", "Could not open WhatsApp. Please make sure it's installed.")
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.8, fontSize: FontSize.F16, textAlign: "center" }}>
                    To reset your password, message our support team on WhatsApp and we'll help verify your account.
                </Text>
                <Button
                    text={"Contact us on WhatsApp"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    onPress={openWhatsApp}
                    style={{ marginTop: height * 0.04 }}
                />
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: FontSize.F28,
        fontWeight: 'bold',
        color: 'black',
    },
})

export default ForgetPassword
