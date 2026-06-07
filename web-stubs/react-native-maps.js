// Web-only stub for react-native-maps (native-only library).
// On web it renders a lightweight schematic GPS map: the route's real
// coordinates are plotted as numbered pins connected by a route line, with a
// coordinate list — so the GPS/traceability feature is demonstrable in the
// browser and in screenshots. Native builds use the real react-native-maps.
import React from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

function project(points) {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLa = Math.min(...lats), maxLa = Math.max(...lats);
  const minLo = Math.min(...lngs), maxLo = Math.max(...lngs);
  const pad = 0.16;
  const nx = (lo) => ((maxLo === minLo ? 0.5 : (lo - minLo) / (maxLo - minLo)) * (1 - 2 * pad) + pad);
  const ny = (la) => ((1 - (maxLa === minLa ? 0.5 : (la - minLa) / (maxLa - minLa))) * (1 - 2 * pad) + pad);
  return points.map((p) => ({ ...p, x: nx(p.longitude), y: ny(p.latitude) }));
}

const Dot = ({ x, y }) => (
  <View style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`,
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#2e7d32', marginLeft: -3, marginTop: -3, opacity: 0.7 }} />
);

const Pin = ({ x, y, n, color, title }) => (
  <View style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, marginLeft: -14, marginTop: -28, alignItems: 'center' }}>
    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: color, borderWidth: 2, borderColor: 'white',
      alignItems: 'center', justifyContent: 'center', elevation: 3 }}>
      <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{n}</Text>
    </View>
    {title ? (
      <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2, maxWidth: 120 }}>
        <Text numberOfLines={1} style={{ fontSize: 9, color: '#1b3a1b', fontWeight: '600' }}>{title}</Text>
      </View>
    ) : null}
  </View>
);

const MapView = ({ style, children }) => {
  // Read marker coordinates / polyline from the children MapScreen renders.
  const markers = [];
  React.Children.forEach(children, (c) => {
    if (!c) return;
    const kids = c.props && c.props.children ? c.props.children : c;
    React.Children.forEach(kids, (k) => {
      if (k && k.props && k.props.coordinate) markers.push({ ...k.props.coordinate, title: k.props.title, color: k.props.pinColor });
    });
  });

  if (!markers.length) {
    return (
      <View style={[{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f0e8' }, style]}>
        <Text style={{ color: '#2e7d32', fontWeight: '700' }}>GPS map (open on a device)</Text>
      </View>
    );
  }

  const pts = project(markers);
  // Interpolated route dots between consecutive pins.
  const routeDots = [];
  for (let i = 0; i < pts.length - 1; i++) {
    for (let t = 1; t <= 6; t++) {
      const f = t / 7;
      routeDots.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f });
    }
  }
  const palette = (i) => (i === 0 ? 'green' : i === pts.length - 1 ? '#c62828' : '#ef6c00');

  return (
    <View style={[{ backgroundColor: '#e8f3e1' }, style]}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.62, backgroundColor: '#dcedc8', overflow: 'hidden' }}>
        {/* faint field stripes for map texture */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 12.5}%`, height: 1, backgroundColor: '#c5e1a5' }} />
        ))}
        {routeDots.map((d, i) => <Dot key={i} {...d} />)}
        {pts.map((p, i) => <Pin key={i} x={p.x} y={p.y} n={i + 1} color={palette(i)} title={p.title} />)}
        <View style={{ position: 'absolute', bottom: 6, right: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, color: '#1b3a1b', fontWeight: '700' }}>Punjab, Pakistan</Text>
        </View>
      </View>
      {/* coordinate list */}
      <ScrollView style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.36, backgroundColor: 'white', padding: 12 }}>
        <Text style={{ fontWeight: '800', color: 'green', marginBottom: 6, fontSize: 13 }}>GPS CUSTODY TRAIL</Text>
        {markers.map((m, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: palette(i), alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>{i + 1}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 12, color: '#222' }} numberOfLines={1}>
              {m.title || 'Stage'}  ·  {m.latitude.toFixed(4)}, {m.longitude.toFixed(4)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const Noop = () => null;
export const Marker = Noop;
export const Polyline = Noop;
export const Callout = Noop;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';
export default MapView;
