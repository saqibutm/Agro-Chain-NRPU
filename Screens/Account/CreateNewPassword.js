import { Dimensions, View, StyleSheet, Text, } from 'react-native'
import React, { useState } from 'react'
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { FontSize } from '../../Abstracts/Theme'
import Backward from '../../Abstracts/Backward'
const { height, width } = Dimensions.get("screen")

const CreateNewPassword = ({ navigation }) => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    })

    const handleChange = (key, value) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [key]: value,
        }));
    };

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Create New Password</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.8, fontSize: FontSize.F16, textAlign: "center" }}>
                    Your new password must be different from previous password
                </Text>
                <Input
                    value={formData.password}
                    setValue={(text) => handleChange("password", text)}
                    placeholder={"Password"}
                    width={width * 0.86}
                    fontSize={FontSize.F16}
                    paddingHorizontal={width * 0.05}
                    paddingVertical={height * 0.014}
                    backgroundColor={"white"}
                    style={{ marginTop: height * 0.04 }}
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
                />
                <Button
                    text={"Reset Password"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    // onPress={() => navigation.navigate("CreateNewPassword")}
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
    text: {
        fontSize: FontSize.F18,
        color: 'grey',
        marginTop: height * 0.02
    }
})

export default CreateNewPassword