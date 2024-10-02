import React from "react";
import { usePathname } from "next/navigation";
import styles from './leftsidebar.module.scss';

const LeftSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className={styles.leftSidebar}>
      <h3 className={styles.title}>Account</h3>
      <ul className={styles.menuList}>
        <li className={pathname === '/account/profile' ? styles.emphasis : ''}>Your Profile</li>
        <li className={pathname === '/account/password' ? styles.emphasis : ''}>Password</li>
        <li className={pathname === '/account/connections' ? styles.emphasis : ''}>Connections</li>
        <li className={pathname === '/account/notifications' ? styles.emphasis : ''}>Notifications</li>
        <li className={pathname === '/account/developerTools' ? styles.emphasis : ''}>Developer Tools</li>
      </ul>
    </div>
  )
}

export default LeftSidebar;