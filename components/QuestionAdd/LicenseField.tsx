import { Button, ListBoxItem } from "react-aria-components";
import { useTranslations } from 'next-intl';
import { FormSelect } from '@/components/Form';
import {
  LicenseFieldProps
} from '@/app/types';
import { LicensesQuery } from '@/generated/graphql';

import styles from './questionAdd.module.scss';

interface LicenseFieldPropsWithData extends LicenseFieldProps {
  licensesData?: LicensesQuery;
}

const LicenseField = ({
  field,
  licensesData,
  newLicenseType,
  setNewLicenseType,
  onModeChange,
  onAddCustomType,
  onRemoveCustomType,
}: LicenseFieldPropsWithData) => {

  // Translation hooks
  const QuestionAdd = useTranslations('QuestionAdd');
  const Global = useTranslations('Global');

  const licenseTypeOptions = [
    { id: 'defaults', name: QuestionAdd('researchOutput.labels.useDefaults') },
    { id: 'addToDefaults', name: QuestionAdd('researchOutput.labels.useCustomList') }
  ];


  // Filter licenses into recommended and other categories
  const allLicenses = licensesData?.licenses?.filter((license): license is NonNullable<typeof license> => license !== null) || [];
  const defaultLicenses = allLicenses.filter(license => license.recommended).map(license => license.name);
  const otherLicenses = allLicenses.filter(license => !license.recommended).map(license => ({
    id: license.uri,
    name: license.name
  }));

  return (
    <div className={styles.typeConfig}>
      <div className={styles.typeModeSelector}>
        <FormSelect
          label={QuestionAdd('researchOutput.licenses.labels.define')}
          ariaLabel={QuestionAdd('researchOutput.licenses.labels.define')}
          isRequired={false}
          name="licenses"
          items={licenseTypeOptions}
          placeholder={Global('labels.selectAnItem')}
          onChange={(value) =>
            onModeChange(
              value as 'defaults' | 'addToDefaults'
            )
          }
          selectedKey={field.licensesConfig?.mode || 'defaults'}
        />
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
                  placeholder={Global('labels.selectAnItem')}
                  selectClasses={styles.licenseSelector}
                  onChange={(value) => setNewLicenseType(value)}
                  selectedKey={newLicenseType || 'defaults'}
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
                  {field.licensesConfig.customTypes.map((license, index: number) => (
                    <li key={index} className={styles.customTypeItem}>
                      <span>{license.name}</span>
                      <Button
                        type="button"
                        className={styles.removeButton}
                        onPress={() => onRemoveCustomType(license.name)}
                        aria-label={QuestionAdd('researchOutput.licenses.buttons.removeLicenseType', { type: license.name })}
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
