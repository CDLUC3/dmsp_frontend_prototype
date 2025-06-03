'use client';

import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  PressEvent
} from 'react-aria-components';

interface ModalOverlayProps {
  heading: string;
  content: string;
  isOpen?: boolean;
  btnSecondaryText?: string;
  btnPrimaryText?: string;
  onPressAction: (e: PressEvent, close: () => void) => void; // Allow passing arguments
}

export const ModalOverlayComponent = ({
  heading,
  content,
  isOpen,
  btnSecondaryText,
  btnPrimaryText,
  onPressAction
}: ModalOverlayProps) => {

  return (
    <ModalOverlay isOpen={isOpen}>
      <Modal>
        <Dialog>
          {({ close }) => (
            <>
              <Heading>{heading}</Heading>
              <p>{content}</p>
              <div>
                <Button onPress={close}>{btnSecondaryText || 'Cancel'}</Button>
                <Button onPress={e => onPressAction(e, close)}>{btnPrimaryText || 'Delete'}</Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}