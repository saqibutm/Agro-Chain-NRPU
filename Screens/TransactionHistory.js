import React from 'react'
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native'
import Backward from "../Abstracts/Backward";
const { width, height } = Dimensions.get("window");

const TransactionHistory = ({ navigation }) => {
    const data = [
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
        {
            cropId: "1",
            batchNumber: "100",
            address: "Clock Tower, Fasialabad, Pakistan",
            date: "20-08-2024"
        },
    ]

    return (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: height * 0.06, backgroundColor: "white" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Backward onPress={() => navigation.goBack()} />
                <Text style={styles.headText}>Transaction History</Text>
            </View>
            <ScrollView style={{ marginTop: height * 0.02 }} showsVerticalScrollIndicator={false}>
                {data.map((transaction, index) => (
                    <View key={index} style={[styles.transactionItem, index === data.length - 1 ? { borderBottomWidth: 0, paddingBottom: height * 0.03 } : { borderBottomWidth: 1 }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <View>
                                <Text style={{ fontWeight: 600, fontSize: 16 }}>Crop ID: {index + 1}</Text>
                                <Text style={{ fontWeight: 700, fontSize: 16, color: "gray" }}>Batch Number: {transaction.batchNumber}</Text>
                            </View>
                            <Text style={{ fontWeight: 600, fontSize: 14 }}>Date: {transaction.date}</Text>
                        </View>
                        <Text style={{ color: "#575757" }}>Address: {transaction.address}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    headText: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1
    },
    transactionItem: {
        marginVertical: height * 0.01,
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
        paddingBottom: 4
    },
})

export default TransactionHistory