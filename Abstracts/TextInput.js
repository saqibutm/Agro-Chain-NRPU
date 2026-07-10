import React, { useState } from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Eye from '../Svgs/Eye';
import EyeOff from '../Svgs/EyeOff';

const Input = ({
  width,
  height,
  value,
  setValue,
  style,
  placeholder,
  elevation,
  onFocus,
  backgroundColor,
  color,
  placeholderTextColor,
  seperator,
  seperatorHeight,
  seperatorColor,
  fontSize,
  paddingVertical,
  paddingHorizontal,
  Leading_icon,
  onPress,
  Tailing_icon,
  leadingcolor,
  LeadingButton,
  TailingButton,
  tailingcolor,
  borderWidth,
  borderColor,
  borderRadius,
  leadingsize,
  tailingsize,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  secureTextEntry,
  showPasswordToggle,
  maxLength,
  returnKeyType,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canToggle = secureTextEntry && showPasswordToggle;
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
    },
    center: {
      alignSelf: 'center',
    },
    view: {
      width: width ?? '90%',
      paddingVertical: paddingVertical ?? 5,
      paddingHorizontal: paddingHorizontal ?? 7,
      backgroundColor: backgroundColor ?? 'rgba(0, 0)',
      elevation: elevation ?? 0,
      borderRadius: borderRadius ?? 10,
      borderWidth: borderWidth ?? 1,
      borderColor: borderColor ?? '#aaaaaa',
    },
    input: {
      fontSize: fontSize ?? 12,
      flex: 1,
      flexGrow: 1,
      height: height ? height : null,
      color: color ?? 'black',
    },
    seperator: {
      height: seperatorHeight ?? '80%',
      alignSelf: 'center',
      marginHorizontal: 5,
      width: seperator ?? 0,
      backgroundColor: seperatorColor ?? 'black',
    },
    leading: {
      flex: 0.15,
      alignItems: 'center',
    },
    tailing: {
      flex: 0.15,
      alignItems: 'center',
    },
    toggleBtn: {
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  return (
    <View style={[styles.row, styles.view, style]}>
      {Leading_icon !== undefined ? (
        LeadingButton !== undefined ? (
          <LeadingButton
            onPress={() => onPress()}
            style={styles.leading}
            width={null}
            TextIcon={Leading_icon}
            texticonsize={leadingsize}
            texticoncolor={leadingcolor}
          />
        ) : (
          <View style={[styles.center, styles.leading]}>
            <Leading_icon
              width={leadingsize}
              height={leadingsize}
              color={leadingcolor}
            />
          </View>
        )
      ) : null}
      {seperator !== undefined ? <View style={styles.seperator} /> : null}
      <TextInput
        style={[styles.input]}
        onFocus={onFocus}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? '#000000af'}
        onChangeText={setValue}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={canToggle ? !passwordVisible : secureTextEntry}
        maxLength={maxLength}
        returnKeyType={returnKeyType}
      />
      {canToggle ? (
        <TouchableOpacity
          style={styles.toggleBtn}
          activeOpacity={0.7}
          onPress={() => setPasswordVisible((v) => !v)}
        >
          {passwordVisible ? (
            <EyeOff width={(fontSize ?? 12) * 1.3} height={(fontSize ?? 12) * 1.3} color={color ?? '#555'} />
          ) : (
            <Eye width={(fontSize ?? 12) * 1.3} height={(fontSize ?? 12) * 1.3} color={color ?? '#555'} />
          )}
        </TouchableOpacity>
      ) : null}
      {Tailing_icon !== undefined ? (
        TailingButton !== undefined ? (
          <TailingButton
            width={null}
            TextIcon={Tailing_icon}
            texticonsize={tailingsize}
            texticoncolor={tailingcolor}
          />
        ) : (
          <View style={[styles.center, styles.leading]}>
            <Tailing_icon
              width={tailingsize}
              height={tailingsize}
              color={tailingcolor}
            />
          </View>
        )
      ) : null}
    </View>
  );
};

export default Input;
