
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay,
  PressEvent
} from 'react-aria-components';

const handleDelete = async (e: PressEvent, close: any) => {
  try {
    //Call backend to remove the orcid access token from database
    close();
  } catch (error) {
    console.error('An error occurred while deleting the item:', error);
  }
};

interface ModalOverlayProps {
  heading: string;
  content: string;
  btnSecondaryText?: string;
  btnPrimaryText?: string;
  onPressAction: (e: PressEvent, close: () => void) => void; // Allow passing arguments
}

export const ModalOverlayComponent = ({
  heading,
  content,
  btnSecondaryText,
  btnPrimaryText,
  onPressAction
}: ModalOverlayProps) => {
  return (
    <ModalOverlay>
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