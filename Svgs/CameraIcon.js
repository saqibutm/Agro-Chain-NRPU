import React from 'react';
import { SvgXml } from 'react-native-svg';

const CameraIcon = ({ height, width, color }) => {
    const defaultColor = color ? color : 'black';
    const defaultHeight = height ? height : 38;
    const defaultWidth = width ? width : 38;
    return (
        <SvgXml
            xml={`<svg width=${defaultWidth} height=${defaultHeight} viewBox="0 0 69 62" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 53.092V21.472C3 17.9793 5.83135 15.148 9.324 15.148H10.905C12.8955 15.148 14.7699 14.2108 15.9642 12.6184L22.9838 3.25888C23.3421 2.78117 23.9045 2.5 24.5016 2.5H44.7384C45.3357 2.5 45.8979 2.78117 46.2562 3.25888L53.2758 12.6184C54.4701 14.2108 56.3445 15.148 58.335 15.148H59.916C63.4087 15.148 66.24 17.9793 66.24 21.472V53.092C66.24 56.5847 63.4087 59.416 59.916 59.416H9.324C5.83135 59.416 3 56.5847 3 53.092Z" stroke=${defaultColor} stroke-width="4.743" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M34.62 46.768C41.6052 46.768 47.268 41.1052 47.268 34.12C47.268 27.1348 41.6052 21.472 34.62 21.472C27.6347 21.472 21.972 27.1348 21.972 34.12C21.972 41.1052 27.6347 46.768 34.62 46.768Z" stroke=${defaultColor} stroke-width="4.743" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
                             
`}
        />
    );
};

export default CameraIcon;
