import React from 'react';
import { SvgXml } from 'react-native-svg';

const Accounts = ({ height, width, color }) => {
    const defaultColor = color ? color : 'black';
    const defaultHeight = height ? height : 38;
    const defaultWidth = width ? width : 38;
    return (
        <SvgXml
            xml={`<svg width=${defaultWidth} height=${defaultHeight} viewBox="0 0 25 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="5.93054" y1="1" x2="24.7815" y2="1" stroke=${defaultColor} stroke-width="3"/>
            <line x1="0.781494" y1="1" x2="4.22877" y2="1" stroke=${defaultColor} stroke-width="3"/>
            <line x1="0.781494" y1="9" x2="4.22877" y2="9" stroke=${defaultColor} stroke-width="3"/>
            <line x1="0.781494" y1="17" x2="4.22877" y2="17" stroke=${defaultColor} stroke-width="3"/>
            <line x1="5.93054" y1="9" x2="24.7815" y2="9" stroke=${defaultColor} stroke-width="3"/>
            <line x1="5.93054" y1="17" x2="24.7815" y2="17" stroke=${defaultColor} stroke-width="3"/>
            </svg>                      
`}
        />
    );
};

export default Accounts;
