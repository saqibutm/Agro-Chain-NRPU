import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Container from '../Abstracts/Container'
import Backward from '../Abstracts/Backward'
import { FontSize } from '../Abstracts/Theme'
const { width, height } = Dimensions.get("window");

const FAQs = ({ navigation }) => {
    return (
        <Container style={{ flex: 1 }}>
            <View style={{
                flexDirection: "row", alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>FAQs</Text>
            </View>
        </Container>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: FontSize.F26,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: height * 0.04,
        flex: 1
    }
})

export default FAQs