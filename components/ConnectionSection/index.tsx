'use client';

import React, { useEffect, useState } from "react";
import ButtonWithImage from "../ButtonWithImage";
import TooltipWithDialog from "../TooltipWithDialog";
import { ModalOverlayComponent } from "../ModalOverlayComponent";
import { DmpIcon } from "@/components/Icons";
import styles from "./connectionSection.module.scss";

interface ConnectionSectionProps {
  title: string;
  content?: string;
  btnUrl: string;
  btnImageUrl?: string;
  btnText: string;
}

interface AuthData {
  id: string;
  token: string;
}

const ConnectionSection = ({
  title,
  content,
  btnUrl,
  btnImageUrl,
  btnText,
}: ConnectionSectionProps) => {

  const [authData, setAuthData] = useState<AuthData | null>(null);

  const handleDelete = async () => {
    try {
      alert('Deleted');
    } catch (error) {
      console.error("An error occurred while deleting the item:", error);
    }
  };

  useEffect(() => {
    const getAuthData = (): AuthData | null => {
      const data = localStorage.getItem('connectionData');
      return data ? JSON.parse(data) : null;
    };

    const data = getAuthData();
    setAuthData(data);
  }, [btnUrl]);

  return (
    <>
      {(authData && title === 'Test orcid') ? (
        <div className={styles.connectionSection}>
          <h4>{title}</h4>
          <TooltipWithDialog
            text={authData.id}
            tooltipText="Disconnect your account from ORCID. You can reconnect at any time."
            icon={<DmpIcon icon="cancel" />}
            imageUrl={btnImageUrl}
          >
            <ModalOverlayComponent
              heading='Confirm deletion'
              content='Are you sure you want to disconnect your ORCID ID?'
              onPressAction={handleDelete}
            />
          </TooltipWithDialog>
        </div>
      ) : (
        <div className={styles.connectionSection}>
          <h4>{title}</h4>
          {content && (
            <p dangerouslySetInnerHTML={{ __html: content }} />
          )}
          <ButtonWithImage url={btnUrl} imageUrl={btnImageUrl ? btnImageUrl : undefined} buttonText={btnText} />
        </div>
      )}

    </>

  )
}

export default ConnectionSection;