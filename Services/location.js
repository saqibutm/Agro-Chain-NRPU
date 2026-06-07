// GPS helper. Requests permission and returns the device coordinates.
// Always degrades gracefully: returns { latitude: null, longitude: null }
// if permission is denied or the fix fails, so callers never crash and
// offline capture still works (coords simply omitted/zeroed).
import * as Location from "expo-location";

export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { latitude: null, longitude: null, granted: false };
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      granted: true,
    };
  } catch (e) {
    return { latitude: null, longitude: null, granted: false, error: e.message };
  }
}

// True when a coordinate pair is real (non-null and not 0,0).
export function hasCoords(lat, lng) {
  return (
    lat !== null && lng !== null &&
    lat !== undefined && lng !== undefined &&
    !(Number(lat) === 0 && Number(lng) === 0)
  );
}
