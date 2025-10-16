'use client'

import { useState } from 'react';
import {
  Button,
  Checkbox,
  ListBoxItem,
  Radio
} from "react-aria-components";

// Components
import {
  FormInput,
  FormSelect,
  FormTextArea,
  RadioGroupComponent
} from '@/components/Form';
import RepositorySelectionSystem from './ReposSelector';
import MetaDataStandards from './MetaDataStandards';
import OutputTypeField from './OutputTypeField';

// Types
import {
  StandardField,
  MetaDataConfig,
  RepositoryInterface,
  MetaDataStandardInterface
} from '@/app/types';

// Styles
import styles from './questionAdd.module.scss';

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

const licenseTypeOptions = [
  { id: 'defaults', name: 'Use defaults' },
  { id: 'addToDefaults', name: 'Use mine' }
];

// Other licenses
const otherLicenses = [
  { id: 'obsd', name: 'OBSD' },
  { id: 'aal', name: 'AAL' },
  { id: 'adsl', name: 'ADSL' },
  { id: 'afl11', name: 'AFL-1.1' },
  { id: 'aml', name: 'AML' }
];

// Type guard function to check if a field has metaDataConfig
const hasMetaDataConfig = (field: StandardField): field is StandardField & { metaDataConfig: MetaDataConfig } => {
  return field.metaDataConfig !== undefined;
};

interface ResearchOutputFieldsManagerProps {
  standardFields: StandardField[];
  additionalFields: any[];
  expandedFields: string[];
  newOutputType: string;
  newLicenseType: string;
  onStandardFieldChange: (fieldId: string, enabled: boolean) => void;
  onCustomizeField: (fieldId: string) => void;
  onUpdateStandardFieldProperty: (fieldId: string, propertyName: string, value: any) => void;
  onRepositoriesChange: (repos: RepositoryInterface[]) => void;
  onMetaDataStandardsChange: (standards: MetaDataStandardInterface[]) => void;
  onTogglePreferredRepositories: (hasCustomRepos: boolean) => void;
  onToggleMetaDataStandards: (hasCustomStandards: boolean) => void;
  onLicenseModeChange: (mode: 'defaults' | 'addToDefaults') => void;
  onAddCustomLicenseType: () => void;
  onRemoveCustomLicenseType: (typeToRemove: string) => void;
  onOutputTypeModeChange: (mode: 'defaults' | 'mine' | 'addToDefaults') => void;
  onAddCustomOutputType: () => void;
  onRemoveCustomOutputType: (typeToRemove: string) => void;
  onUpdateAdditionalField: (fieldId: string, propertyName: string, value: any) => void;
  onDeleteAdditionalField: (fieldId: string) => void;
  onAddAdditionalField: () => void;
  onSetNewOutputType: (value: string) => void;
  onSetNewLicenseType: (value: string) => void;
}

