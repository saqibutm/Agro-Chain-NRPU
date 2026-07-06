import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MainStack } from './Navigation/MainStack';
import { SyncProvider } from './Services/SyncContext';
import { AuthProvider } from './Services/AuthContext';
import { I18nProvider } from './i18n/I18nContext';

export default function App() {

  return (
    <I18nProvider>
      <AuthProvider>
        <SyncProvider>
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </SyncProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
