'use client'

import { useState } from 'react';
import { Button, Dialog, DialogTrigger, Modal, ModalOverlay } from 'react-aria-components';


const ConfirmModal: React.FC<{ email: string, onConfirm: (email: string) => void }> = ({ email, onConfirm }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
      <Button onPress={() => setOpen(true)}>Remove</Button>
      <ModalOverlay>
        <Modal>
          <Dialog>
            <h3>Confirm checkout?</h3>
            <p>You have 5 items in your cart. Proceed to checkout?</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button onPress={() => setOpen(false)}>Cancel</Button>
              <Button onPress={() => { onConfirm(email); setOpen(false); }} autoFocus>Confirm</Button>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
export default ConfirmModal;
