
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay
} from "react-aria-components";


interface ModalOverlayProps {
  heading: string;
  content: string;
  btnSecondaryText?: string;
  btnPrimaryText?: string;
  onPressAction: () => Promise<void>;
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
                <Button onPress={onPressAction}>{btnPrimaryText || 'Delete'}</Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}