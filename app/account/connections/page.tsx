'use client'

import React from "react";
import ContentContainer from "@/components/ContentContainer";
import ButtonWithImage from "@/components/ButtonWithImage";
import styles from "./connections.module.scss";

const ConnectionsPage: React.FC = () => {

  return (
    <>
      <h1>Connections Page</h1>
      <ContentContainer>
        <div className={styles.connectionSection}>
          <h4>ORCID iD</h4>
          <p>ORCID provides a persistent identifier - an ORCID iD - that distinguishes you from other users. Learn more at <a href="https://orcid.org/" target="_blank" rel="noopener" >ORCID.org</a>.</p>
          <ButtonWithImage imageUrl="/images/orcid.svg" buttonText="Connect your ORCID iD" />
        </div>
        <div className={styles.connectionSection}>
          <h4>Single Sign On</h4>
          <p>Connect your account so that you can log into DMP Tool via your institution.</p>
          <ButtonWithImage imageUrl="/images/orcid.svg" buttonText="Connect institutional credentials" />
        </div>

        <div className="identifier-scheme">
          <a id="orcid-id" target="_blank" rel="noopener noreferrer" title="" aria-label="ORCID provides a persistent digital identifier that distinguishes you from other researchers. Learn more at orcid.org" data-toggle="tooltip" href="https://orcid.org/0009-0000-9768-4477" data-original-title="ORCID provides a persistent digital identifier that distinguishes you from other researchers. Learn more at orcid.org">
            <img id="orcid-id-logo" alt="ORCID" src="http://orcid.org/sites/default/files/images/orcid_16x16.png" />
            &nbsp;
            https://orcid.org/0009-0000-9768-4477
          </a>
          <a title="" data-confirm="Are you sure you want to disconnect your ORCID ID?" aria-label="Disconnect your account from ORCID. You can reconnect at any time." data-toggle="tooltip" rel="nofollow" data-method="delete" href="/users/identifiers/75029" data-original-title="Disconnect your account from ORCID. You can reconnect at any time."><i className="fas fa-fw fa-times-circle" aria-hidden="true"></i></a>
        </div>
      </ContentContainer>
    </>
  )
}

export default ConnectionsPage;