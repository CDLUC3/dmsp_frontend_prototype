'use client';

import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import { useTranslations } from "next-intl";

import { Button } from 'react-aria-components';

import {
  useResponsive,
  getSizeByName,
} from '@/hooks/responsive';

import { LayoutContainerProps } from '@/components/Container/LayoutContainer';
import {
  ContentContainerProps,
  ContentContainer,
} from '@/components/Container/ContentContainer';
import { DmpIcon } from "@/components/Icons";

type DirectionType =
  | null
  | "left"
  | "right";


/**
 * Layout with a dynamic sidebar
 */
export type LayoutWithPanelProps = LayoutContainerProps;

export const LayoutWithPanel: React.FC<LayoutWithPanelProps> = ({
  children,
  id,
  className = "",
  onClick
}) => {
  const thisRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thisRef) {
      if (thisRef.current) {
        let direction: DirectionType = null;

        const _updateClassList = (name: string) => {
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

            if (typeof rNode.type === 'function') {
              _updateClassList(rNode.type.name);
            } else if (typeof rNode.type === 'string') {
              _updateClassList(rNode.type);
            }
          });
        } else if (React.isValidElement(children)) {
          const rNode = children;
          if (typeof rNode.type === 'function') {
            _updateClassList(rNode.type.name);
          } else if (typeof rNode.type === 'string') {
            _updateClassList(rNode.type);
          }
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
        onClick={onClick}
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
  title?: string;
  returnFocusRef?: React.RefObject<HTMLElement>;
}

export const DrawerPanel: React.FC<DrawerPanelProps> = ({
  children,
  id = '',
  className = '',
  title = '',
  isOpen = false,
  onClose,
  returnFocusRef
}) => {

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const size = useResponsive();
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [stateOpen, setStateOpen] = useState<boolean>(isOpen);

  const Global = useTranslations('Global');

  useEffect(() => {
    setIsMobile(size.viewport[0] < getSizeByName('md')[0]);
  }, [size]);

  useEffect(() => {
    setStateOpen(isOpen);
  }, [isOpen]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (stateOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;

      // Lock background scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore background scroll when drawer closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [stateOpen]);

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
      if (onClose) {
        onClose();
      }
    }
  }, [stateOpen]);

  useEffect(() => {
    const keyDownHandler = (ev: KeyboardEvent) => {
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
    // Remove focus from the close button before hiding the drawer
    drawerRef.current?.blur();
    closeButtonRef.current?.blur();

    if (stateOpen) setStateOpen(false);

    // Remove 'data-focus-visible' from all buttons first
    document.querySelectorAll('button[data-focus-visible]').forEach((btn) => {
      btn.removeAttribute('data-focus-visible');
    });

    // Return focus to the opener button
    const drawerTriggerBtn = returnFocusRef?.current;
    if (drawerTriggerBtn) {
      drawerTriggerBtn.focus();
      drawerTriggerBtn.setAttribute('data-focus-visible', '');
    }

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
            <div className="close-action-container">
              <Button
                ref={closeButtonRef}
                className="close-action"
                aria-label={Global('buttons.close')}
                onPress={handleClose}
                data-testid="close-action"
              >
                <DmpIcon icon="right-panel_close" />
                {' '}{Global('buttons.close')}
              </Button>
            </div>
            <h2>{title}</h2>
            {/* Add a scrollable wrapper for the desktop version, so that user can scroll the drawer panel */}
            <div className="drawer-scrollable-content">
              {children}
            </div>
          </ContentContainer >
        </div >
      )}

      {
        !isMobile && (
          <div
            id={id}
            ref={drawerRef}
            className={`layout-drawer-panel ${className} ${stateOpen ? "state-open" : "state-closed"}`}
            tabIndex={stateOpen ? 0 : -1}
            aria-hidden={!stateOpen}
            data-testid="drawer-panel"
          >
            <div className="close-action-container">
              <Button
                ref={closeButtonRef}
                className="close-action"
                aria-label={Global('buttons.close')}
                onPress={handleClose}
                data-testid="close-action"
              >
                <DmpIcon icon="right-panel_close" />
                {' '}{Global('buttons.close')}
              </Button>
            </div>
            <h2>{title}</h2>
            {/* Add a scrollable wrapper for the desktop version so that user can scroll the drawer panel*/}
            <div className="drawer-scrollable-content">
              {children}
            </div>
          </div>
        )
      }
    </>
  );
}
