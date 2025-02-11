'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay
} from 'react-aria-components';


const ConfirmModal: React.FC<{ email: string, onConfirm: (email: string) => void }> = ({ email, onConfirm }) => {
  const [isOpen, setOpen] = useState(false);
  //Localization keys
  const Global = useTranslations('Global');
  const AccessPage = useTranslations('TemplateAccessPage');

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
      <Button onPress={() => setOpen(true)}>Remove</Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            <h3>{AccessPage('headings.confirmCheckout')}</h3>
            <p>{AccessPage('paragraphs.modalPara1', { email: email })}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button onPress={() => setOpen(false)}>{Global('buttons.cancel')}</Button>
              <Button onPress={() => { onConfirm(email); setOpen(false); }} autoFocus>{Global('buttons.confirm')}</Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
export default ConfirmModal;
