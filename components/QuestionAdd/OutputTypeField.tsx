import { Button, ListBoxItem, Radio } from "react-aria-components";
import { FormInput, FormSelect } from '@/components/Form';
import styles from './questionAdd.module.scss';

type DataFlagsConfig = {
  showSensitiveData: boolean;
  showPersonalData: boolean;
  mode: 'sensitiveOnly' | 'personalOnly' | 'both';
};

type RepoConfig = {
  hasCustomRepos: boolean;
  customRepos: string[];
}

type MetaDataConfig = {
  hasCustomStandards: boolean;
  customStandards: string[];
}

type StandardField = {
  id: string;
  label: string;
  enabled: boolean;
  [key: string]: any; // For additional properties like helpText, required, etc.
  flagsConfig?: DataFlagsConfig;
  repoConfig?: RepoConfig;
  metaDataConfig?: MetaDataConfig;
};

interface OutputTypeFieldConfigProps {
  field: StandardField;
  newOutputType: string;
  setNewOutputType: (value: string) => void;
  onModeChange: (mode: 'defaults' | 'mine' | 'addToDefaults') => void;
  onAddCustomType: () => void;
  onRemoveCustomType: (type: string) => void;
}

const outputTypeOptions = [
  { id: 'defaults', name: 'Use defaults' },
  { id: 'mine', name: 'Use mine' },
  { id: 'addToDefaults', name: 'Add mine to defaults' }
];

const defaultOutputTypes = [
  'Audiovisual',
  'Collection',
  'Data paper',
  'Dataset',
  'Event',
  'Image',
  'Interactive resource',
  'Model representation',
  'Physical object',
  'Service',
  'Software',
  'Sound',
  'Text',
  'Workflow'
];

const OutputTypeField = ({
  field,
  newOutputType,
  setNewOutputType,
  onModeChange,
  onAddCustomType,
  onRemoveCustomType,
}: OutputTypeFieldConfigProps) => {
  return (
    <div className={styles.typeConfig}>
      <div className={styles.typeModeSelector}>
        <FormSelect
          label="Define output types"
          ariaLabel="define output types"
          isRequired={false}
          name="status"
          items={outputTypeOptions}
          onChange={(value) =>
            onModeChange(value as 'defaults' | 'mine' | 'addToDefaults')
          }
          selectedKey={field.outputTypeConfig?.mode || 'defaults'}
        >
          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
        </FormSelect>
      </div>

      {/* USE DEFAULTS MODE */}
      {field.outputTypeConfig?.mode === 'defaults' && (
        <div className={styles.defaultTypes}>
          <fieldset>
            <legend>Default Output Types</legend>
            <ul className={`${styles.typesList} ${styles.bulletList}`}>
              {defaultOutputTypes.map((outputType) => (
                <li key={outputType} className={styles.typeItem}>
                  <span>{outputType}</span>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      )}

      {/* USE MINE MODE */}
      {field.outputTypeConfig?.mode === 'mine' && (
        <div className={styles.customTypes}>
          <fieldset>
            <legend>My Output Types</legend>
            <div className={styles.addTypeContainer}>
              <FormInput
                name="custom_types"
                type="text"
                isRequired={false}
                label="Enter an output type"
                className={styles.typeWrapper}
                value={newOutputType}
                onChange={(e) => setNewOutputType(e.target.value)}
                aria-label="Enter an output type"
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
                isDisabled={!newOutputType.trim()}
              >
                Add output type
              </Button>
            </div>

            {field.outputTypeConfig?.customTypes?.length > 0 && (
              <ul className={`${styles.customTypesList} ${styles.deletableList}`}>
                {field.outputTypeConfig.customTypes.map((customType: string, index: number) => (
                  <li key={index} className={styles.customTypeItem}>
                    <span>{customType}</span>
                    <Button
                      type="button"
                      className={styles.removeButton}
                      onPress={() => onRemoveCustomType(customType)}
                      aria-label={`Remove ${customType}`}
                    >
                      x
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        </div>
      )}

      {/* ADD TO DEFAULTS MODE */}
      {field.outputTypeConfig?.mode === 'addToDefaults' && (
        <>
          <div className={styles.defaultTypes}>
            <fieldset>
              <legend>Default Output Types</legend>
              <ul className={`${styles.typesList} ${styles.bulletList}`}>
                {defaultOutputTypes.map((outputType) => (
                  <li key={outputType} className={styles.typeItem}>
                    <span>{outputType}</span>
                  </li>
                ))}
              </ul>
            </fieldset>
          </div>

          <div className={styles.customTypes}>
            <fieldset>
              <legend>My Output Types</legend>
              <div className={styles.addTypeContainer}>
                <FormInput
                  name="custom_types_add"
                  type="text"
                  isRequired={false}
                  label="Enter an output type"
                  className={styles.typeWrapper}
                  value={newOutputType}
                  onChange={(e) => setNewOutputType(e.target.value)}
                  aria-label="Enter an output type"
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
                  isDisabled={!newOutputType.trim()}
                >
                  Add output type
                </Button>
              </div>

              {field.outputTypeConfig?.customTypes?.length > 0 && (
                <ul className={styles.customTypesList}>
                  {field.outputTypeConfig.customTypes.map((customType: string, index: number) => (
                    <li key={index} className={styles.customTypeItem}>
                      <span>{customType}</span>
                      <Button
                        type="button"
                        className={styles.removeButton}
                        onPress={() => onRemoveCustomType(customType)}
                        aria-label={`Remove ${customType}`}
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

export default OutputTypeField;