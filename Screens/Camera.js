import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Alert from "../Abstracts/Alert";
import Backward from "../Abstracts/Backward";
import { CameraView, useCameraPermissions } from 'expo-camera';

const CameraScreen = ({ navigation }) => {
    const [image, setImage] = useState("");
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const takePicture = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            setImage(photo.uri);
        } catch (e) {
            Alert.alert("Camera error", e.message);
        }
    };

    const usePhoto = () => {
        navigation.navigate("ProductDetail", { imageUri: image });
    };

    const backBtn = (
        <View style={styles.backBtn}>
            <Backward color="white" onPress={() => navigation.goBack()} />
        </View>
    );

    if (permission === null) {
        return (
            <View style={styles.center}>
                {backBtn}
                <Text>Requesting camera permission…</Text>
            </View>
        );
    }
    if (permission && !permission.granted) {
        return (
            <View style={styles.center}>
                {backBtn}
                <Text style={{ marginBottom: 12 }}>Camera access is required.</Text>
                <TouchableOpacity onPress={requestPermission} style={styles.btn}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {image === "" ? (
                <CameraView style={{ flex: 1 }} ref={cameraRef} facing="back">
                    <View style={styles.overlay}>
                        <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
                            <Text style={styles.captureTxt}>Capture</Text>
                        </TouchableOpacity>
                    </View>
                    {backBtn}
                </CameraView>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                    <Image source={{ uri: image }} style={{ width: '100%', height: '70%', resizeMode: 'contain' }} />
                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 20 }}>
                        <TouchableOpacity onPress={() => setImage("")} style={[styles.btn, { backgroundColor: '#555' }]}>
                            <Text style={styles.btnText}>Retake</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={usePhoto} style={[styles.btn, { backgroundColor: 'green' }]}>
                            <Text style={styles.btnText}>Use Photo</Text>
                        </TouchableOpacity>
                    </View>
                    {backBtn}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 },
    captureBtn: { backgroundColor: 'white', borderRadius: 40, paddingHorizontal: 36, paddingVertical: 14 },
    captureTxt: { fontSize: 18, fontWeight: '600', color: '#222' },
    btn: { borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
    btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
    backBtn: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.45)",
        borderRadius: 20,
        padding: 8,
    },
});

export default CameraScreen;
