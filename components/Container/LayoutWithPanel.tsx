'use client';

import React, {
  CSSProperties,
  useState,
  useEffect,
  useRef,
} from 'react';

import { Button } from 'react-aria-components';

import { DmpIcon } from '@/components/Icons';
import {
  useResponsive,
  getSizeByName,
} from '@/hooks/responsive';

import { LayoutContainerProps } from '@/components/Container/LayoutContainer';
import { ContentContainer } from '@/components/Container/ContentContainer';


type DirectionType =
  | null
  | "left"
  | "right";


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
              break;
            }

            case "SidebarPanel": {
              thisRef.current?.classList.add('with-sidebar');
              if (!direction) direction = "left";
              break;
            }

            case "DrawerPanel": {
              thisRef.current?.classList.add('with-drawer');
              if (!direction) direction = "left";
              break;
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
  isOpen?: boolean;
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
  isOpen?: boolean;
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
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [stateOpen, setStateOpen] = useState<boolean>(isOpen);

  useEffect(() => {
    setIsMobile(size.viewport[0] < getSizeByName('md')[0]);
  }, [size]);

  useEffect(() => {
    setStateOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (stateOpen) {
      if (drawerRef && drawerRef.current) {
        // Developer NOTE:
        // We wait wait till the animation is finished before changing focus.
        // The animation in CSS takes 300 miliseconds to complete, so we buffer
        // that with an extra 1ms.
        window.setTimeout(() => {
          drawerRef.current?.focus();
        }, 301);
      }
    } else {
      // Developer NOTE:
      // We wait wait till the animation is finished before changing focus.
      // The animation in CSS takes 300 miliseconds to complete, so we buffer
      // that with an extra 1ms.
      if (onClose) onClose();
    }
  }, [stateOpen]);

  useEffect(() => {
    const keyDownHandler = (ev) => {
      if (ev.key == 'Escape' && stateOpen) {
        if (stateOpen && onClose) onClose();
      }
    }

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    }
  }, [stateOpen]);

  function handleClose() {
    if (stateOpen) setStateOpen(false);
  }

  return (
    <>
      {isMobile && (
        <div
          id={id}
          ref={drawerRef}
          className={`layout-drawer-modal ${className} ${stateOpen ? "state-open" : "state-closed"}`}
          tabIndex={stateOpen ? 0 : -1}
          aria-hidden={!stateOpen}
          data-testid="drawer-panel"
        >
          <ContentContainer className="drawer-content">
            <Button
              className="close-action"
              onPress={handleClose}
              data-testid="close-action"
            >
              <DmpIcon icon="cancel" />
            </Button>

            {children}
          </ContentContainer>
        </div>
      )}

      {!isMobile && (
        <div
          id={id}
          ref={drawerRef}
          className={`layout-drawer-panel ${className} ${stateOpen ? "state-open" : "state-closed"}`}
          tabIndex={stateOpen ? 0 : -1}
          aria-hidden={!stateOpen}
          data-testid="drawer-panel"
        >
          <Button
            className="close-action"
            onPress={handleClose}
            data-testid="close-action"
          >
            <DmpIcon icon="cancel" />
          </Button>

          {children}
        </div>
      )}
    </>
  );
}
