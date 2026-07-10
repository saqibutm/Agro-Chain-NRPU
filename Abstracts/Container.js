import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Scale from '../Function/Scale';

// SafeAreaView (not a plain View) so content — logos, headers, the first
// input on a screen — never renders under the status bar/notch, which was
// clipping the AgroChain logo on the Sign In screen.
const Container = ({ style, paddingHorizontal, paddingVertical, children }) => {
  const paddingsize = Scale(375, 20, 20);
  Container.paddingsize = paddingsize;
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: paddingHorizontal ?? paddingsize.WIDTH,
      paddingVertical: paddingVertical ?? 10,
      backgroundColor: "white"
    },
  });
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
};

export default Container;
