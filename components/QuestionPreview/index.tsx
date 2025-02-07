import React, {
  useState,
} from 'react';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import sanitizeHtml from 'sanitize-html';

import {
  Button,
  Modal,
  ModalOverlay,
  Dialog,
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

  const [isOpen, setIsOpen] = useState<boolean>(false);

  function showPreview() {
    if (!isOpen) setIsOpen(true);
  }

  function hidePreview() {
    if (isOpen) setIsOpen(false);
  }

  function handleOpenChange(ev) {
    console.log('Modal Event?');
    console.log(ev);
  }

  return (
    <ContentContainer
      id={id}
      className={styles.PreviewContainer}
      data-testid="preview-container"
    >
      <Button onPress={showPreview}>Preview</Button>
      <ModalOverlay
        className={styles.ModalOverlay}
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isDismissable
      >
        <Modal
          className={styles.Modal}
          data-testid="bottomsheet-modal"
        >
          <div className={styles.PreviewNotice}>
            <h3>Preview</h3>
            <p>
              This is a preview of how the user will see this question, with both
              the funder and your own Requirements and Guidance text.
            </p>
            <Button onPress={hidePreview}>Close</Button>
          </div>

          <LayoutWithPanel className={styles.ModalContentLayout}>
            <ContentContainer
              data-testid="bottomsheet-content"
            >
              {children}
            </ContentContainer>

            <SidebarPanel
              className={`${styles.Sidebar}`}
              data-testid="sidebar-panel"
            >
              <p>Best pracive by (DMPTool Logo)</p>

              <h3>Data Sharing</h3>
              <p>
                Give a summary of the data you will collect or create, noting the
                content, coverage and data type, for example tabular data, survey
                data, experimental measurements, models, software, audiovisual data,
                physical samples, etc.
              </p>
              <p><a href="#">Expand</a></p>

              <h3>Data Preservation</h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                imperdiet tempor mi, in fringilla lectus viverra et. Suspendisse
                erat dolor, rutrum et tempor eu, ultricies quis nunc.
              </p>
              <p><a href="#">Expand</a></p>

              <h3>Data Protection</h3>
              <p>
                Quisque sit amet ex volutpat, imperdiet risus sit amet, malesuada
                enim.
              </p>
              <p><a href="#">Expand</a></p>
            </SidebarPanel>
          </LayoutWithPanel>
        </Modal>
      </ModalOverlay>
    </ContentContainer>
  )
}

export default QuestionPreview;
