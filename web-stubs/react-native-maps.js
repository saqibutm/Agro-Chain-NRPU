// Web-only stub for react-native-maps (which is native-only and breaks web
// bundling). Used by metro.config.js when platform === 'web' so the rest of the
// app can run in the browser (e.g., for screenshots). The Map screen renders a
// simple placeholder on web.
import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ style, children }) => (
  <View style={[{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f0e8' }, style]}>
    <Text style={{ color: '#2e7d32', fontWeight: '700' }}>Map view (native only)</Text>
    {children}
  </View>
);

const Noop = () => null;

export default MapView;
export const Marker = Noop;
export const Polyline = Noop;
export const Callout = Noop;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
