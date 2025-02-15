import { useState, useEffect } from 'react';

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

type BreakPoint = [number, SizeName];

const breakpoints: BreakPoint[] = [
  [0, 'xs'],
  [640, 'sm'],
  [768, 'md'],
  [1024, 'lg'],
  [1200, 'xl'],
  [1440, 'xxl'],
];

export interface DeviceProps {
  viewport: [number, number];
  deviceSize: SizeName | null;
}

export const getSizeByName = (name: SizeName): BreakPoint => {
  return breakpoints.find(rs => rs[1] == name) || breakpoints[0];
}

export const getSizeByWidth = (w: number): BreakPoint => {
  return breakpoints.find(rs => rs[0] == w) || breakpoints[0];
}

export const getDeviceSize = (w: number): SizeName => {
  let size: SizeName = "xs";

  breakpoints.forEach((br) => {
    if (br[0] < w) size = br[1];
  });

  return size;
}

export const useResponsive = (): DeviceProps => {
  const [deviceSize, setDeviceSize] = useState<SizeName | null>(null);
  const [viewport, setViewport] = useState<[number, number]>([0, 0]);

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
    viewport,
    deviceSize,
  };
}
