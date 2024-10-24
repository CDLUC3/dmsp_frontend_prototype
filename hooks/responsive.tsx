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

const breakpoints = [
  [0, 'xs'],
  [640, 'sm'],
  [768, 'md'],
  [1024, 'lg'],
  [1200, 'xl'],
  [1440, 'xxl'],
];

export interface DeviceProps {
  viewport: [number, number];
  deviceSize: string;
}

export const getSizeByName = (name: string) => {
  return breakpoints.find(rs => rs[1] == name);
}

export const getSizeByWidth = (w: number) => {
  return breakpoints.find(rs => rs[0] == w);
}

export const getDeviceSize = (w: number): string => {
  let size: string;
  breakpoints.forEach((br) => {
    if (br[0] < w) size = br[1];
  });
  return size;
}

export const useResponsive = (): DeviceProps => {
  const [deviceSize, setDeviceSize] = useState(null);
  const [viewport, setViewport] = useState([0, 0]);

  useEffect(() => {
    function updateDevice() {
      setDeviceSize(getDeviceSize(window.innerWidth));
      setViewport([window.innerWidth, window.innerHeight]);
    }

    updateDevice();
    window.addEventListener('resize', updateDevice);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateDevice);
    }
  }, []);

  return {
    viewport: viewport,
    breakpoint: deviceSize,
  };
}
