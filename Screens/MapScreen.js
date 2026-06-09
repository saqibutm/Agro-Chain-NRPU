import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import MapView, { Marker, Polyline } from 'react-native-maps';
import Backward from '../Abstracts/Backward';
import { FontSize } from '../Abstracts/Theme';
import { DEMO_MODE } from '../Services/config';
import { WHEAT_PRODUCTS } from '../Services/demoData';
const { width, height } = Dimensions.get("window");

// Default center: Faisalabad, Pakistan (wheat belt).
const DEFAULT = { latitude: 31.4220558, longitude: 73.0923253 };

// Compute a region that frames all provided points.
function regionFor(points) {
    if (!points.length) {
        return { ...DEFAULT, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
    }
    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.05),
        longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.05),
    };
}

const MapScreen = ({ navigation, route }) => {
    // Traceability mode: a list of geotagged custody points passed in. In demo
    // mode, fall back to a sample product's trail when opened standalone.
    let pts = route?.params?.points || [];
    if (!pts.length && DEMO_MODE && WHEAT_PRODUCTS[0]) pts = WHEAT_PRODUCTS[0].geoPoints || [];
    const points = pts.filter(
        (p) => typeof p.latitude === "number" && typeof p.longitude === "number"
    );
    const title = route?.params?.title || (DEMO_MODE ? WHEAT_PRODUCTS[0]?.productName : undefined);
    const isTrail = points.length > 0;

    // Standalone mode: a single draggable pin (legacy behavior).
    const [pin, setPin] = useState(DEFAULT);

    return (
        <View style={styles.container}>
            <View style={styles.backBtn}>
                <Backward width={FontSize.F26} height={FontSize.F26} onPress={() => navigation.goBack()} />
            </View>
            {title ? (
                <View style={styles.titleBar}>
                    <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
                </View>
            ) : null}

            <MapView style={styles.map} initialRegion={regionFor(isTrail ? points : [pin])}>
                {isTrail ? (
                    <>
                        {points.map((p, i) => (
                            <Marker
                                key={i}
                                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                                title={`${i + 1}. ${p.label || "Stage"}`}
                                description={p.timestamp || ""}
                                pinColor={i === 0 ? "green" : i === points.length - 1 ? "red" : "orange"}
                            />
                        ))}
                        {points.length > 1 && (
                            <Polyline
                                coordinates={points.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
                                strokeColor="green"
                                strokeWidth={3}
                            />
                        )}
                    </>
                ) : (
                    <Marker
                        coordinate={pin}
                        draggable
                        onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative' },
    map: { width: '100%', height: '100%' },
    backBtn: { position: "absolute", top: height * 0.05, left: width * 0.05, zIndex: 10 },
    titleBar: {
        position: "absolute", top: height * 0.045, alignSelf: "center", zIndex: 10,
        backgroundColor: "rgba(255,255,255,0.92)", paddingVertical: 6, paddingHorizontal: 14,
        borderRadius: 16, maxWidth: width * 0.7,
    },
    titleText: { fontWeight: "bold", fontSize: FontSize.F15, color: "#222" },
});

export default MapScreen
