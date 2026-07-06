import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';

const CameraScreen = ({ navigation }) => {
    const [image, setImage] = useState("");
    const cameraRef = useRef(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            let photo = await cameraRef.current.takePictureAsync();
            setImage(photo.uri);
            // navigation.navigate("ProductDetail")
            if (__DEV__) console.log(photo);
        }
    };

    const retakePicture = () => {
        setImage("");
    };

    return (
        <View style={{ flex: 1 }}>
            {image === "" ? (
                <Camera style={{ flex: 1 }} ref={cameraRef} type={Camera.Constants.Type.back}>
                    <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
                        <TouchableOpacity onPress={takePicture} style={{ flex: 1, alignSelf: 'flex-end', alignItems: 'center', backgroundColor: "red" }}>
                            <Text style={{ fontSize: 20, marginBottom: 10, color: 'white' }}>Capture</Text>
                        </TouchableOpacity>
                    </View>
                </Camera>
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: image }} style={{ width: 350, height: 350 }} />
                    <TouchableOpacity onPress={retakePicture} style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 18, color: 'blue' }}>Retake Picture</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* <Camera style={{ flex: 1 }} ref={cameraRef} type={Camera.Constants.Type.back}>
                <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
                    <TouchableOpacity onPress={takePicture} style={{ flex: 1, alignSelf: 'flex-end', alignItems: 'center', backgroundColor: "red" }}>
                        <Text style={{ fontSize: 20, marginBottom: 10, color: 'white' }}>Capture</Text>
                    </TouchableOpacity>
                </View>
            </Camera> */}
        </View>
    );
}

export default CameraScreen;
