import React, { useState, useRef, ReactNode } from 'react';
import {
  Button,
  Tooltip,
  TooltipTrigger,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  OverlayArrow
} from "react-aria-components";
import { useButton } from 'react-aria';
import { DmpIcon } from "@/components/Icons";
import classNames from 'classnames';
import styles from "./tooltipWithDialog.module.scss";

interface TooltipWithDialogProps {
  tooltipText: string;
  dialogHeading?: string;
  dialogContent?: string;
  icon?: ReactNode;
  children: ReactNode;
}

const TooltipWithDialog = ({
  tooltipText,
  dialogHeading,
  dialogContent,
  icon,
  children
}: TooltipWithDialogProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const { buttonProps } = useButton(
    {
      onPress: () => setIsOpen(true),
      'aria-label': 'Delete Item',
    },
    buttonRef
  );

  const handleDelete = async () => {
    try {
      setIsConfirmed(true);
      setIsOpen(false);
    } catch (error) {
      console.error("An error occurred while deleting the item:", error);
    }
  };

  return (
    <>
      <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger delay={0}>
          <Button {...buttonProps as {}} className={classNames('react-aria-Button', styles.tooltipButton)}>
            {icon || <DmpIcon icon="cancel" />}
          </Button>
          <Tooltip placement="bottom left" className={styles.tooltip}>
            <OverlayArrow className={styles.tooltipArrow} />
            {tooltipText}
          </Tooltip>
        </TooltipTrigger>
        {children ? (
          children
        ) : (
          <ModalOverlay>
            <Modal>
              <Dialog>
                {({ close }) => (
                  <>
                    <Heading>{dialogHeading}</Heading>
                    <p>{dialogContent}</p>
                    <div>
                      <Button onPress={close}>Cancel</Button>
                      <Button onPress={handleDelete}>Delete</Button>
                    </div>
                  </>
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>
        )}

        {isConfirmed && <p>Item has been deleted</p>}
      </DialogTrigger >
    </>
  )
}

export default TooltipWithDialog;