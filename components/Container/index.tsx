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
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  id,
  className,
  children,
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-container ${className}`}
        data-testid="layout-container"
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
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  id = '',
  className = '',
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-content-container ${className}`}
        data-testid="content-container"
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
  id = '',
  className = '',
}) => {
  return (
    <>
      <div
        id={id}
        className={`layout-container layout-toolbar-container ${className}`}
        data-testid="toolbar-container"
      >
        {children}
      </div>
    </>
  )
}


/**
 * Layout with a dynamic sidebar
 */
interface LayoutWithPanelProps extends LayoutContainerProps {
}

export const LayoutWithPanel: React.FC<LayoutWithPanelProps> = ({
  children,
  id,
  className = "",
}) => {
  const thisRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thisRef) {
      if (thisRef.current) {
        let direction: DirectionType = null;

        function _updateClassList(name: string) {
          switch (name) {
            case "ToolbarContainer": {
              thisRef.current?.classList.add('with-toolbar');
              break;
            }

            case "ContentContainer": {
              if (!direction) direction = "right";
            }

            case "SidebarPanel": {
              thisRef.current?.classList.add('with-sidebar');
              if (!direction) direction = "left";
              break;
            }

            case "DrawerPanel": {
              thisRef.current?.classList.add('with-drawer');
              if (!direction) direction = "left";
            }
          }
        }

        if (Array.isArray(children)) {
          children?.forEach((rNode) => {
            if (!rNode) return;
            if (!React.isValidElement(rNode)) return;
            _updateClassList(rNode.type.name);
          });
        } else if (React.isValidElement(children)) {
          const rNode = children as React.FunctionComponent;
          _updateClassList(rNode.type.name);
        }

        if (direction) thisRef.current.classList.add(`direction-${direction}`);
      }
    }
  }, []);

  return (
    <>
      <div
        ref={thisRef}
        id={id}
        className={`layout-container layout-with-panel ${className}`}
        data-testid="layout-with-panel"
      >
        {children}
      </div>
    </>
  )
}

interface SidebarPanelProps extends ContentContainerProps {
  isOpen?: Boolean;
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
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
        className={`layout-sidebar-panel ${className} ${isOpen ? "state-open" : "state-closed"}`}
        data-testid="sidebar-panel"
      >
        {children}
      </div>
    </>
  );
}

// Drawer Layout Container
interface DrawerPanelProps extends ContentContainerProps {
  isOpen?: Boolean;
  onClose?: () => void;
}

export const DrawerPanel: React.FC<DrawerPanelProps> = ({
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

  useEffect(() => {
    const keyDownHandler = (ev) => {
      if (ev.key == 'Escape' && isOpen) {
        if (isOpen && onClose) onClose();
      }
    }

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    }
  }, [isOpen]);

  return (
    <>
      {isMobile && (
        <div
          id={id}
          ref={drawerRef}
          className={`layout-drawer-modal ${className} ${isOpen ? "state-open" : "state-closed"}`}
          data-testid="drawer-panel"
        >
          <ContentContainer className="drawer-content">
            {children}
          </ContentContainer>
        </div>
      )}

      {!isMobile && (
        <div
          id={id}
          className={`layout-drawer-panel ${className} ${isOpen ? "state-open" : "state-closed"}`}
          data-testid="drawer-panel"
        >
          {children}
        </div>
      )}
    </>
  );
}
