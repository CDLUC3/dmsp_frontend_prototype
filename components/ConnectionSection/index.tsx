'use client';

import React, {useState} from 'react';
import ButtonWithImage from '../ButtonWithImage';
import TooltipWithDialog from '../TooltipWithDialog';
import {ModalOverlayComponent} from '../ModalOverlayComponent';
import {DmpIcon} from '@/components/Icons';
import styles from './connectionSection.module.scss';
import connectionData from './connection-types.json';

import {PressEvent} from 'react-aria-components';

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
      close();
    } catch (error) {
      console.error('An error occurred while deleting the item:', error);
    }
  };

  const tooltipText = (connectionData as ConnectionDataType)[type]?.tooltipText || '';
  const tooltipContent = (connectionData as ConnectionDataType)[type]?.content || '';

  return (
    <>
      {(type === 'orcidconnected') ? (
        <div className={styles.connectionSection}>
          <h2 className={"h3"}>{title}</h2>
          {content && (
            <p dangerouslySetInnerHTML={{ __html: content }} />
          )}
          <TooltipWithDialog
            text="0000-0001-2345-6789"
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
          <h2 className={"h3"}>{title}</h2>
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
