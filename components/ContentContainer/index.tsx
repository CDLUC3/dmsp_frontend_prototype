'use client'

import React, {ReactNode} from 'react';
import styles from './contentContainer.module.scss';

interface ContentContainerProps {
  children: ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {

  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}

export default ContentContainer;
