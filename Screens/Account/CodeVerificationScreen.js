import React, { useState } from 'react'
import { StyleSheet, View, Text, Dimensions, Alert } from 'react-native'
import Input from "../../Abstracts/TextInput";
import { FontSize } from '../../Abstracts/Theme';
import Container from '../../Abstracts/Container';
import Backward from '../../Abstracts/Backward';
import Button from '../../Abstracts/Button';
import { supabase } from '../../Services/supabase'
import { DEMO_MODE } from '../../Services/config'
const { height, width } = Dimensions.get("screen")

const DEMO_CODE = "1234"

const CodeVerificationScreen = ({ route, navigation }) => {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const { email } = route?.params ?? {}

    const handleVerify = async () => {
        if (code.length < 4) {
            Alert.alert("Invalid code", "Please enter the code sent to your account.")
            return
        }
        setLoading(true)
        try {
            if (DEMO_MODE) {
                if (code !== DEMO_CODE) {
                    Alert.alert("Incorrect code", `Demo code is ${DEMO_CODE}.`)
                    setLoading(false)
                    return
                }
            } else {
                const { error } = await supabase.auth.verifyOtp({
                    email,
                    token: code,
                    type: 'email',
                })
                if (error) throw error
            }
            navigation.navigate("CreateNewPassword", { email })
        } catch (err) {
            Alert.alert("Verification failed", err.message || "Invalid or expired code.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Verify Code</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.74, fontSize: FontSize.F17, textAlign: "center" }}>
                    Enter the security code sent to your account
                    {email ? <Text style={{ fontWeight: "600" }}>{` (${email.split("@")[0]})`}</Text> : null}
                </Text>
                <Input
                    style={{ marginTop: height * 0.03 }}
                    value={code}
                    setValue={setCode}
                    placeholder={"Code"}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.05}
                    paddingVertical={height * 0.01}
                    backgroundColor={"white"}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <Button
                    text={loading ? "Verifying…" : "Verify Code"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    onPress={loading ? undefined : handleVerify}
                    style={{ marginTop: height * 0.04, opacity: loading ? 0.7 : 1 }}
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

export default CodeVerificationScreen;
