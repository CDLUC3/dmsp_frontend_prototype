/* eslint-disable react/prop-types */
'use client'

import { useTranslations } from 'next-intl';
import {
  StandardField,
  OutputTypeInterface,
  RepositoryInterface,
  MetaDataStandardInterface,
  MetaDataConfig,
  AdditionalFieldsType
} from '@/app/types';
import { DefaultResearchOutputTypesQuery, LicensesQuery } from '@/generated/graphql';
import styles from './researchOutput.module.scss';

interface ResearchOutputReadOnlyProps {
  standardFields: StandardField[];
  additionalFields: AdditionalFieldsType[];
  defaultResearchOutputTypesData?: DefaultResearchOutputTypesQuery;
  licensesData?: LicensesQuery;
}

// Type guard function to check if a field has metaDataConfig
const hasMetaDataConfig = (field: StandardField): field is StandardField & { metaDataConfig: MetaDataConfig } => {
  return field.metaDataConfig !== undefined;
};

const ResearchOutputDisplay: React.FC<ResearchOutputReadOnlyProps> = ({
  standardFields,
  additionalFields,
  defaultResearchOutputTypesData,
  licensesData,
}) => {
  const Global = useTranslations('Global');
  const QuestionAdd = useTranslations('QuestionAdd');

  return (
    <>
      <div className={styles.fieldsContainer}>
        <h3>{QuestionAdd('researchOutput.headings.enableStandardFields')}</h3>

        <p className={styles.fieldsDescription}>
          {QuestionAdd('researchOutput.description')}
        </p>

        <div className={styles.fieldsList}>
          {standardFields.map((field) => {
            const isRequired = field.id === 'title' || field.id === 'outputType';

            return (
              <div key={field.id} className={styles.fieldRowWrapper}>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldStatus}>
                    <span className={styles.statusIndicator}>
                      {field.enabled ? '✓' : '○'}
                    </span>
                    <span className={field.enabled ? styles.enabledField : styles.disabledField}>
                      {field.label}
                    </span>
                    {isRequired && (
                      <span className={styles.requiredBadge}>
                        {QuestionAdd('researchOutput.tooltip.requiredFields')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Display field details if enabled */}
                {field.enabled && (
                  <div className={styles.fieldDetails}>

                    {/** Description */}
                    {field.id === 'description' && field.helpText && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          {QuestionAdd('labels.helpText', { fieldName: QuestionAdd('researchOutput.labels.description') })}:
                        </span>
                        <span className={styles.detailValue}>{field.helpText}</span>
                      </div>
                    )}

                    {/** Data Flags Configuration */}
                    {field.id === 'dataFlags' && field.content && field.content.type === 'checkBoxes' && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>
                          {QuestionAdd('researchOutput.legends.dataFlag')}:
                        </span>
                        <ul className={styles.optionsList}>
                          {field.content.options
                            .filter(option => option.selected)
                            .map((option, index) => (
                              <li key={`${option.value}-${index}`}>{option.label}</li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/** Output Type Configuration */}
                    {field.id === 'outputType' && field.outputTypeConfig && (
                      <>
                        {/* Show configuration mode */}
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Configuration Mode:</span>
                          <span className={styles.detailValue}>
                            {field.outputTypeConfig.mode === 'mine'
                              ? QuestionAdd('researchOutput.labels.customOutputTypes')
                              : QuestionAdd('researchOutput.labels.defaultOutputTypes')}
                          </span>
                        </div>

                        {/* Show available options */}
                        {field.outputTypeConfig.mode === 'mine' && field.outputTypeConfig.customTypes && field.outputTypeConfig.customTypes.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Custom Output Types:</span>
                            <ul className={styles.optionsList}>
                              {field.outputTypeConfig.customTypes.map((type, index) => (
                                <li key={`${type.type}-${index}`}>{type.type}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {field.outputTypeConfig.mode === 'defaults' && field.outputTypeConfig.selectedDefaults && field.outputTypeConfig.selectedDefaults.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Selected Default Types:</span>
                            <ul className={styles.optionsList}>
                              {field.outputTypeConfig.selectedDefaults.map((typeId, index) => (
                                <li key={`${typeId}-${index}`}>{typeId}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {field.helpText && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              {QuestionAdd('labels.helpText', { fieldName: field.label })}:
                            </span>
                            <span className={styles.detailValue}>{field.helpText}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/** Repository Selector */}
                    {field.id === 'repoSelector' && field.repoConfig && (
                      <>
                        {/* Show toggle state */}
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Custom Repositories:</span>
                          <span className={styles.detailValue}>
                            {field.repoConfig.hasCustomRepos ? 'Yes' : 'No'}
                          </span>
                        </div>

                        {/* Show repositories if enabled */}
                        {field.repoConfig.hasCustomRepos && field.repoConfig.customRepos && field.repoConfig.customRepos.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Configured Repositories:</span>
                            <ul className={styles.optionsList}>
                              {field.repoConfig.customRepos.map((repo, index) => (
                                <li key={repo.id || index}>
                                  <strong>{repo.name}</strong>
                                  {repo.uri && (
                                    <>
                                      <br />
                                      <span className={styles.repoUrl}>{repo.uri}</span>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {field.helpText && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              {QuestionAdd('labels.helpText', { fieldName: field.label })}:
                            </span>
                            <span className={styles.detailValue}>{field.helpText}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/** Metadata Standards */}
                    {field.id === 'metadataStandards' && hasMetaDataConfig(field) && (
                      <>
                        {/* Show toggle state */}
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Custom Metadata Standards:</span>
                          <span className={styles.detailValue}>
                            {field.metaDataConfig.hasCustomStandards ? 'Yes' : 'No'}
                          </span>
                        </div>

                        {/* Show standards if enabled */}
                        {field.metaDataConfig.hasCustomStandards && field.metaDataConfig.customStandards && field.metaDataConfig.customStandards.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Configured Standards:</span>
                            <ul className={styles.optionsList}>
                              {field.metaDataConfig.customStandards.map((standard, index) => (
                                <li key={standard.id || index}>
                                  <strong>{standard.name}</strong>
                                  {standard.uri && (
                                    <>
                                      <br />
                                      <span className={styles.repoUrl}>{standard.uri}</span>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {field.helpText && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              {QuestionAdd('labels.helpText', { fieldName: field.label })}:
                            </span>
                            <span className={styles.detailValue}>{field.helpText}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/**License configurations */}
                    {field.id === 'licenses' && field.licensesConfig && (
                      <>
                        {/* Show configuration mode */}
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Configuration Mode:</span>
                          <span className={styles.detailValue}>
                            {field.licensesConfig.mode === 'addToDefaults'
                              ? QuestionAdd('researchOutput.labels.customLicenses')
                              : QuestionAdd('researchOutput.labels.defaultLicenses')}
                          </span>
                        </div>

                        {/* Show custom licenses if mode is addToDefaults */}
                        {field.licensesConfig.mode === 'addToDefaults' && field.licensesConfig.customTypes && field.licensesConfig.customTypes.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Custom Licenses:</span>
                            <ul className={styles.optionsList}>
                              {field.licensesConfig.customTypes.map((license, index) => (
                                <li key={`${license.uri}-${index}`}>{license.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* Show selected defaults */}
                        {field.licensesConfig.selectedDefaults && field.licensesConfig.selectedDefaults.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Selected Default Licenses:</span>
                            <ul className={styles.optionsList}>
                              {field.licensesConfig.selectedDefaults.map((licenseId, index) => (
                                <li key={`${licenseId}-${index}`}>{licenseId}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {field.helpText && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              {QuestionAdd('labels.helpText', { fieldName: field.label })}:
                            </span>
                            <span className={styles.detailValue}>{field.helpText}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/**Access level configurations */}
                    {field.id === 'accessLevels' && field.accessLevelsConfig && (
                      <>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Configuration Mode:</span>
                          <span className={styles.detailValue}>
                            {field.accessLevelsConfig.mode === 'mine' ? 'Custom Access Levels' : 'Default Access Levels'}
                          </span>
                        </div>
                        {field.accessLevelsConfig.mode === 'mine' && field.accessLevelsConfig.customLevels && field.accessLevelsConfig.customLevels.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Custom Access Levels:</span>
                            <ul className={styles.optionsList}>
                              {field.accessLevelsConfig.customLevels.map((level, index) => (
                                <li key={`${level.value}-${index}`}>{level.label}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {field.accessLevelsConfig.selectedDefaults && field.accessLevelsConfig.selectedDefaults.length > 0 && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>Selected Defaults:</span>
                            <ul className={styles.optionsList}>
                              {field.accessLevelsConfig.selectedDefaults.map((level, index) => (
                                <li key={`${level}-${index}`}>{level}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {field.helpText && (
                          <div className={styles.detailItem}>
                            <span className={styles.detailLabel}>
                              {QuestionAdd('labels.helpText', { fieldName: field.label })}:
                            </span>
                            <span className={styles.detailValue}>{field.helpText}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Fields Section */}
        {additionalFields.length > 0 && (
          <div className={styles.fieldsContainer}>
            <h3>{QuestionAdd('researchOutput.headings.additionalTextFields')}</h3>
            <div className={styles.fieldsList}>
              {additionalFields.map((field) => (
                <div key={field.id} className={styles.fieldRowWrapper}>
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldStatus}>
                      <span className={styles.statusIndicator}>
                        {field.enabled ? '✓' : '○'}
                      </span>
                      <span className={field.enabled ? styles.enabledField : styles.disabledField}>
                        {field.heading}
                      </span>
                    </div>
                  </div>

                  {/* Display additional field details if enabled */}
                  {field.enabled && (
                    <div className={styles.fieldDetails}>
                      {field.heading && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {QuestionAdd('researchOutput.additionalFields.fieldLabel.label')}:
                          </span>
                          <span className={styles.detailValue}>{field.heading}</span>
                        </div>
                      )}

                      {field.content?.attributes?.help && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {QuestionAdd('labels.helpText', { fieldName: field.heading })}:
                          </span>
                          <span className={styles.detailValue}>{field.content.attributes.help}</span>
                        </div>
                      )}

                      {field.content?.attributes?.maxLength && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {QuestionAdd('researchOutput.additionalFields.maxLength.label')}:
                          </span>
                          <span className={styles.detailValue}>{field.content.attributes.maxLength}</span>
                        </div>
                      )}

                      {field.content?.attributes?.defaultValue && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {QuestionAdd('researchOutput.additionalFields.defaultValue.label')}:
                          </span>
                          <span className={styles.detailValue}>{field.content.attributes.defaultValue}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResearchOutputDisplay;