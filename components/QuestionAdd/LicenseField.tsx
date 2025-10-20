import { Button, ListBoxItem } from "react-aria-components";
import { useTranslations } from 'next-intl';
import { FormSelect } from '@/components/Form';
import {
  LicenseFieldProps
} from '@/app/types';

import styles from './questionAdd.module.scss';

const licenseTypeOptions = [
  { id: 'defaults', name: 'Use defaults' },
  { id: 'addToDefaults', name: 'Use mine' }
];

// Default licenses
const defaultLicenses = [
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-NC-4.0',
  'CC-BY-NC-SA-4.0',
  'CC-BY-ND-4.0',
  'CC-BY-NC-ND-4.0',
  'CCo-1.0'
];

// Other licenses
export const otherLicenses = [
  { id: 'obsd', name: 'OBSD' },
  { id: 'aal', name: 'AAL' },
  { id: 'adsl', name: 'ADSL' },
  { id: 'afl11', name: 'AFL-1.1' },
  { id: 'aml', name: 'AML' }
];

const LicenseField = ({
  field,
  newLicenseType,
  setNewLicenseType,
  onModeChange,
  onAddCustomType,
  onRemoveCustomType,
}: LicenseFieldProps) => {
  const QuestionAdd = useTranslations('QuestionAdd');

  return (
    <div className={styles.typeConfig}>
      <div className={styles.typeModeSelector}>
        <FormSelect
          label={QuestionAdd('researchOutput.licenses.labels.define')}
          ariaLabel={QuestionAdd('researchOutput.licenses.labels.define')}
          isRequired={false}
          name="licenses"
          items={licenseTypeOptions}
          onChange={(value) =>
            onModeChange(
              value as 'defaults' | 'addToDefaults'
            )
          }
          selectedKey={field.licensesConfig?.mode || 'defaults'}
        >
          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
        </FormSelect>
      </div>

      {/* --- USE DEFAULTS MODE --- */}
      {field.licensesConfig?.mode === 'defaults' && (
        <div className={styles.defaultTypes}>
          <fieldset>
            <legend>{QuestionAdd('researchOutput.licenses.labels.defaultPreferred')}</legend>
            <ul className={`${styles.typesList} ${styles.bulletList}`}>
              {defaultLicenses.map((outputType) => (
                <li key={outputType} className={styles.typeItem}>
                  <span>{outputType}</span>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      )}

      {/* --- ADD TO DEFAULTS MODE --- */}
      {field.licensesConfig?.mode === 'addToDefaults' && (
        <>
          {/* Add user-defined types */}
          <div className={styles.customTypes}>
            <fieldset>
              <legend>{QuestionAdd('researchOutput.licenses.labels.myLicenses')}</legend>
              <div className={styles.addLicenseTypeContainer}>
                <FormSelect
                  label={QuestionAdd('researchOutput.licenses.labels.addLicense')}
                  ariaLabel={QuestionAdd('researchOutput.licenses.labels.addLicense')}
                  isRequired={false}
                  name="add-license"
                  items={otherLicenses}
                  selectClasses={styles.licenseSelector}
                  onChange={(value) => setNewLicenseType(value)}
                  selectedKey={field.licensesConfig?.mode || 'defaults'}
                >
                  {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                </FormSelect>
                <Button
                  type="button"
                  onPress={onAddCustomType}
                  isDisabled={!newLicenseType.trim()}
                >
                  {QuestionAdd('researchOutput.licenses.buttons.addLicenseType')}
                </Button>
              </div>
              {field.licensesConfig?.customTypes?.length > 0 && (
                <ul className={styles.customTypesList}>
                  {field.licensesConfig.customTypes.map((customType: string, index: number) => (
                    <li key={index} className={styles.customTypeItem}>
                      <span>{customType}</span>
                      <Button
                        type="button"
                        className={styles.removeButton}
                        onPress={() => onRemoveCustomType(customType)}
                        aria-label={QuestionAdd('researchOutput.licenses.buttons.removeLicenseType', { type: customType })}
                      >
                        x
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>
          </div>
        </>
      )}
    </div>
  );
};

export default LicenseField;