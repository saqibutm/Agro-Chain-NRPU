import React from 'react';
import { SvgXml } from 'react-native-svg';

const QRCode = ({ height, width, color }) => {
    const defaultColor = color ? color : 'black';
    const defaultHeight = height ? height : 40;
    const defaultWidth = width ? width : 40;
    return (
        <SvgXml
            xml={`<svg width=${defaultWidth} height=${defaultHeight} viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24.08 15.648V21.972C24.08 23.1362 23.1362 24.08 21.972 24.08H15.648C14.4838 24.08 13.54 23.1362 13.54 21.972V15.648C13.54 14.4838 14.4838 13.54 15.648 13.54H21.972C23.1362 13.54 24.08 14.4838 24.08 15.648Z" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.54 34.62H24.08" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M45.16 34.62V45.16" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M34.62 55.7H45.16" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M34.62 34.659L34.6551 34.62" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M55.7 34.659L55.7351 34.62" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M34.62 45.199L34.6551 45.16" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M55.7 45.199L55.7351 45.16" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M55.7 55.739L55.7351 55.7" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M34.62 24.119L34.6551 24.08" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M34.62 13.579L34.6551 13.54" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24.08 47.268V53.592C24.08 54.7563 23.1362 55.7 21.972 55.7H15.648C14.4838 55.7 13.54 54.7563 13.54 53.592V47.268C13.54 46.1037 14.4838 45.16 15.648 45.16H21.972C23.1362 45.16 24.08 46.1037 24.08 47.268Z" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M55.7 15.648V21.972C55.7 23.1362 54.7563 24.08 53.592 24.08H47.268C46.1037 24.08 45.16 23.1362 45.16 21.972V15.648C45.16 14.4838 46.1037 13.54 47.268 13.54H53.592C54.7563 13.54 55.7 14.4838 55.7 15.648Z" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M55.7 3H66.24V13.54" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M55.7 66.24H66.24V55.7" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.54 3H3V13.54" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.54 66.24H3V55.7" stroke=${defaultColor} stroke-width="5.27" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
               
`}
        />
    );
};

export default QRCode;
