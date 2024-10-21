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
      <div id={id} className={`layout-container layout-with-sidebar direction-${sidebarPosition} ${className}`}>
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
  const [isFloating, setIsFloating] = useState(false);
  const [styleProps, setStyleProps] = useState({});
  const [prevActive, setPrevActive] = useState(null);

  useEffect(() => {
    const cw = getSizeByName(collapseWithin)[0];

    if (size.viewport[0] < cw) {
      setIsFloating(true);
    } else {
      setIsFloating(false);
    }

    if (thisRef.current) {
      let newStyles = {};

      if (size.viewport[0] < cw) {
        newStyles = {
          '--_sidebar-width': '80vw',
          '--_doc-width': `${size.viewport[0]}px`,
        };
      } else {
        const w = thisRef.current.offsetWidth;
        newStyles = {
          '--_sidebar-width': `${w}px`,
          '--_doc-width': `${size.viewport[0]}px`,
        };
      }

      // Developer NOTE:
      //
      // We use `--_doc-width` css variable so that we can pass the actual
      // width in pixels to the CSS. This is needed because in CSS we cannot
      // percentage or `vw`, because this doesn't work with transitions.
      //
      // The DOWNSIDE of this is, every time we set the variable, it
      // will trigger style effects in react, cause a size udpate, and then
      // this effect runs again.
      // This is why we check for state before changing. Don't remove the check
      if (JSON.stringify(newStyles) !== JSON.stringify(styleProps)) {
        setStyleProps(newStyles);
      }
    }
  }, [size]);

  useEffect(() => {
    //
    // TODO:FIXME: Restoring the previous focus does not work because the
    // act of pressing the show/hide button changes the focus to that button.
    // After that we change the state, then this effect runs, setting
    // prevActive to the toggle button.
    //
    if (isOpenState) {
      setPrevActive(document.activeElement);
      if (thisRef.current) thisRef.current.focus();
    } else {
      prevActive.focus();
    }
  }, [isOpenState]);

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
        className={`layout-sidebar-container ${className} ${isOpenState ? "state-open" : "state-closed"} ${isFloating ? "floating" : ""}`}
        tabIndex="0"
      >
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
