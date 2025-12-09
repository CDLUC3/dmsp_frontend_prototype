import { useTranslations } from 'next-intl';
import {
  AccessLevelsFieldProps,
} from '@/app/types';

import {
  Button,
  Dialog,
  DialogTrigger,
  //ListBoxItem,
  OverlayArrow,
  Popover,
} from "react-aria-components";
import { DmpIcon } from "@/components/Icons";

import styles from './questionAdd.module.scss';

const defaultAccessLevels = [
  { id: 'controlledAccess', level: 'Controlled access', description: 'Restricts access to certain areas' },
  { id: 'unrestrictedAccess', level: 'Unrestricted access', description: 'Allows access to all areas' },
  { id: 'Other', level: 'Other', description: 'Other type of access' },
];

const InitialAccessLevelField = ({
  field,
}: AccessLevelsFieldProps) => {
  const QuestionAdd = useTranslations('QuestionAdd');
  return (
    <div className={styles.typeConfig}>
      {field.accessLevelsConfig?.mode === 'defaults' && (
        <div className={styles.defaultTypes}>
          <fieldset>
            <legend>{QuestionAdd('researchOutput.accessLevels.legends.default')}</legend>
            <ul className={`${styles.typesList} ${styles.bulletList}`} role="list">
              {defaultAccessLevels.map((accessLevel) => (
                <li key={accessLevel.id} className={styles.typeItem}>
                  <span id={`custom-level-${accessLevel.id}`}>{accessLevel.level}</span>
                  <DialogTrigger>
                    <Button
                      className="popover-btn"
                      aria-label={QuestionAdd('labels.clickForMoreInfo')}
                      aria-describedby={`access-level-${accessLevel.id}`}
                    >
                      <div className="icon info"><DmpIcon icon="info" /></div>
                    </Button>
                    <Popover className="dynamic-popover-width react-aria-Popover">
                      <OverlayArrow>
                        <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M0 0 L6 6 L12 0" />
                        </svg>
                      </OverlayArrow>
                      <Dialog aria-label={QuestionAdd('labels.accessLevelDescription', { level: accessLevel.level })}>
                        <div className="flex-col">
                          {accessLevel.description}
                        </div>
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      )}
    </div>
  );
};

export default InitialAccessLevelField;