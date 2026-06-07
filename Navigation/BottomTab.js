import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TransactionHistory from '../Screens/TransactionHistory';
import SupplyChainTracking from '../Screens/SupplyChainTracking';
import Settings from '../Screens/Settings';
import Home from '../Screens/Home';

import Accounts from "../Svgs/Accounts";
import Payments from "../Svgs/Tracking";
import SettingsIcon from "../Svgs/Settings";
import HomeIcon from "../Svgs/Home";
import { FontSize } from '../Abstracts/Theme';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
    return (
        <Tab.Navigator initialRouteName='Wheat Produced' screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
                borderTopWidth: 1.4,
            },
        }}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <HomeIcon width={FontSize.F28} height={FontSize.F28} color={focused ? "green" : "#b3b3b3"} />
                    ),
                }}
            />
            <Tab.Screen
                name="Transaction History"
                component={TransactionHistory}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Accounts width={FontSize.F28} height={FontSize.F28} color={focused ? "green" : "#b3b3b3"} />
                    ),
                }}
            />
            <Tab.Screen
                name="Supply Chain Tracking"
                component={SupplyChainTracking}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <Payments width={FontSize.F28} height={FontSize.F28} color={focused ? "green" : "#b3b3b3"} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <SettingsIcon width={FontSize.F28} height={FontSize.F28} color={focused ? "green" : "#b3b3b3"} />
                    ),
                }}
            />

        </Tab.Navigator>
    )
}

export default BottomTab;