'use client'

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  DialogTrigger,
  Button,
} from 'react-aria-components';

import { DmpIcon } from '@/components/Icons';
import {
  useResponsive,
  getSizeByName,
} from '@/hooks/responsive';

import './containers.scss';


type Direction = 'left' | 'right';


/**
 * This is the base layout component. Our custom layout components should
 * inherrit from this one. So that we have some common functionality for all
 * layout containers.
 */
interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Called when the layout state changes
   */
  onChange: Function;
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  id,
  className,
  children,
  onChange,
}) => {
  return (
    <>
      <div id={id} className={`layout-container ${className}`}>
        {children}
      </div>
    </>
  )
}


/**
 * ContentContainer is the base component that is meant to hold content
 * inside a LayoutContainer.
 */
interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  id = '',
  className = '',
}) => {
  return (
    <>
      <div id={id} className={`layout-content-container ${className}`}>
        {children}
      </div>
    </>
  )
}


/**
 * Layout with a dynamic sidebar
 */
interface LayoutWithSidebarProps extends LayoutContainerProps {
  sidebarPosition: Direction,
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  children,
  id,
  className = "",

  /**
   * This is the direction on screen where the sidebar is located,
   * and the direction where it will slide out of view.
   */
  sidebarPosition = 'right',

  /**
   * A handler that can notify components higher up the stack that the
   * container changed state in some way.
   */
  onChange,
}) => {
  return (
    <>
      <div id={id} className={`layout-container layout-sidebar direction-${sidebarPosition} ${className}`}>
        {children}
      </div>
    </>
  )
}

// TODO::FIXME
interface SidebarContainerProps extends ContentContainerProps {
  collapseWithin: SizeName;
  isOpen: Bool;
  onToggle: Function;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  id = '',
  className = '',

  /**
   * The responsive size label where, if the size is smaller or
   * equal to this size, we will collapse the bar and make it modal.
   */
  collapseWithin = 'md',

  /**
   * Holds the current state of the sidebar.
   */
  isOpen = true,

  /**
   * A handler that can notify components higher up the stack that the
   * sidebar state changed.
   */
  onToggle,
}) => {

  const thisRef = useRef(null);
  const size = useResponsive();
  const [isOpenState, setIsOpenState] = useState(true);
  const [styleProps, setStyleProps] = useState({
    '--_sidebar-width': '0px',
  });

  useEffect(() => {
    if (thisRef.current) {
      const w = thisRef.current.offsetWidth;
      setStyleProps({'--_sidebar-width': `${w}px`})
    }

    // const cw = getSizeByName(collapseWithin)[0];
    // if (size[0] < cw) setIsOpenState(false);

  }, [size, isOpen]);

  function toggleState(ev) {
    setIsOpenState(!isOpenState);
    if (onToggle) {
      onToggle({ isOpen: isOpenState });
    }
  }

  return (
    <>
      <div
        ref={thisRef}
        id={id}
        style={styleProps}
        className={`layout-sidebar-container ${className} ${isOpenState ? "state-open" : "state-closed"}`}>
        <div className="sidebar-actions">
          <Button onPress={toggleState} className="action-toggle-state">
            <DmpIcon icon="double_arrow"> </DmpIcon>
          </Button>
        </div>

        {children}
      </div>
    </>
  );
}
