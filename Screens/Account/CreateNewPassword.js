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

const CreateNewPassword = ({ navigation }) => {
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" })
    const [loading, setLoading] = useState(false)

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    const handleReset = async () => {
        if (!formData.password || !formData.confirmPassword) {
            Alert.alert("Required", "Please fill in both password fields.")
            return
        }
        if (formData.password.length < 6) {
            Alert.alert("Too short", "Password must be at least 6 characters.")
            return
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert("Mismatch", "Passwords do not match.")
            return
        }
        setLoading(true)
        try {
            if (!DEMO_MODE) {
                const { error } = await supabase.auth.updateUser({ password: formData.password })
                if (error) throw error
            }
            Alert.alert("Password updated", "Your password has been changed successfully.", [
                { text: "Sign In", onPress: () => navigation.navigate("SingIn") },
            ])
        } catch (err) {
            Alert.alert("Error", err.message || "Could not update password.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Create New Password</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.8, fontSize: FontSize.F16, textAlign: "center" }}>
                    Your new password must be different from your previous password.
                </Text>
                <Input
                    value={formData.password}
                    setValue={(text) => handleChange("password", text)}
                    placeholder={"New Password"}
                    width={width * 0.86}
                    fontSize={FontSize.F16}
                    paddingHorizontal={width * 0.05}
                    paddingVertical={height * 0.014}
                    backgroundColor={"white"}
                    style={{ marginTop: height * 0.04 }}
                    secureTextEntry
                />
                <Input
                    value={formData.confirmPassword}
                    setValue={(text) => handleChange("confirmPassword", text)}
                    placeholder={"Confirm Password"}
                    width={width * 0.86}
                    fontSize={FontSize.F16}
                    paddingHorizontal={width * 0.05}
                    paddingVertical={height * 0.014}
                    backgroundColor={"white"}
                    style={{ marginTop: height * 0.016 }}
                    secureTextEntry
                />
                <Button
                    text={loading ? "Updating…" : "Reset Password"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    onPress={loading ? undefined : handleReset}
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

export default CreateNewPassword
