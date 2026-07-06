import { Dimensions, View, StyleSheet, Text, Alert } from 'react-native'
import React, { useState } from 'react'
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { FontSize } from '../../Abstracts/Theme'
import Backward from '../../Abstracts/Backward'
import { supabase } from '../../Services/supabase'
import { DEMO_MODE } from '../../Services/config'
const { height, width } = Dimensions.get("screen")

const ForgetPassword = ({ navigation }) => {
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!username.trim()) {
            Alert.alert("Required", "Please enter your username.")
            return
        }
        setLoading(true)
        try {
            if (DEMO_MODE) {
                await new Promise(r => setTimeout(r, 600))
            } else {
                const email = `${username.trim().toLowerCase()}@agrochain.local`
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: { shouldCreateUser: false },
                })
                if (error) throw error
            }
            navigation.navigate("CodeVerificationScreen", {
                email: `${username.trim().toLowerCase()}@agrochain.local`,
            })
        } catch (err) {
            Alert.alert("Error", err.message || "Could not send reset code.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.7, fontSize: FontSize.F16, textAlign: "center" }}>
                    Enter your username and we'll send a reset code.
                </Text>
                <Input
                    style={{ marginTop: height * 0.04 }}
                    value={username}
                    setValue={setUsername}
                    placeholder={"Username"}
                    width={width * 0.86}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.01}
                    backgroundColor={"white"}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <Button
                    text={loading ? "Sending…" : "Send Code"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    onPress={loading ? undefined : handleSend}
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

export default ForgetPassword
