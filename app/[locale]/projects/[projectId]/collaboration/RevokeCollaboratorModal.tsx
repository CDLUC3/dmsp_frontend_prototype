import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay
} from "react-aria-components";
import styles from './ProjectsProjectCollaboration.module.scss';

interface RevokeCollaboratorModalProps {
  collaboratorId: number;
  collaboratorName: string;
  isOpen: boolean;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onRevoke: (id: number, name: string) => void;
  onCancel: () => void;
}

const RevokeCollaboratorModal: React.FC<RevokeCollaboratorModalProps> = ({
  collaboratorId,
  collaboratorName,
  isOpen,
  isDeleting,
  onOpenChange,
  onRevoke,
  onCancel,
}) => {
  // Localization
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectCollaboration');
  return (
    <div className={styles.memberActions}>
      <DialogTrigger
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <Button
          className="secondary"
          aria-label={t('revokeAccessFor', { name: collaboratorName })}
          isDisabled={isDeleting}
        >
          {t('buttons.revoke')}
        </Button>
        <ModalOverlay className={`${styles.modalOverride} react-aria-ModalOverlay`}>
          <Modal>
            <Dialog>
              {({ close }) => (
                <>
                  <h3>{t('headings.removeCollaborator')}</h3>
                  <p>{t('removeCollaborator')}</p>
                  <div className={styles.deleteConfirmButtons}>
                    <Button
                      className="secondary"
                      aria-label={t('cancelRemoval', { name: collaboratorName })}
                      autoFocus
                      onPress={() => {
                        onCancel();
                        close();
                      }}>
                      {Global('buttons.cancel')}
                    </Button>
                    <Button
                      className="primary"
                      aria-label={t('deleteCollaborator', { name: collaboratorName })}
                      onPress={() => {
                        onRevoke(collaboratorId, collaboratorName);
                        close();
                      }}
                    >
                      {Global('buttons.delete')}
                    </Button>
                  </div>
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </div>
  )

};

export default RevokeCollaboratorModal;