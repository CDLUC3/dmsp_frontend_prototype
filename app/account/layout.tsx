'use client'
import React, { ReactNode } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import styles from './accountLayout.module.scss'

interface AccountLayoutInterface {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutInterface) {
  return (
    <div id={styles.accountLayoutWrapper}>
      <div><LeftSidebar /></div>
      <div>{children}</div>
    </div>
  );
}