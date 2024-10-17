import React, { useState, useEffect } from 'react';

// NOTE: Responsive means more than just device size; So this file can be used
// to include other hooks related to responsive design, like checking for
// accelerometer, camera, GPS etc.

type SizeName =
  'xs' |
  'sm' |
  'md' |
  'lg' |
  'xl' |
  'xxl';

const responsiveSizes = [
  [0, 'xs'],
  [640, 'sm'],
  [768, 'md'],
  [1024, 'lg'],
  [1200, 'xl'],
  [1440, 'xxl'],
];

export const getSizeByName = (name: string) => {
  return responsiveSizes.find(rs => rs[1] == name);
}

export const getSizeByWidth = (w: number) => {
  return responsiveSizes.find(rs => rs[0] == w);
}

export const useResponsive = () => {
  const [deviceSize, setDeviceSize] = useState(responsiveSizes[0]);

  useEffect(() => {
    function handleResize() {
      responsiveSizes.forEach((rs) => {
        if (rs[0] < window.innerWidth) setDeviceSize(rs);
      });
    }

    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceSize;
}