const ResearchOutputFieldsManager: React.FC<ResearchOutputFieldsManagerProps> = ({
  standardFields,
  additionalFields,
  expandedFields,
  newOutputType,
  newLicenseType,
  onStandardFieldChange,
  onCustomizeField,
  onUpdateStandardFieldProperty,
  onRepositoriesChange,
  onMetaDataStandardsChange,
  onTogglePreferredRepositories,
  onToggleMetaDataStandards,
  onLicenseModeChange,
  onAddCustomLicenseType,
  onRemoveCustomLicenseType,
  onOutputTypeModeChange,
  onAddCustomOutputType,
  onRemoveCustomOutputType,
  onUpdateAdditionalField,
  onDeleteAdditionalField,
  onAddAdditionalField,
  onSetNewOutputType,
  onSetNewLicenseType
}) => {
  return (
    <div className={styles.fieldsContainer}>
      <h3>Enable Standard Fields</h3>

      <p className={styles.fieldsDescription}>
        Select which standard fields to include in your research output question. You can customize each field individually.
      </p>
      <div className={styles.fieldsList}>
        {standardFields.map((field, index) => {
          // These fields are always required and cannot be turned off
          const isDisabled = field.id === 'title' || field.id === 'outputType';

          return (
            <div key={field.id} className={styles.fieldRowWrapper}>
              <div className={styles.fieldRow}>
                <div className={isDisabled ? styles.tooltipWrapper : undefined}>
                  <Checkbox
                    isSelected={field.enabled}
                    isDisabled={isDisabled}
                    className={
                      `react-aria-Checkbox ${(field.id === 'title' || field.id === 'outputType')
                        ? styles.disabledCheckbox
                        : ''
                      }`
                    }
                    onChange={(isSelected) => onStandardFieldChange(field.id, isSelected)}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <span>{field.label}</span>
                  </Checkbox>
                  {isDisabled && <span className={styles.tooltipText}>These fields are required</span>}
                </div>
                {field.id !== 'title' && (
                  <Button
                    type="button"
                    className={`buttonLink link`}
                    onPress={() => onCustomizeField(field.id)}
                  >
                    {expandedFields.includes(field.id) ? "Close" : "Customize"}
                  </Button>
                )}
              </div>

              {/* Expanded panel OUTSIDE the .fieldRow flex container */}
              {expandedFields.includes(field.id) && (
                <div className={styles.fieldPanel}>
                  {/** Description */}
                  {field.id === 'description' && (
                    <FormTextArea
                      name="description"
                      isRequired={false}
                      richText={true}
                      label="Description"
                      value={field.value}
                      onChange={(newValue) => onUpdateStandardFieldProperty('description', 'value', newValue)}
                    />
                  )}

                  {/** Data Flags Configuration */}
                  {field.id === 'dataFlags' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <fieldset>
                        <legend>Which data flags to display</legend>
                        <div className={styles.dataFlagsConfig}>
                          <RadioGroupComponent
                            name="dataFlagsMode"
                            value={field.flagsConfig?.mode || 'both'}
                            description="Select which data sensitivity flags should be shown to users"
                            onChange={(mode) => onUpdateStandardFieldProperty('dataFlags', 'flagsConfig', {
                              ...field.flagsConfig,
                              mode,
                              showSensitiveData: mode === 'sensitiveOnly' || mode === 'both',
                              showPersonalData: mode === 'personalOnly' || mode === 'both'
                            })}
                          >
                            <div>
                              <Radio value="sensitiveOnly">Display only "May contain sensitive data?" checkbox</Radio>
                            </div>
                            <div>
                              <Radio value="personalOnly">Display only "May contain personally identifiable information?" checkbox</Radio>
                            </div>
                            <div>
                              <Radio value="both">Display both data flag checkboxes</Radio>
                            </div>
                          </RadioGroupComponent>
                        </div>
                      </fieldset>
                    </div>
                  )}

                  {/** Output Type Configuration */}
                  {field.id === 'outputType' && (
                    <OutputTypeField
                      field={field}
                      newOutputType={newOutputType}
                      setNewOutputType={onSetNewOutputType}
                      onModeChange={onOutputTypeModeChange}
                      onAddCustomType={onAddCustomOutputType}
                      onRemoveCustomType={onRemoveCustomOutputType}
                    />
                  )}

                  {/** Repository Selector */}
                  {field.id === 'repoSelector' && (
                    <>
                      <RepositorySelectionSystem
                        field={field}
                        handleTogglePreferredRepositories={onTogglePreferredRepositories}
                        onRepositoriesChange={onRepositoriesChange}
                      />

                      <FormTextArea
                        name="repoSelectorDescription"
                        isRequired={false}
                        richText={true}
                        label="Description for Repositories field"
                        value={field.value}
                        onChange={(value) => onUpdateStandardFieldProperty('repoSelector', 'value', value)}
                      />
                    </>
                  )}

                  {/** Metadata Standards */}
                  {field.id === 'metadataStandards' && hasMetaDataConfig(field) && (
                    <>
                      <MetaDataStandards
                        field={field}
                        handleToggleMetaDataStandards={onToggleMetaDataStandards}
                        onMetaDataStandardsChange={onMetaDataStandardsChange}
                      />

                      <FormTextArea
                        name="metadataStandardsDescription"
                        isRequired={false}
                        richText={true}
                        label="Description for Metadata Standards field"
                        value={field.value}
                        helpMessage="This can be used to provide custom guidance and/or instructions for researchers."
                        onChange={(value) => onUpdateStandardFieldProperty('metadataStandards', 'value', value)}
                      />
                    </>
                  )}

                  {/**License configurations */}
                  {field.id === 'licenses' && (
                    <div className={styles.outputTypeConfig}>
                      <div className={styles.outputTypeModeSelector}>
                        <FormSelect
                          label="Define preferred licenses"
                          ariaLabel="define preferred licenses"
                          isRequired={false}
                          name="status"
                          items={licenseTypeOptions}
                          onChange={(value) =>
                            onLicenseModeChange(
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
                        <div className={styles.defaultOutputTypes}>
                          <fieldset>
                            <legend>Default Preferred Licenses</legend>
                            <ul className={`${styles.outputTypesList} ${styles.bulletList}`}>
                              {defaultLicenses.map((outputType) => (
                                <li key={outputType} className={styles.outputTypeItem}>
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
                          <div className={styles.customOutputTypes}>
                            <fieldset>
                              <legend>My Licenses</legend>
                              <div className={styles.addLicenseTypeContainer}>
                                <FormSelect
                                  label="Add license"
                                  ariaLabel="Add license"
                                  isRequired={false}
                                  name="add-license"
                                  items={otherLicenses}
                                  selectClasses={styles.licenseSelector}
                                  onChange={(value) => onSetNewLicenseType(value)}
                                  selectedKey={field.licensesConfig?.mode || 'defaults'}
                                >
                                  {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                                </FormSelect>
                                <Button
                                  type="button"
                                  onPress={onAddCustomLicenseType}
                                  isDisabled={!newLicenseType.trim()}
                                >
                                  Add license type
                                </Button>
                              </div>
                              {field.licensesConfig?.customTypes?.length > 0 && (
                                <ul className={styles.customOutputTypesList}>
                                  {field.licensesConfig.customTypes.map((customType: string, index: number) => (
                                    <li key={index} className={styles.customOutputTypeItem}>
                                      <span>{customType}</span>
                                      <Button
                                        type="button"
                                        className={styles.removeButton}
                                        onPress={() => onRemoveCustomLicenseType(customType)}
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
                  )}
                </div>
              )}
              {index < standardFields.length - 1 && <hr className={styles.fieldDivider} />}
            </div>
          );
        })}
      </div>

      {/* Additional Text Fields Section */}
      <div className={styles.fieldsContainer}>
        <h3>Additional Text Fields</h3>
        <div className={styles.fieldsList}>
          {additionalFields.map((field, index) => {
            return (
              <div key={field.id} className={styles.fieldRowWrapper}>
                <div className={styles.fieldRow}>
                  <Checkbox
                    isSelected={field.enabled}
                    onChange={(isSelected) => onStandardFieldChange(field.id, isSelected)}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <span>{field.customLabel !== undefined && field.customLabel !== '' ? field.customLabel : field.label}</span>
                  </Checkbox>
                  <div className={styles.fieldActions}>
                    <Button
                      type="button"
                      className={`buttonLink link`}
                      onPress={() => onCustomizeField(field.id)}
                    >
                      {expandedFields.includes(field.id) ? "Close" : "Customize"}
                    </Button>

                    <Button
                      type="button"
                      className={`buttonLink link ${styles.deleteButton}`}
                      onPress={() => onDeleteAdditionalField(field.id)}
                      aria-label={`Delete ${field.label}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Expanded panel for Additional Custom Fields */}
                {expandedFields.includes(field.id) && (
                  <div className={styles.customizePanel}>
                    <div className={styles.fieldCustomization}>
                      {/* Field Label */}
                      <FormInput
                        name={`${field.id}_label`}
                        type="text"
                        isRequired={false}
                        label="Field Label"
                        value={field.customLabel !== undefined ? field.customLabel : field.label}
                        onChange={(e) => onUpdateAdditionalField(field.id, 'customLabel', e.currentTarget.value)}
                        helpMessage="The label that will be displayed for this field"
                      />

                      {/* Help Text */}
                      <FormTextArea
                        name={`${field.id}_help`}
                        isRequired={false}
                        richText={false}
                        label="Help Text"
                        value={field.helpText}
                        onChange={(value) => onUpdateAdditionalField(field.id, 'helpText', value)}
                        helpMessage="Optional help text to guide users"
                      />

                      {/* Max Length for text field */}
                      <FormInput
                        name={`${field.id}_maxLength`}
                        type="number"
                        isRequired={false}
                        label="Maximum Length"
                        value={field.maxLength || ''}
                        onChange={(e) => onUpdateAdditionalField(field.id, 'maxLength', e.currentTarget.value)}
                        helpMessage="Maximum number of characters allowed (leave empty for no limit)"
                      />

                      {/* Default Value for the custom field */}
                      <FormInput
                        name={`${field.id}_defaultValue`}
                        type="text"
                        isRequired={false}
                        label="Default Value"
                        value={field.defaultValue}
                        onChange={(e) => onUpdateAdditionalField(field.id, 'defaultValue', e.currentTarget.value)}
                        helpMessage="Default value for this field"
                      />
                    </div>
                  </div>
                )}
                {index < additionalFields.length - 1 && <hr className={styles.fieldDivider} />}
              </div>
            );
          })}
          <div className={styles.additionalFieldsContainer}>
            <Button
              type="button"
              className={styles.addFieldButton}
              onPress={onAddAdditionalField}
            >
              + Add additional field
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchOutputFieldsManager;