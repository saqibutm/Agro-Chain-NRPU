import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Animated } from "react-native";
import { CameraView, Camera } from "expo-camera";

const QRScanner = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [linePosition] = useState(new Animated.Value(0));

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
        navigation.navigate("ProductJourney", { productID });
        setScanned(false);
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <CameraView
                    flash="auto"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barCodeTypes: ["qr", "pdf417"],
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
    },
    innerContainer: {
        flex: 0.5,
        position: "relative",
        overflow: "hidden",
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