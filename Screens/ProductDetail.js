import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Backward from "../Abstracts/Backward";
import Container from "../Abstracts/Container";
import Button from "../Abstracts/Button";
import { FontSize } from '../Abstracts/Theme';
const { width, height } = Dimensions.get("window");

const ProductDetail = ({ navigation }) => {

    return (
        <View style={{ flex: 1, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <View style={{
                flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
                justifyContent: "space-between", width: width * 0.8, paddingHorizontal: width * 0.05
            }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>Product Details</Text>
            </View>

            <Container style={{ flex: 1, marginTop: height * 0.03, paddingHorizontal: width * 0.06 }}>
                <View style={{ flexDirection: "row", paddingVertical: height * 0.014 }}>
                    <Text style={styles.title}>Batch ID:</Text>
                    <Text style={styles.data}>123</Text>
                </View>
                <View style={{ flexDirection: "row", }}>
                    <Text style={styles.title}>Crop Name:</Text>
                    <Text style={styles.data}>Wheat</Text>
                </View>
                <View style={{ flexDirection: "row", paddingVertical: height * 0.014 }}>
                    <Text style={styles.title}>Farmer Name:</Text>
                    <Text style={styles.data}>Muhammad Ali</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.title}>Date:</Text>
                    <Text style={styles.data}>20-10-2020</Text>
                </View>

                <Button
                    text={"Location"}
                    width={width * 0.88}
                    color={"white"}
                    backgroundColor={"green"}
                    style={{ marginTop: height * 0.04 }}
                    onPress={() => navigation.navigate("MapScreen")}
                />
            </Container>
        </View>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F26,
        fontWeight: "bold",
        textAlign: "center"
    },
    title: {
        fontSize: FontSize.F22,
        fontWeight: "600",
        width: width * 0.4
    },
    data: {
        fontSize: FontSize.F22,
        fontWeight: "400",
        width: width * 0.6
    }
})

export default ProductDetail