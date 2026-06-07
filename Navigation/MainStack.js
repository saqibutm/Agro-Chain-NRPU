import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";

import AddFarmer from '../Screens/Farmer/Add';
import ValidFarmer from '../Screens/Farmer/Valid';
import AddMill from '../Screens/Mill/Add';
import ValidMill from '../Screens/Mill/Valid';
import SignIn from '../Screens/Account/SingIn';
import ForgetPassword from '../Screens/Account/ForgetPassword';
import CreateNewPassword from '../Screens/Account/CreateNewPassword';
import ValidCrop from '../Screens/Crop/Valid';
import AddCrop from '../Screens/Crop/Add';
import CameraScreen from '../Screens/Camera';
import MapScreen from '../Screens/MapScreen';
import ProductDetail from '../Screens/ProductDetail';
import BottomTab from "./BottomTab";
import CodeVerificationScreen from "../Screens/Account/CodeVerificationScreen";
import QRScanner from "../Screens/QRScanner";
import FAQs from "../Screens/FAQs";
import ProductJourney from "../Screens/ProductJourney";
import FraudAlerts from "../Screens/FraudAlerts";
import LabDashboard from "../Screens/LabDashboard";
import About from "../Screens/About";
import { useAuth } from "../Services/AuthContext";

const Stack = createNativeStackNavigator();

export function MainStack() {
    const { user, loading } = useAuth();

    // While restoring a persisted session, show a brief loader to avoid a
    // flash of the login screen for already-authenticated users.
    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
                <ActivityIndicator size="large" color="green" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // ── Unauthenticated: auth flow only ──
                <Stack.Group>
                    <Stack.Screen name="SingIn" component={SignIn} />
                    <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
                    <Stack.Screen name="CreateNewPassword" component={CreateNewPassword} />
                    <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} />
                </Stack.Group>
            ) : (
                // ── Authenticated: full app ──
                <Stack.Group>
                    <Stack.Screen name="BottomTab" component={BottomTab} />
                    <Stack.Screen name="AddFarmer" component={AddFarmer} />
                    <Stack.Screen name="ValidFarmer" component={ValidFarmer} />
                    <Stack.Screen name="AddMill" component={AddMill} />
                    <Stack.Screen name="ValidMill" component={ValidMill} />
                    <Stack.Screen name="AddCrop" component={AddCrop} />
                    <Stack.Screen name="ValidCrop" component={ValidCrop} />
                    <Stack.Screen name="CameraScreen" component={CameraScreen} />
                    <Stack.Screen name="ProductDetail" component={ProductDetail} />
                    <Stack.Screen name="MapScreen" component={MapScreen} />
                    <Stack.Screen name="QRScanner" component={QRScanner} />
                    <Stack.Screen name="FAQs" component={FAQs} />
                    <Stack.Screen name="ProductJourney" component={ProductJourney} />
                    <Stack.Screen name="FraudAlerts" component={FraudAlerts} />
                    <Stack.Screen name="LabDashboard" component={LabDashboard} />
                    <Stack.Screen name="About" component={About} />
                </Stack.Group>
            )}
        </Stack.Navigator>
    );
}
