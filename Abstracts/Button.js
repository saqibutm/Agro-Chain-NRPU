import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'

const Button = ({ style, onPress, text, paddingLeft, btncardname, color,
    width, height, elevation, opacity, backgroundColor, justifyContent,
    borderColor, borderWidth, borderRadius, paddingHorizontal, right, fontFamily,
    LeadingColor, LeadingSize, LeadingIcon, letterSpacing, btnContainerStyle,
    TextIcon, TextIconSize, TextIconColor, paddingVertical, TextIconStyle,
    TailingIcon, TailingSize, TailingColor, fontSize, fontWeight, TailingStyle
}) => {
    // Plain object, not StyleSheet.create() — every value here is prop-driven
    // and rebuilt on each render anyway, so StyleSheet.create()'s one-time ID
    // caching (its whole benefit) never applies; it was pure overhead.
    const styles = {
        row: {
            flexDirection: "row",
        },
        center: {
            alignSelf: "center",
        },
        left: {
            alignSelf: "flex-end"
        },
        btn: {
            width: width ? width : "80%",
            height: height ?? null,
            elevation: elevation ?? 0,
            opacity: opacity ?? 1,
            paddingVertical:
                paddingVertical !== undefined
                    ? paddingVertical
                    : text
                        ? width
                            ? 10
                            : 5
                        : 2,
            paddingHorizontal:
                paddingHorizontal !== undefined ? paddingHorizontal : text ? 12 : 2,
            justifyContent: justifyContent ?? 'space-evenly',
            borderRadius: borderRadius !== undefined ? borderRadius : 10,
            borderWidth: borderWidth !== undefined ? borderWidth : 0,
            borderColor: borderColor !== undefined ? borderColor : 'none',
        },
        backgroundColor: {
            backgroundColor: backgroundColor !== undefined ? backgroundColor : 'none',
        },
        leading: {
            position: "absolute",
            left: 28
        },
        tailing: {
            position: 'absolute',
            right: right !== undefined ? right : 13,
        },
        texticon: {
            paddingRight: text ? 13 : 0,
            position: "absolute",
            right: "60%",
        },
        text: {
            color: color ? color : null,
            fontSize: fontSize ? fontSize : 20,
            paddingLeft: paddingLeft ? paddingLeft : 0,
            fontWeight: fontWeight ? fontWeight : null,
            letterSpacing: letterSpacing ? letterSpacing : 0,
            fontFamily: fontFamily ? fontFamily : null
        }
    }

    return (
        <>
            <TouchableOpacity style={[styles.center, style]} onPress={onPress} activeOpacity={0.8}>
                <View style={[styles.btn, styles.row, styles.backgroundColor, btnContainerStyle]}>
                    {LeadingIcon !== undefined
                        ? (
                            <View style={[styles.center, styles.leading]}>
                                <LeadingIcon
                                    width={LeadingSize}
                                    height={LeadingSize}
                                    color={LeadingColor}
                                />
                            </View>
                        )
                        : null}
                    {TextIcon !== undefined
                        ? (
                            <View style={[styles.center, styles.texticon, TextIconStyle]}>
                                <TextIcon
                                    width={TextIconSize}
                                    height={TextIconSize}
                                    color={TextIconColor} />
                            </View>
                        )
                        : null}
                    {text ? (
                        <Text style={[styles.center, styles.text]}>{text}</Text>
                    )
                        : null
                    }
                    {TailingIcon !== undefined
                        ? (
                            <View style={[styles.center, styles.tailing, TailingStyle]}>
                                <TailingIcon
                                    width={TailingSize}
                                    height={TailingSize}
                                    color={TailingColor} />
                            </View>
                        )
                        : null
                    }
                </View>
                {btncardname
                    ? (
                        <Text style={[styles.center, styles.text]}>{btncardname}</Text>
                    )
                    : undefined
                }
            </TouchableOpacity>
        </>
    )
}

export default Button
