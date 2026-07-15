import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Animated } from "react-native";
import { Camera, CameraView } from "expo-camera";
import Backward from "../Abstracts/Backward";

const QRScanner = ({ navigation, route }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [linePosition] = useState(new Animated.Value(0));
    // Opened from a form (AddMill/LabDashboard "Scan QR" button) instead of
    // the Home quick action: return the scanned ID to that screen's params
    // instead of jumping to ProductJourney.
    const { returnScreen, returnParamKey } = route?.params || {};

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        };
        getCameraPermissions();
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.timing(linePosition, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start(() => {
            linePosition.setValue(0);
        });
    }, [linePosition]);

    const handleBarCodeScanned = ({ data }) => {
        setScanned(true);
        // The QR encodes a product ID (or a verify URL ending in the product ID).
        const productID = data.includes("/") ? data.split("/").pop() : data;
        if (returnScreen && returnParamKey) {
            // navigate() (not push/goBack) pops back to the existing instance
            // of returnScreen already on the stack and merges these params
            // into whatever it already had (e.g. AddMill's farmer_id).
            navigation.navigate(returnScreen, { [returnParamKey]: productID });
        } else {
            navigation.navigate("ProductJourney", { productID });
        }
        setScanned(false);
    };

    const backBtn = (
        <View style={styles.backBtn}>
            <Backward color="white" onPress={() => navigation.goBack()} />
        </View>
    );

    if (hasPermission === null) {
        return (
            <View style={styles.messageContainer}>
                {backBtn}
                <Text>Requesting for camera permission</Text>
            </View>
        );
    }
    if (hasPermission === false) {
        return (
            <View style={styles.messageContainer}>
                {backBtn}
                <Text>No access to camera</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <CameraView
                    flash="auto"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "pdf417"],
                    }}
                    style={StyleSheet.absoluteFillObject}
                />
                <Animated.View
                    style={[styles.line, {
                        transform: [
                            {
                                translateY: linePosition.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 450],
                                }),
                            },
                        ],
                    },]}
                />
            </View>
            {backBtn}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },
    messageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    innerContainer: {
        flex: 0.5,
        position: "relative",
        overflow: "hidden",
    },
    backBtn: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.45)",
        borderRadius: 20,
        padding: 8,
    },
    line: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        height: 2,
        backgroundColor: "red",
    },
});

export default QRScanner;