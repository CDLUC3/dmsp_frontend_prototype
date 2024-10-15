'use client'

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  DialogTrigger,
  Button,
} from 'react-aria-components';

import './containers.scss';


type Direction = 'left' | 'right';
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

const getSizeByName = (name: string) => {
  return responsiveSizes.find(rs => rs[1] == name);
}

const getSizeByWidth = (w: number) => {
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

interface SidebarContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  direction: Direction;
  collapseSize: SizeName;
  isOpen: Bool;
  onStateChange: Function;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  id = '',
  className = '',
  direction = 'left',
  collapseSize = 'md',
  isOpen = true,
  onStateChange,
}) => {

  const size = useResponsive();
  const [stateClass, setStateClass] = useState("state-closed");

  useEffect(() => {
    const cw = getSizeByName(collapseSize)[0];
    if (size[0] < cw) {
      if (isOpen) setStateClass("state-open")
      else setStateClass("state-closed")
    } else {
      setStateClass("")
    }
  }, [size, isOpen]);

  function handleClose(ev) {
    if (onStateChange) {
      setStateClass("state-closed");
      onStateChange("closed");
    }
  }

  return (
    <>
      <div id={id} className={`sidebar-content direction-${direction} ${className} ${stateClass}`}>
        {isOpen ? (
          <div className="sidebard-toolbar">
            <Button onPress={handleClose}>Close</Button>
          </div>
        ) : ""}
        {children}
      </div>
    </>
  );
}
