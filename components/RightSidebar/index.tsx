import React, { ReactNode } from 'react';
import styles from './rightSidebar.module.scss';

interface RightSidebarProps {
  children: ReactNode;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ children }) => {
  return (
    <div className={styles.rightsidebar}>
      {children}
    </div>
  )
}

export default RightSidebar;