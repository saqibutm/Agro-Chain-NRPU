// Web-only stub for react-native-svg / SvgXml, which can crash web bundling/render
// in this project's icon components. Used by metro.config.js when platform === 'web'
// so the app mounts in the browser (e.g., for screenshots). Icons render as small
// transparent placeholders on web; native builds use the real library.
import React from 'react';
import { View } from 'react-native';

const Box = (props) => {
  const w = Number(props.width) || 24;
  const h = Number(props.height) || 24;
  return <View style={[{ width: w, height: h }, props.style]} />;
};

export const SvgXml = Box;
export const SvgUri = Box;
const Noop = () => null;
export const Svg = Box;
export const Path = Noop;
export const Circle = Noop;
export const Rect = Noop;
export const G = Noop;
export const Line = Noop;
export const Polyline = Noop;
export const Polygon = Noop;
export const Text = Noop;
export const Defs = Noop;
export const Stop = Noop;
export const LinearGradient = Noop;
export const ClipPath = Noop;

export default Box;
