import React from "react";
import styles from './leftsidebar.module.scss';

const LeftSidebar: React.FC = () => {

  return (
    <div className={styles.leftSidebar}>
      <h3 className={styles.title}>Account</h3>
      <ul className={styles.menuList}>
        <li>Your Profile</li>
        <li>Password</li>
        <li className="selected">Connections</li>
        <li>Notifications</li>
        <li>Developer Tools</li>
      </ul>
    </div>
  )
}

export default LeftSidebar;