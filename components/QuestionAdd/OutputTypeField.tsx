import { useTranslations } from 'next-intl';
import { FormInput, FormSelect } from '@/components/Form';
import {
  OutputTypeFieldConfigProps,
  OutputTypeInterface,
} from '@/app/types';

import {
  Button,
  Dialog,
  DialogTrigger,
  ListBoxItem,
  OverlayArrow,
  Popover,
} from "react-aria-components";
import { DmpIcon } from "@/components/Icons";

import styles from './questionAdd.module.scss';

const outputTypeOptions = [
  { id: 'defaults', name: 'Use defaults' },
  { id: 'mine', name: 'Customize output list' },
];

const defaultOutputTypes = [
  { id: 'Audiovisual', type: 'Audiovisual', description: 'A series of visual representations imparting an impression of motion when shown in succession. May or may not include sound.' },
  { id: 'Collection', type: 'Collection', description: 'An aggregation of resources, which may encompass collections of one resourceType as well as those of mixed types. A collection is described as a group; its parts may also be separately described.' },
  { id: 'Data paper', type: 'Data paper', description: 'A factual and objective publication with a focused intent to identify and describe specific data, sets of data, or data collections to facilitate discoverability.' },
  { id: 'Dataset', type: 'Dataset', description: 'Data encoded in a defined structure.' },
  { id: 'Event', type: 'Event', description: 'A non-persistent, time-based occurrence.' },
  { id: 'Image', type: 'Image', description: 'A visual representation other than text.' },
  { id: 'Interactive resource', type: 'Interactive resource', description: 'A resource requiring interaction from the user to be understood, executed, or experienced.' },
  { id: 'Model representation', type: 'Model representation', description: 'An abstract, conceptual, graphical, mathematical or visualization model that represents empirical objects, phenomena, or physical processes.' },
  { id: 'Physical object', type: 'Physical object', description: 'A physical object or substance.' },
  { id: 'Service', type: 'Service', description: 'An organized system of apparatus, appliances, staff, etc., for supplying some function(s) required by end users.' },
  { id: 'Software', type: 'Software', description: 'A computer program other than a computational notebook, in either source code (text) or compiled form. Use this type for general software components supporting scholarly research. Use the “ComputationalNotebook” value for virtual notebooks.' },
  { id: 'Sound', type: 'Sound', description: 'A resource primarily intended to be heard.' },
  { id: 'Text', type: 'Text', description: 'A resource consisting primarily of words for reading that is not covered by any other textual resource type in this list.' },
  { id: 'Workflow', type: 'Workflow', description: 'A structured series of steps which can be executed to produce a final outcome, allowing users a means to specify and enact their work in a more reproducible manner.' }
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
            onModeChange(value as 'defaults' | 'mine')
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
            <ul className={`${styles.typesList} ${styles.bulletList}`} role="list">
              {defaultOutputTypes.map((outputType) => (
                <li key={outputType.id} className={styles.typeItem}>
                  <span id={`output-type-${outputType.id}`}>{outputType.type}</span>
                  <DialogTrigger>
                    <Button
                      className="popover-btn"
                      aria-label={QuestionAdd('labels.clickForMoreInfo')}
                      aria-describedby={`output-type-${outputType.id}`}
                    >
                      <div className="icon info"><DmpIcon icon="info" /></div>
                    </Button>
                    <Popover className="dynamic-popover-width react-aria-Popover">
                      <OverlayArrow>
                        <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M0 0 L6 6 L12 0" />
                        </svg>
                      </OverlayArrow>
                      <Dialog aria-label={QuestionAdd('labels.typeDescription', { type: outputType.type })}>
                        <div className="flex-col">
                          {outputType.description}
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
      {field.outputTypeConfig?.mode === 'mine' && (
        <div className={styles.customTypes}>
          <fieldset>
            <legend>{QuestionAdd('researchOutput.outputType.legends.myOutputs')}</legend>
            <div role="form" aria-label={QuestionAdd('labels.addCustomOutputType')}>
              <FormInput
                name="custom_types_add"
                type="text"
                isRequired={false}
                label={QuestionAdd('researchOutput.outputType.labels.enterOutputType')}
                className={styles.typeWrapper}
                value={newOutputType.type}
                onChange={(e) => setNewOutputType({ ...newOutputType, type: e.target.value })}
                aria-label={QuestionAdd('researchOutput.outputType.labels.enterOutputType')}
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
                label={QuestionAdd('researchOutput.outputType.labels.typeDescription')}
                className={styles.typeWrapper}
                value={newOutputType.description}
                onChange={(e) => setNewOutputType({ ...newOutputType, description: e.target.value })}
                aria-label={QuestionAdd('researchOutput.outputType.labels.typeDescription')}
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
                isDisabled={!newOutputType?.type?.trim()}
                aria-label={QuestionAdd('researchOutput.outputType.buttons.addOutputType')}
              >
                {QuestionAdd('researchOutput.outputType.buttons.addOutputType')}
              </Button>
            </div>

            {field.outputTypeConfig?.customTypes?.length > 0 && (
              <div role="region" aria-label={QuestionAdd('labels.customTypeList')}>
                <ul
                  className={`${styles.customTypesList} ${styles.deletableList}`}
                  role="list"
                  aria-live="polite"
                  aria-relevant="additions removals"
                >
                  {field.outputTypeConfig.customTypes.map((customType: OutputTypeInterface, index: number) => (
                    <li
                      key={index}
                      className={styles.customTypeItem}
                      role="listitem"
                    >
                      <div className={styles.infoWrapper}>
                        <span id={`custom-type-${index}`}>{customType.type}</span>
                        <DialogTrigger>
                          <Button
                            className="popover-btn"
                            aria-label={QuestionAdd('labels.clickForMoreInfo')}
                            aria-describedby={`custom-type-${index}`}
                          >
                            <div className="icon info"><DmpIcon icon="info" /></div>
                          </Button>
                          <Popover className="dynamic-popover-width react-aria-Popover">
                            <OverlayArrow>
                              <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
                                <path d="M0 0 L6 6 L12 0" />
                              </svg>
                            </OverlayArrow>
                            <Dialog aria-label={QuestionAdd('labels.typeDescription', { type: customType.type || '' })}>
                              <div className="flex-col">
                                {customType.description}
                              </div>
                            </Dialog>
                          </Popover>
                        </DialogTrigger>
                      </div>
                      <Button
                        type="button"
                        className={styles.removeButton}
                        onPress={() => onRemoveCustomType(customType.type ?? '')}
                        aria-label={QuestionAdd('researchOutput.outputType.labels.removeOutputType', { type: customType.type ?? '' })}
                      >
                        <span aria-hidden="true">x</span>
                        <span className="hidden-accessibly">{QuestionAdd('buttons.removeType', { type: customType.type ?? '' })}</span>
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

export default OutputTypeField;