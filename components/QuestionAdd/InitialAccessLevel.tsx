import { useTranslations } from 'next-intl';
//import { FormInput, FormSelect } from '@/components/Form';
import { FormInput } from '@/components/Form';
import {
  AccessLevelInterface,
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

// const accessLevelOptions = [
//   { id: 'defaults', name: 'Use defaults' },
//   { id: 'mine', name: 'Customize output list' },
// ];

const defaultAccessLevels = [
  { id: 'controlledAccess', level: 'Controlled access', description: 'Restricts access to certain areas' },
  { id: 'unrestrictedAccess', level: 'Unrestricted access', description: 'Allows access to all areas' },
  { id: 'Other', level: 'Other', description: 'Other type of access' },
];

const InitialAccessLevelField = ({
  field,
  newAccessLevel,
  setNewAccessLevel,
  //onModeChange,
  onAddCustomType,
  onRemoveCustomType,
}: AccessLevelsFieldProps) => {
  const QuestionAdd = useTranslations('QuestionAdd');
  return (
    <div className={styles.typeConfig}>
      {/* <div className={styles.typeModeSelector}>
        <FormSelect
          label={QuestionAdd('researchOutput.accessLevels.labels.defineAccessLevels')}
          ariaLabel={QuestionAdd('researchOutput.accessLevels.labels.defineAccessLevels')}
          isRequired={false}
          name="status"
          items={accessLevelOptions}
          onChange={(value) =>
            onModeChange(value as 'defaults' | 'mine')
          }
          selectedKey={field.accessLevelsConfig?.mode || 'defaults'}
        >
          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
        </FormSelect>
      </div> */}

      {/* USE DEFAULTS MODE */}
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

      {/* USE MINE MODE */}
      {field.accessLevelsConfig?.mode === 'mine' && (
        <div className={styles.customTypes}>
          <fieldset>
            <legend>{QuestionAdd('researchOutput.accessLevels.legends.myAccessLevels')}</legend>
            <div role="form" aria-label={QuestionAdd('labels.addCustomAccessLevel')}>
              <FormInput
                name="custom_types_add"
                type="text"
                isRequired={false}
                label={QuestionAdd('researchOutput.accessLevels.labels.enterAccessLevel')}
                className={styles.typeWrapper}
                value={newAccessLevel.level}
                onChange={(e) => setNewAccessLevel({ ...newAccessLevel, level: e.target.value })}
                aria-label={QuestionAdd('researchOutput.accessLevels.labels.enterAccessLevel')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddCustomType();
                  }
                }}
              />
              <FormInput
                name="custom_types_description"
                type="text"
                isRequired={false}
                label={QuestionAdd('researchOutput.accessLevels.labels.accessLevelDescription')}
                className={styles.typeWrapper}
                value={newAccessLevel.description}
                onChange={(e) => setNewAccessLevel({ ...newAccessLevel, description: e.target.value })}
                aria-label={QuestionAdd('researchOutput.accessLevels.labels.accessLevelDescription')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddCustomType();
                  }
                }}
              />
              <Button
                type="button"
                onPress={onAddCustomType}
                isDisabled={!newAccessLevel?.level?.trim()}
                aria-label={QuestionAdd('researchOutput.accessLevels.buttons.addAccessLevel')}
              >
                {QuestionAdd('researchOutput.accessLevels.buttons.addAccessLevel')}
              </Button>
            </div>

            {field.accessLevelsConfig?.customLevels?.length > 0 && (
              <div role="region" aria-label={QuestionAdd('labels.customAccessLevelList')}>
                <ul
                  className={`${styles.customTypesList} ${styles.deletableList}`}
                  role="list"
                  aria-live="polite"
                  aria-relevant="additions removals"
                >
                  {field.accessLevelsConfig.customLevels.map((customLevel: AccessLevelInterface, index: number) => (
                    <li
                      key={index}
                      className={styles.customTypeItem}
                      role="listitem"
                    >
                      <div className={styles.infoWrapper}>
                        <span id={`custom-level-${index}`}>{customLevel.level}</span>
                        <DialogTrigger>
                          <Button
                            className="popover-btn"
                            aria-label={QuestionAdd('labels.clickForMoreInfo')}
                            aria-describedby={`custom-level-${index}`}
                          >
                            <div className="icon info"><DmpIcon icon="info" /></div>
                          </Button>
                          <Popover className="dynamic-popover-width react-aria-Popover">
                            <OverlayArrow>
                              <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
                                <path d="M0 0 L6 6 L12 0" />
                              </svg>
                            </OverlayArrow>
                            <Dialog aria-label={QuestionAdd('labels.accessLevelDescription', { level: customLevel.level || '' })}>
                              <div className="flex-col">
                                {customLevel.description}
                              </div>
                            </Dialog>
                          </Popover>
                        </DialogTrigger>
                      </div>
                      <Button
                        type="button"
                        className={styles.removeButton}
                        onPress={() => onRemoveCustomType(customLevel.level ?? '')}
                        aria-label={QuestionAdd('researchOutput.accessLevels.labels.removeAccessLevel', { level: customLevel.level ?? '' })}
                      >
                        <span aria-hidden="true">x</span>
                        <span className="hidden-accessibly">{QuestionAdd('buttons.removeAccessLevel', { level: customLevel.level ?? '' })}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
};

export default InitialAccessLevelField;