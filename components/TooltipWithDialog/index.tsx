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
  OverlayArrow,
  PressEvent
} from 'react-aria-components';
import { useButton } from 'react-aria';
import Image from 'next/image';
import { DmpIcon } from "@/components/Icons";
import classNames from 'classnames';
import styles from "./tooltipWithDialog.module.scss";

interface TooltipWithDialogProps {
  text: string;
  tooltipText: string;
  dialogHeading?: string;
  dialogContent?: string;
  icon?: ReactNode;
  imageUrl?: string;
  onPressAction: (e: PressEvent, close: () => void) => void; // Allow passing arguments
  children?: ReactNode;
}

const TooltipWithDialog = ({
  text,
  tooltipText,
  dialogHeading,
  dialogContent,
  icon,
  imageUrl,
  onPressAction,
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

  return (
    <>
      <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger delay={0}>
          <Button {...buttonProps as {}} className={classNames('react-aria-Button', styles.tooltipButton)}>
            {imageUrl && (
              <span><Image src={imageUrl} className={styles.icon} width={20} height={20} alt="" /></span>
            )}<span>{text}</span><span>{icon || <DmpIcon icon="cancel" />}</span>
          </Button>
          <Tooltip placement="bottom left" className={styles.tooltip} data-testid="tooltip-container">
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
                      <Button onPress={e => onPressAction(e, close)}>Delete</Button>
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