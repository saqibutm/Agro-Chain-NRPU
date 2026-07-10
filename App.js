import 'react-native-url-polyfill/auto';
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { MainStack } from './Navigation/MainStack';
import { SyncProvider } from './Services/SyncContext';
import { AuthProvider } from './Services/AuthContext';
import { I18nProvider } from './i18n/I18nContext';
import ErrorBoundary from './Abstracts/ErrorBoundary';

// secureStorage.js already falls back gracefully (encrypted -> plain ->
// give up) when local storage misbehaves, without blocking sign-in — these
// are informational, not actionable in-app. Still logged to the console.
// This banner only ever appears in dev builds; LogBox is a no-op in
// production/TestFlight/App Store builds.
LogBox.ignoreLogs(['secureSessionStorage:']);

export default function App() {

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ErrorBoundary>
          <AuthProvider>
            <SyncProvider>
              <NavigationContainer>
                <MainStack />
              </NavigationContainer>
            </SyncProvider>
          </AuthProvider>
        </ErrorBoundary>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
