import React, { ReactNode } from 'react';
import {
  Button,
  Dialog,
  Heading,
  Modal,
  ModalOverlay
} from "react-aria-components";

interface ExampleProps {
  children: ReactNode;
}

export function Example({ children }: ExampleProps) {
  return (
    <div className="sg-example">
      {children}
    </div>
  )
}


interface BrandColorProps {
  varname: string,
}

export function BrandColor({ varname }: BrandColorProps) {
  const styleprops = {
    '--_color': `var(${varname})`,
  } as React.CSSProperties;

  return (
    <div className="brand-color" style={styleprops}>
      <code>{varname}</code>
    </div>
  );
}

const handleDelete = async () => {
  try {
    console.log('Deleted');
  } catch (error) {
    console.error("An error occurred while deleting the item:", error);
  }
};

export const ModalOverlayComponent = () => {
  return (
    <ModalOverlay>
      <Modal>
        <Dialog>
          {({ close }) => (
            <>
              <Heading>Confirm deletion</Heading>
              <p>Are you sure you want to disconnect your ORCID iD?</p>
              <div>
                <Button onPress={close}>Cancel</Button>
                <Button onPress={handleDelete}>Delete</Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}