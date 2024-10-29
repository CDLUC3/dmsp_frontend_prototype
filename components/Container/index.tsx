'use client'

import React, {
  CSSProperties,
  useState,
  useEffect,
  useRef,
} from 'react';

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
        className={`layout-toolbar-container ${className}`}
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
  sidebarPosition: "left" | "right",
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
}) => {
  const thisRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (thisRef) {
      if (thisRef.current) {
        const toolbar = thisRef.current.querySelector('.layout-toolbar-container');
        if (toolbar) {
          thisRef.current.classList.add('with-toolbar');
        } else {
          thisRef.current.classList.remove('with-toolbar');
        }
      }
    }
  }, []);

  return (
    <>
      <div
        ref={thisRef}
        id={id}
        className={`layout-container layout-with-sidebar direction-${sidebarPosition} ${className}`}
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
