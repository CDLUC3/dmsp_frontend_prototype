'use client';

import React from 'react';


/**
 * ContentContainer is the base component that is meant to hold content
 * inside a LayoutContainer.
 */
export interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
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
