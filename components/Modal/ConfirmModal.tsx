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
import { TransitionButton } from "@/components/Form";


const ConfirmModal: React.FC<{
  title: string,
  email: string,
  onConfirm: (email: string) => Promise<void>
}
> = ({ title, email, onConfirm }) => {
  const [isOpen, setOpen] = useState(false);
  //Localization keys
  const Global = useTranslations('Global');
  const AccessPage = useTranslations('TemplateAccessPage');

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
      <Button onPress={() => setOpen(true)}>{Global('buttons.remove')}</Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            <h3>{title}</h3>
            <p>{AccessPage('paragraphs.modalPara1', { email })}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button onPress={() => setOpen(false)}>{Global('buttons.cancel')}</Button>
              <TransitionButton
                onPress={async () => {
                  await onConfirm(email);
                  setOpen(false);//Only close after onConfirm completes
                }}
                loadingLabel={Global('buttons.confirming')}
                showLoading={false}
                autoFocus
              >
                {Global('buttons.confirm')}
              </TransitionButton>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
export default ConfirmModal;
