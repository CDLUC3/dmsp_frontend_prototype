import React, {
  useState,
  useEffect,
} from 'react';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import sanitizeHtml from 'sanitize-html';

import {
  Button,
  Modal,
  ModalOverlay,
  Dialog,
  DialogTrigger,
} from "react-aria-components";

import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel,
} from '@/components/Container';

import styles from './QuestionPreview.module.scss';


interface QuestionPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
}


const QuestionPreview: React.FC<QuestionPreviewProps> = ({
  children,
  id='',
  className='',
}) => {

  const [isOpen, setOpen] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

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

  useEffect(() => {
    if (isOpen) {
      if (window.location.hash !== `#${id}_modal`) {
        window.history.pushState(null, null, `#${id}_modal`);
      }
    } else {
      if (ready) {
        if (window.location.hash === `#${id}_modal`) {
          window.history.back();
        }
      }
    }
  }, [isOpen]);

  return (
    <ContentContainer
      id={id}
      className={styles.PreviewContainer}
    >
      <DialogTrigger>
        <Button
          onPress={() => setOpen(true)}
          data-testid="preview-button"
        >
          Preview
        </Button>
        <ModalOverlay
          data-testid="modal-overlay"
          className={styles.ModalOverlay}
          isOpen={isOpen}
          onOpenChange={setOpen}
          isDismissable
        >
          <Modal
            className={styles.Modal}
            data-testid="modal-bottomsheet"
          >
            <Dialog
              data-testid="modal-dialog"
              className={styles.ModalDialog}
            >
              <div
                data-testid="preview-notice"
                className={styles.PreviewNotice}
              >
                <h3>Preview</h3>
                <p>
                  This is a preview of how the user will see this question, with both
                  the funder and your own Requirements and Guidance text.
                </p>
                <Button
                  data-testid="preview-close-button"
                  onPress={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>

              {children}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </ContentContainer>
  )
}

export default QuestionPreview;
