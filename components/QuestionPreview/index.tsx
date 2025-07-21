import React, { useEffect, useState, useRef } from 'react';

import { useTranslations } from 'next-intl';

import {
  Button,
  DialogTrigger,
} from "react-aria-components";

import { ContentContainer } from '@/components/Container';

import styles from './QuestionPreview.module.scss';


interface QuestionPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  buttonLabel?: string,
  previewDisabled?: boolean,
}


const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  children,
  id = '',
  className = '',
  buttonLabel = 'Preview',
  previewDisabled = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const [isOpen, setOpen] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const t = useTranslations('QuestionPreview');

  useEffect(() => {
    const handlePopState = () => {
      if (!isOpen && window.location.hash === `#${id}_modal`) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    if (window.location.hash === `#${id}_modal`) {
      setOpen(true);
    }

    // NOTE:
    // Tell the rest of the component that we are ready,
    // This is to prevent calling window.history.back() if the url with
    // the modal id is pasted directly into the browser location.
    setReady(true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (window.location.hash !== `#${id}_modal`) {
        window.history.pushState(null, "", `#${id}_modal`);
      }
    } else {
      if (ready) {
        if (window.location.hash === `#${id}_modal`) {
          window.history.back();
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);


  return (
    <ContentContainer
      id={id}
      className={`${styles.QuestionPreview} ${className}`}
    >
      <DialogTrigger>
        <Button
          onPress={() => setOpen(true)}
          data-testid="preview-button"
          isDisabled={previewDisabled}
        >
          {buttonLabel ? buttonLabel : t("previewButton")}
        </Button>

        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            className={`${styles.ModalOverlay} modal-overlay`}
            data-testid="modal-overlay"
          >
            <div className={styles.Modal} data-testid="modal-bottomsheet">
              <div
                className={styles.ModalDialog}
                data-testid="modal-dialog"
                role="document"
              >
                <div
                  data-testid="preview-notice"
                  className={styles.PreviewNotice}
                >
                  <h3 id={`${id}-title`}>{t('previewNoticeTitle')}</h3>
                  <p>{t('previewNoticeText')}</p>
                  <Button
                    data-testid="preview-close-button"
                    onPress={() => setOpen(false)}
                  >
                    {t('closeButton')}
                  </Button>
                </div>
                {children}
              </div>
            </div>
          </div>
        )}
      </DialogTrigger>
    </ContentContainer >
  )
}

export default QuestionPreview;
