'use client'

import React, {
  CSSProperties,
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  Button,
} from 'react-aria-components';

import { DmpIcon } from '@/components/Icons';
import {
  useResponsive,
  getSizeByName,
} from '@/hooks/responsive';

import './containers.scss';


type DirectionType =
  | null
  | "left"
  | "right";

// Extend the CSSProps so that we can actually add css variables to tags.
type CustomCSSProperties = CSSProperties & Record<string, string>;

/**
 * This is the base layout component. Our custom layout components should
 * inherrit from this one. So that we have some common functionality for all
 * layout containers.
 */
interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  style?: CustomCSSProperties,
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  id,
  className,
  style,
  children,
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-container ${className}`}
        style={style}
      >
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
  style?: CustomCSSProperties,
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  id = '',
  className = '',
  style,
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-content-container ${className}`}
        style={style}
      >
        {children}
      </div>
    </>
  )
}


/**
 * A toolbar that will reside inside a layout container.
 */
export const ToolbarContainer: React.FC<LayoutContainerProps> = ({
  children,
  style,
  id = '',
  className = '',
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-container layout-toolbar-container ${className}`}
        style={style}
      >
        {children}
      </div>
    </>
  )
}


/**
 * Layout with a dynamic sidebar
 */
interface LayoutWithSidebarProps extends LayoutContainerProps {
}

export const LayoutWithSidebar: React.FC<LayoutWithSidebarProps> = ({
  children,
  id,
  className = "",
}) => {
  const thisRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thisRef) {
      if (thisRef.current) {
        let direction: DirectionType = null;

        children?.forEach((rNode) => {
          if (!rNode) return;

          // Set up the state with a toolbar if present
          switch (rNode.type.name) {
            case "ToobarContainer": {
              thisRef.current?.classList.add('with-toolbar');
              break;
            }

            case "ContentContainer": {
              if (!direction) direction = "right";
            }

            case "SidebarContainer": {
              thisRef.current?.classList.add('with-sidebar');
              if (!direction) direction = "left";
              break;
            }

            case "DrawerContainer": {
              thisRef.current?.classList.add('with-drawer');
              if (!direction) direction = "left";
            }
          }
        });

        thisRef.current.classList.add(`direction-${direction}`);
      }
    }
  }, []);

  return (
    <>
      <div
        ref={thisRef}
        id={id}
        className={`layout-container layout-with-panel ${className}`}
      >
        {children}
      </div>
    </>
  )
}

interface SidebarContainerProps extends ContentContainerProps {
  isOpen?: Boolean;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  children,
  id = '',
  className = '',

  /**
   * Holds the current state of the sidebar.
   */
  isOpen = true,
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-sidebar-container ${className} ${isOpen ? "state-open" : "state-closed"}`}
      >
        {children}
      </div>
    </>
  );
}

// Drawer Layout Container
interface DrawerContainerProps extends ContentContainerProps {
  isOpen?: Boolean;
  onClose?: () => void;
}

export const DrawerContainer: React.FC<DrawerContainerProps> = ({
  children,
  id = '',
  className = '',
  isOpen = false,
  onClose,
}) => {

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const size = useResponsive();
  const [isMobile, setIsMobile] = useState<Boolean>(true);
  const [prevFocus, setPrevFocus] = useState<Element | null>(null);

  useEffect(() => {
    if (size.viewport[0] < getSizeByName('md')[0]) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [size]);

  useEffect(() => {
    const activeEl = document.activeElement as HTMLElement | null;
    if (isOpen) {
      if (drawerRef && drawerRef.current) {
        setPrevFocus(document.activeElement);

        // Developer NOTE:
        // We wait wait till the animation is finished before changing focus.
        // The animation in CSS takes 300 miliseconds to complete, so we buffer
        // that with an extra 1ms.
        window.setTimeout(() => {
          activeEl?.blur();
          drawerRef.current?.focus();
        }, 301);
      }
    } else {
      if (prevFocus) {
        window.setTimeout(() => {
          activeEl?.blur();
          (prevFocus as HTMLElement | null)?.focus();
        }, 301);
      }
    }

    if (!isOpen && onClose) onClose();
  }, [isOpen]);

  return (
    <>
      {isMobile && (
        <div
          id={id}
          ref={drawerRef}
          className={`layout-drawer-modal ${className} ${isOpen ? "state-open" : "state-closed"}`}
        >
          <ContentContainer className="drawer-content">
            {children}
          </ContentContainer>
        </div>
      )}

      {!isMobile && (
        <div
          id={id}
          className={`layout-drawer-container ${className} ${isOpen ? "state-open" : "state-closed"}`}
        >
          {children}
        </div>
      )}
    </>
  );
}
