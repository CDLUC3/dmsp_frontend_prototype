'use client';

import React from 'react';


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
