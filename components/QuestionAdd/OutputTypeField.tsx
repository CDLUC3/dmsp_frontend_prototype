import { Button, ListBoxItem } from "react-aria-components";
import { useTranslations } from 'next-intl';
import { FormInput, FormSelect } from '@/components/Form';
import {
  OutputTypeFieldConfigProps,
} from '@/app/types';
import styles from './questionAdd.module.scss';

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
  const QuestionAdd = useTranslations('QuestionAdd');
  return (
    <div className={styles.typeConfig}>
      <div className={styles.typeModeSelector}>
        <FormSelect
          label={QuestionAdd('researchOutput.outputType.labels.defineOutputTypes')}
          ariaLabel={QuestionAdd('researchOutput.outputType.labels.defineOutputTypes')}
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
            <legend>{QuestionAdd('researchOutput.outputType.legends.default')}</legend>
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
            <legend>{QuestionAdd('researchOutput.outputType.legends.myOutputs')}</legend>
            <div className={styles.addTypeContainer}>
              <FormInput
                name="custom_types"
                type="text"
                isRequired={false}
                label={QuestionAdd('researchOutput.outputType.labels.enterOutputType')}
                className={styles.typeWrapper}
                value={newOutputType}
                onChange={(e) => setNewOutputType(e.target.value)}
                aria-label={QuestionAdd('researchOutput.outputType.labels.enterOutputType')}
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
                {QuestionAdd('researchOutput.outputType.buttons.addOutputType')}
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
                      aria-label={QuestionAdd('researchOutput.outputType.labels.removeOutputType', { type: customType })}
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
              <legend>{QuestionAdd('researchOutput.outputType.legends.default')}</legend>
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
              <legend>{QuestionAdd('researchOutput.outputType.legends.myOutputs')}</legend>
              <div className={styles.addTypeContainer}>
                <FormInput
                  name="custom_types_add"
                  type="text"
                  isRequired={false}
                  label={QuestionAdd('researchOutput.outputType.labels.enterOutputType')}
                  className={styles.typeWrapper}
                  value={newOutputType}
                  onChange={(e) => setNewOutputType(e.target.value)}
                  aria-label={QuestionAdd('researchOutput.outputType.labels.enterOutputType')}
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
                  {QuestionAdd('researchOutput.outputType.buttons.addOutputType')}
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
                        aria-label={QuestionAdd('researchOutput.outputType.labels.removeOutputType', { type: customType })}
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