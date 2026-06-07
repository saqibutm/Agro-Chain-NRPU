import React, { useState, useEffect } from 'react'
import { Pressable, StyleSheet, View, Text, Dimensions } from 'react-native'
import Input from "../../Abstracts/TextInput";
import { FontSize } from '../../Abstracts/Theme';
import Container from '../../Abstracts/Container';
import Backward from '../../Abstracts/Backward';
import Button from '../../Abstracts/Button';
const { height, width } = Dimensions.get("screen")

const CodeVerificationScreen = ({ route, navigation }) => {
    const [code, setCode] = useState("")
    const { email } = route.params

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Backward onPress={() => navigation.goBack()} width={26} height={26} style={{ marginLeft: width * 0.055, marginTop: height * 0.06 }} />
            <Container style={{ flex: 1, alignItems: 'center', marginTop: height * 0.05 }}>
                <Text style={styles.title}>Verify Code</Text>
                <Text style={{ color: "black", marginTop: height * 0.02, width: width * 0.74, fontSize: FontSize.F17, textAlign: "center" }}>Enter security code that we sent to your email id
                    <Text style={{ fontWeight: "600" }}>{` `}{email}</Text>
                </Text>
                <Input
                    style={{ marginTop: height * 0.03 }}
                    value={code}
                    setValue={setCode}
                    placeholder={"5843"}
                    fontSize={FontSize.F18}
                    paddingHorizontal={width * 0.05}
                    paddingVertical={height * 0.01}
                    backgroundColor={"white"}
                />
                <Button
                    text={"Verify Code"}
                    width={width * 0.86}
                    backgroundColor={"green"}
                    color={"white"}
                    onPress={() => navigation.navigate("CreateNewPassword")}
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

export default CodeVerificationScreen;