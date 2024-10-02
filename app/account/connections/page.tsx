'use client'

import React from "react";
import ContentContainer from "@/components/ContentContainer";
import ButtonWithImage from "@/components/ButtonWithImage";
import styles from "./connections.module.scss";

const ConnectionsPage: React.FC = () => {

  return (
    <>
      <h1>Connections</h1>
      <ContentContainer>
        <div className={styles.connectionSection}>
          <h4>ORCID iD</h4>
          <p>ORCID provides a persistent identifier - an ORCID iD - that distinguishes you from other users. Learn more at <a href="https://orcid.org/" target="_blank" rel="noopener noreferrer" >ORCID.org</a>.</p>
          <ButtonWithImage imageUrl="/images/orcid.svg" buttonText="Connect your ORCID iD" />
        </div>
        <div className={styles.connectionSection}>
          <h4>Single Sign On</h4>
          <p>Connect your account so that you can log into DMP Tool via your institution.</p>
          <ButtonWithImage imageUrl="/images/orcid.svg" buttonText="Connect institutional credentials" />
        </div>
      </ContentContainer>
    </>
  )
}

export default ConnectionsPage;