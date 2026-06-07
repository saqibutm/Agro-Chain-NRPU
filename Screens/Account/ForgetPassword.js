import { Dimensions, View, StyleSheet, Text, } from 'react-native'
import React, { useState } from 'react'
import Button from "../../Abstracts/Button";
import Container from "../../Abstracts/Container";
import Input from "../../Abstracts/TextInput";
import { FontSize } from '../../Abstracts/Theme'
import Backward from '../../Abstracts/Backward'
const { height, width } = Dimensions.get("screen")

const ForgetPassword = ({ navigation }) => {
    const [email, setEmail] = useState("")

    const handleGetCodePress = () => {
        navigation.navigate("CodeVerificationScreen", { email });
    };

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.7, fontSize: FontSize.F16, textAlign: "center" }}>Enter the email address associated with your account.</Text>
                <Input
                    style={{ marginTop: height * 0.04 }}
                    value={email}
                    setValue={setEmail}
                    placeholder={"Email"}
                    width={width * 0.86}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.04}
                    paddingVertical={height * 0.01}
                    backgroundColor={"white"}
                />
                <Button
                    text={"Send Email"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    onPress={handleGetCodePress}
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

export default ForgetPassword