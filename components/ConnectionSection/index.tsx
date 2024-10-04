'use client';

import React, { useEffect, useState } from "react";
import ButtonWithImage from "../ButtonWithImage";
import TooltipWithDialog from "../TooltipWithDialog";
import { ModalOverlayComponent } from "../ModalOverlayComponent";
import { DmpIcon } from "@/components/Icons";
import styles from "./connectionSection.module.scss";
import connectionData from './connection-types.json';

import {
  PressEvent
} from "react-aria-components";

interface ConnectionSectionProps {
  type: string;
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

type CloseFunction = () => void;
type HandleDeleteFunction = (e: PressEvent, close: CloseFunction) => void;
type ConnectionDataType = {
  [key: string]: { tooltipText: string, content: string }
}

/* This builds each third-party section on the connections page. If we have auth data saved for the
current third party, then we show a different view with a 'cancel' icon. Otherwise, we just show
a button asking if they want to connect.*/
const ConnectionSection = ({
  type,
  title,
  content,
  btnUrl,
  btnImageUrl,
  btnText,
}: ConnectionSectionProps) => {

  const [authData, setAuthData] = useState<AuthData | null>(null);

  const handleDelete: HandleDeleteFunction = async (e, close) => {
    try {
      /*TODO: Eventually we will need to call an API to delete the relevant token from the database.
      For now, just to see it in action, we're using localStorage*/
      localStorage.removeItem(`connectionData${type}`);
      setAuthData(null);
      close();
    } catch (error) {
      console.error("An error occurred while deleting the item:", error);
    }
  };

  useEffect(() => {
    const getAuthData = (): AuthData | null => {
      const storageKey = `connectionData${type}`;
      console.log(storageKey);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    };

    const data = getAuthData();
    setAuthData(data);
  }, [btnUrl]);


  useEffect(() => {
    // refresh page after authData changes, so we can see the toggled view
  }, [authData]);

  const tooltipText = (connectionData as ConnectionDataType)[type]?.tooltipText || '';
  const tooltipContent = (connectionData as ConnectionDataType)[type]?.content || '';

  return (
    <>
      {(authData) ? (
        <div className={styles.connectionSection}>
          <h4>{title}</h4>
          <TooltipWithDialog
            text={authData.id}
            tooltipText={tooltipText}
            icon={<DmpIcon icon="cancel" />}
            imageUrl={btnImageUrl}
            onPressAction={handleDelete}
          >
            <ModalOverlayComponent
              heading='Confirm deletion'
              content={tooltipContent}
              onPressAction={handleDelete}
            />
          </TooltipWithDialog>
        </div >
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