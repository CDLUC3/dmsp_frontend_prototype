'use client';

import React from 'react';
import classNames from 'classnames';


/**
 * This is the base layout component. Our custom layout components should
 * inherrit from this one. So that we have some common functionality for all
 * layout containers.
 */
export interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
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
        className={classNames('layout-container', className)}
        data-testid="layout-container"
      >
        {children}
      </div>
    </>
  )
}
