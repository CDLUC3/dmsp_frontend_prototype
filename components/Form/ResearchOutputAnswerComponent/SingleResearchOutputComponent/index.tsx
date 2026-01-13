'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import {
  Checkbox,
  ListBoxItem,
  Button
} from "react-aria-components";
import {
  ResearchOutputTableQuestionType,
  AnyTableColumnAnswerType,
  LicenseSearchAnswerType,
  MetadataStandardSearchAnswerType
} from '@dmptool/types';

//GraphQL
import { useQuery } from '@apollo/client/react';
import {
  RepoPreference,
  ResearchOutputTable
} from '@/app/types';
import {
  RecommendedLicensesDocument,
  DefaultResearchOutputTypesDocument,
} from '@/generated/graphql';

//Components
import {
  CheckboxGroupComponent,
  DateComponent,
  FormInput,
  FormSelect,
  FormTextArea,
} from '@/components/Form';
import RepoSelectorForAnswer from '@/components/RepoSelectorForAnswer';
import MetaDataStandardsForAnswer from '@/components/MetaDataStandardForAnswer';
import ErrorMessages from "@/components/ErrorMessages";
import { useScrollToElement } from '../hooks/useScrollToElement';

// Utils and other
import {
  RADIOBUTTONS_QUESTION_TYPE,
  CHECKBOXES_QUESTION_TYPE,
  SELECTBOX_QUESTION_TYPE,
  TEXT_FIELD_QUESTION_TYPE,
  TEXT_AREA_QUESTION_TYPE,
  REPOSITORY_SEARCH_ID,
  METADATA_STANDARD_SEARCH_ID,
  LICENSE_SEARCH_ID,
} from '@/lib/constants';
import { defaultAccessLevels } from '@/utils/researchOutputTable';
import { getCalendarDateValue } from '@/utils/dateUtils';
import styles from '../researchOutputAnswer.module.scss';

type ResearchOutputAnswerComponentProps = {
  columns: ResearchOutputTableQuestionType['columns'];
  rows: ResearchOutputTable[];
  setRows: React.Dispatch<React.SetStateAction<ResearchOutputTable[]>>;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  showButtons?: boolean;
  isNewEntry?: boolean; // Determines if this is a new entry or editing existing
  hasOtherRows?: boolean; // Indicates if there are other rows in the list so we know whether to show back to list button
};

// Use the answer type directly from @dmptool/types
type ValueType = AnyTableColumnAnswerType['answer'];

const SingleResearchOutputComponent = ({
  columns,
  rows,
  setRows,
  onSave,
  onCancel,
  showButtons = false,
  isNewEntry = false,
  hasOtherRows = false
}: ResearchOutputAnswerComponentProps) => {

  const textAreaFirstUpdate = useRef<{ [key: number]: boolean }>({});
  // Track initial state for comparison
  const initialRowsRef = useRef<string | null>(null);

  // For form errors
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Track refs for each field to enable scrolling to invalid fields
  const fieldRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const firstInvalidFieldRef = useRef<HTMLElement | null>(null);

  // Add state for field-level errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Localization
  const Global = useTranslations('Global');

  // Scroll utility
  const scrollToElement = useScrollToElement();

  // GraphQL Queries
  const { data: recommendedLicensesData } = useQuery(RecommendedLicensesDocument, {
    variables: { recommended: true },
  });

  const { data: defaultResearchOutputTypesData } = useQuery(DefaultResearchOutputTypesDocument);

  // Helper function to get translated label from column
  const getTranslatedLabel = (col: typeof columns[0]): string => {
    const translationKey = col.content.attributes?.labelTranslationKey;
    if (translationKey) {
      // Try to get translation
      try {
        return Global(translationKey);
      } catch {
        // Fall back to heading if translation not found
        return col.heading;
      }
    }

    // No translation key, use heading
    return col.heading;
  };


  // Validate form field
  const validateField = (colIndex: number, value: ValueType): string => {
    const col = columns[colIndex];
    let error = "";

    if (col.required) {
      // Check if the field is empty based on its type
      if (col.content.type === TEXT_FIELD_QUESTION_TYPE || col.content.type === TEXT_AREA_QUESTION_TYPE) {
        if (!value || (typeof value === 'string' && !value.trim())) {
          error = Global('messaging.errors.requiredField', { field: col.heading });
        }
      } else if (col.content.type === SELECTBOX_QUESTION_TYPE) {
        if (!value || value === '') {
          error = Global('messaging.errors.requiredField', { field: col.heading });
        }
      } else if (col.content.type === CHECKBOXES_QUESTION_TYPE) {
        if (!Array.isArray(value) || value.length === 0) {
          error = Global('messaging.errors.requiredField', { field: col.heading });
        }
      } else if (col.content.type === REPOSITORY_SEARCH_ID || col.content.type === METADATA_STANDARD_SEARCH_ID) {
        if (!Array.isArray(value) || value.length === 0) {
          error = Global('messaging.errors.requiredField', { field: col.heading });
        }
      } else if (col.content.type === LICENSE_SEARCH_ID) {
        if (!Array.isArray(value) || value.length === 0) {
          error = Global('messaging.errors.requiredField', { field: col.heading });
        }
      }
    }

    return error;
  };

  // Validate all fields
  const isFormValid = (): boolean => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};
    let firstInvalidKey: string | null = null;

    if (!currentRow) return false;

    // Validate each column
    columns.forEach((col, colIndex) => {
      const value = currentRow.columns[colIndex]?.answer;
      const error = validateField(colIndex, value);

      if (error) {
        const errorKey = `col-${colIndex}`;
        newErrors[errorKey] = error;
        isValid = false;
        // Track the first invalid field for scrolling
        if (!firstInvalidKey) {
          firstInvalidKey = errorKey;
        }
      }
    });

    setErrors(newErrors);

    // Set the first invalid field ref for scrolling
    if (!isValid && firstInvalidKey && fieldRefs.current[firstInvalidKey]) {
      firstInvalidFieldRef.current = fieldRefs.current[firstInvalidKey];
    } else {
      firstInvalidFieldRef.current = null;
    }

    return isValid;
  };

  // Clear error for a specific field
  const clearFieldError = (colIndex: number) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`col-${colIndex}`];
      return newErrors;
    });
  };

  // Clear all errors
  const clearErrors = () => {
    setErrors({});
  };

  function parseByteSizeAnswer(answer: string) {
    if (typeof answer !== 'string') return { value: '', context: 'kb' };
    const match = answer.match(/^(\d+)\s*(\w+)$/);
    if (match) {
      return { value: match[1], context: match[2] };
    }
    return { value: '', context: 'kb' };
  }

  // Handle Save/Update button click
  const handleOnSave = async () => {

    clearErrors();

    if (isFormValid()) {
      if (onSave) {
        onSave();
        // Clear unsaved changes flag and update baseline
        setHasUnsavedChanges(false);
        initialRowsRef.current = JSON.stringify(rows);

        scrollToElement('.research-output-form');
      }
    }
  }

  // Handle cancel with unsaved changes warning
  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      const confirmMessage = Global('messaging.unsavedChangesWarning') || 'You have unsaved changes. Are you sure you want to leave?';
      const confirmLeave = confirm(confirmMessage);
      if (!confirmLeave) return;
    }

    if (onCancel) {
      setHasUnsavedChanges(false); // Clear flag
      onCancel();
      scrollToElement('.research-output-form');
    }
  };

  // Handle cell change - change to any field in the answer row
  /*eslnt-disable @typescript-eslint/no-explicit-any */
  const handleCellChange = (colIndex: number, value: ValueType) => {
    // Clear error for this field
    clearFieldError(colIndex);

    setRows(prevRows => {
      if (!prevRows || prevRows.length === 0) {
        return prevRows;
      }

      const updatedRows = [...prevRows];
      const updatedRow = { ...updatedRows[0] };
      updatedRow.columns = [...updatedRow.columns];
      updatedRow.columns[colIndex] = { ...updatedRow.columns[colIndex] };

      const colType =
        colIndex < columns.length ? columns[colIndex]?.content?.type : null;

      let newValue = value;

      // Type guard for repository search
      if (colType === REPOSITORY_SEARCH_ID && Array.isArray(value)) {
        // Handle empty array (all repos removed)
        if (value.length === 0) {
          newValue = [];
        } else {
          const isRepoArray = typeof value[0] === 'object' &&
            value[0] !== null &&
            ('repositoryId' in value[0] || 'uri' in value[0]);

          if (isRepoArray) {
            // Define extended type that includes all fields we want to preserve
            type ExtendedRepoItem = {
              repositoryId?: string;
              repositoryName?: string;
              repositoryWebsite?: string;
              repositoryDescription?: string;
              repositoryKeywords?: string[];
              repositoryType?: string[];
              uri?: string;
              name?: string;
            };

            // Save all repository data to preserve website, description, keywords
            newValue = (value as ExtendedRepoItem[]).map((repo) => ({
              repositoryId: repo.repositoryId || repo.uri || '',
              repositoryName: repo.repositoryName || repo.name || '',
              repositoryWebsite: repo.repositoryWebsite || '',
              repositoryDescription: repo.repositoryDescription || '',
              repositoryKeywords: repo.repositoryKeywords || [],
              repositoryType: repo.repositoryType || []
            }));
          }
        }
      }

      // Type guard for metadata standard search
      if (colType === METADATA_STANDARD_SEARCH_ID && Array.isArray(value)) {
        // Handle empty array (all standards removed)
        if (value.length === 0) {
          newValue = [];
        } else {
          const isMetadataArray = typeof value[0] === 'object' &&
            value[0] !== null &&
            ('metadataStandardId' in value[0] || 'id' in value[0]);

          if (isMetadataArray) {
            // Extract the array item type from the MetadataStandardSearchAnswerType
            type MetadataItem = MetadataStandardSearchAnswerType['answer'][number];

            newValue = (value as MetadataItem[]).map((std) => ({
              metadataStandardId: std.metadataStandardId,
              metadataStandardName: std.metadataStandardName
            }));
          }
        }
      }

      // Handle byte size (file size with unit)
      if (
        colIndex === columns.length + 1 &&
        value &&
        typeof value === "object" &&
        'value' in value &&
        'context' in value
      ) {
        newValue =
          value.value !== undefined && value.value !== 0
            ? `${value.value} ${value.context}`
            : "";
      }

      updatedRow.columns[colIndex].answer = newValue;
      updatedRows[0] = updatedRow;


      return updatedRows;
    });
  };

  // Capture initial state when component mounts or rows first populate
  useEffect(() => {
    if (rows.length > 0 && !initialRowsRef.current) {
      initialRowsRef.current = JSON.stringify(rows);
    }
  }, [rows.length]);

  // Detect changes to rows
  useEffect(() => {
    if (!initialRowsRef.current || rows.length === 0) return;

    const currentState = JSON.stringify(rows);
    const hasChanges = currentState !== initialRowsRef.current;
    setHasUnsavedChanges(hasChanges);
  }, [rows]);

  const currentRow = rows && rows[0];
  const releaseDateColIndex = columns.length;
  const byteSizeColIndex = columns.length + 1;

  const byteSizeAnswer = currentRow?.columns[byteSizeColIndex]?.answer || '';
  const { value: byteSizeValue, context: byteSizeUnit } = parseByteSizeAnswer(
    typeof byteSizeAnswer === 'string' ? byteSizeAnswer : ''
  );

  return (
    <div className="research-output-form">
      <ErrorMessages
        errors={Object.values(errors)}
        ref={errorRef}
        firstInvalidFieldRef={firstInvalidFieldRef}
      />
      {columns.map((col, colIndex) => {
        const value = currentRow ? currentRow.columns[colIndex].answer : '';
        const name = col.heading.replace(/\s+/g, '_').toLowerCase();
        const fieldError = errors[`col-${colIndex}`];
        const translatedLabel = getTranslatedLabel(col);
        switch (col.content.type) {
          case TEXT_FIELD_QUESTION_TYPE:
            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <FormInput
                  type="text"
                  value={typeof value === "string" || typeof value === "number" ? value : ""}
                  label={translatedLabel}
                  name={name}
                  isRequired={col.required}
                  isInvalid={!!fieldError}
                  errorMessage={fieldError ?? ""}
                  helpMessage={col?.content?.attributes?.help || col?.help}
                  maxLength={col.content.attributes?.maxLength}
                  minLength={col.content.attributes?.minLength}
                  onChange={e => {
                    handleCellChange(colIndex, e.target.value)
                  }}
                />
              </div>
            );

          case TEXT_AREA_QUESTION_TYPE:
            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <FormTextArea
                  name={name}
                  isRequired={col.required}
                  isInvalid={!!fieldError}
                  errorMessage={fieldError ?? ""}
                  richText={true}
                  label={translatedLabel}
                  helpMessage={col?.content?.attributes?.help || col?.help}
                  value={value as string}
                  onChange={(newContent) => {
                    if (!textAreaFirstUpdate.current[colIndex]) {
                      textAreaFirstUpdate.current[colIndex] = true;
                      return;
                    }
                    handleCellChange(colIndex, newContent);
                  }}
                />
              </div>
            );
          case SELECTBOX_QUESTION_TYPE:
            const isOutputTypeField = col.heading === 'Output Type';
            const hasNoOptions = !col.content.options || col.content.options.length === 0;

            let selectItems: { id: string; name: string }[] = [];
            if (isOutputTypeField && hasNoOptions && defaultResearchOutputTypesData?.defaultResearchOutputTypes) {
              selectItems = defaultResearchOutputTypesData.defaultResearchOutputTypes
                .filter((type): type is NonNullable<typeof type> => type !== null)
                .map((type) => ({
                  id: type.value,
                  name: type.name
                }));
            } else {
              const options = col.content.options || [];
              selectItems = options.map(option => ({
                id: option.value,
                name: option.label
              }));
            }

            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <FormSelect
                  label={translatedLabel}
                  ariaLabel={translatedLabel}
                  isRequired={col.required}
                  name={name}
                  items={selectItems}
                  selectedKey={String(value)}
                  isInvalid={!!fieldError}
                  errorMessage={fieldError}
                  helpMessage={col.content.attributes?.help || col?.help}
                  onChange={val => handleCellChange(colIndex, val)}
                />
              </div>
            );

          case RADIOBUTTONS_QUESTION_TYPE:
            const isAccessLevelsField = col.heading === 'Initial Access Levels';
            const hasNoRadioOptions = !col.content.options || col.content.options.length === 0;

            let selectRadioItems: { id: string; name: string }[] = [];
            if (isAccessLevelsField && hasNoRadioOptions) {
              const options = defaultAccessLevels;
              selectRadioItems = options.map(option => ({
                id: option.value,
                name: option.label
              }));
            }

            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <FormSelect
                  label={translatedLabel}
                  ariaLabel={translatedLabel}
                  isRequired={col.required}
                  name={name}
                  items={selectRadioItems}
                  selectedKey={String(value)}
                  isInvalid={!!fieldError}
                  errorMessage={fieldError}
                  helpMessage={col.content.attributes?.help || col?.help}
                  onChange={val => handleCellChange(colIndex, val)}
                />
              </div>
            );

          case CHECKBOXES_QUESTION_TYPE: {
            const isDataFlags = col.heading === "Data Flags";
            let colHelp = col.help;

            let allOptions: { value: string; label: string; checked?: boolean }[] = [];

            if (isDataFlags) {
              colHelp = Global('helpText.dataFlags');

              allOptions =
                'options' in col.content && Array.isArray(col.content.options)
                  ? col.content.options.map(opt => ({
                    ...opt,
                    label: opt.value === 'sensitive'
                      ? Global('labels.mayContainSensitiveData')
                      : opt.value === 'personal'
                        ? Global('labels.mayContainPersonalData')
                        : opt.label
                  }))
                  : [];
            } else {
              allOptions =
                'options' in col.content && Array.isArray(col.content.options)
                  ? col.content.options
                  : [];
            }

            // Filter to only show checked options if this is Data Flags
            const options = isDataFlags
              ? allOptions.filter(opt => opt.checked === true)
              : allOptions;

            // Type guard to ensure value is a string array for checkboxes
            const selectedValues: string[] = Array.isArray(value) && value.every(v => typeof v === 'string')
              ? value as string[]
              : [];

            return (
              options.length > 0 && (
                <div
                  key={col.heading}
                  className={styles.checkboxGroupContainer}
                  ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
                >
                  <CheckboxGroupComponent
                    name={name}
                    value={selectedValues}
                    isRequired={col.required}
                    onChange={(values: string[]) => {
                      handleCellChange(colIndex, values);
                    }}
                    checkboxGroupLabel={translatedLabel}
                    checkboxGroupDescription={colHelp}
                  >
                    {options.map(opt => (
                      <Checkbox key={opt.value} value={opt.value}>
                        <div className="checkbox">
                          <svg viewBox="0 0 18 18" aria-hidden="true">
                            <polyline points="1 9 7 14 15 4" />
                          </svg>
                        </div>
                        {opt.label}
                      </Checkbox>
                    ))}
                  </CheckboxGroupComponent>
                </div>
              )
            );
          }

          case REPOSITORY_SEARCH_ID:
            const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
            const repoHelpText = col?.content?.attributes?.help || col?.help;

            // Check if we have an explicit answer (even if empty) vs no answer at all
            const hasExplicitRepoAnswer = Array.isArray(value);

            // Type guard for repository answer
            type RepoAnswer = {
              repositoryId: string;
              repositoryName: string;
              repositoryWebsite?: string;
              repositoryDescription?: string;
              repositoryKeywords?: string[];
              repositoryType?: string[];
            };
            const repoValue = (Array.isArray(value) && value.length > 0 &&
              typeof value[0] === 'object' &&
              'repositoryId' in value[0])
              ? value as RepoAnswer[]
              : [];

            // Build a preferences lookup map for enriching answer data
            const preferencesMap = new Map<string, RepoPreference>();
            if (colRepoPreferences && Array.isArray(colRepoPreferences)) {
              colRepoPreferences.forEach((pref) => {
                const typedPref = pref as RepoPreference;
                if (typedPref.value) {
                  preferencesMap.set(typedPref.value, typedPref);
                }
              });
            }

            const existingRepos = hasExplicitRepoAnswer
              ? (repoValue.length > 0
                ? repoValue.map((repo) => {
                  // Try to enrich from preferences if available
                  const prefData = preferencesMap.get(repo.repositoryId);
                  return {
                    id: repo.repositoryId,
                    uri: repo.repositoryId,
                    name: repo.repositoryName,
                    website: repo.repositoryWebsite || prefData?.website || '',
                    description: repo.repositoryDescription || prefData?.description || '',
                    keywords: repo.repositoryKeywords || prefData?.keywords || [],
                    repositoryType: repo.repositoryType || prefData?.repositoryType || []
                  };
                })
                : [])  // User explicitly removed all items - show empty
              : ((colRepoPreferences && colRepoPreferences.length > 0)
                ? colRepoPreferences.map((pref) => {
                  const typedPref = pref as RepoPreference;
                  return {
                    id: typedPref.value,
                    uri: typedPref.value,
                    name: typedPref.label,
                    website: typedPref.website || '',
                    description: typedPref.description || '',
                    keywords: typedPref.keywords || [],
                    repositoryType: typedPref.repositoryType || []
                  };
                })
                : []);  // No answer yet - show preferences

            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <h3 className={`${styles.customHeading} h2`}>{translatedLabel}</h3>
                {repoHelpText && (
                  <p className={styles.helpText}>{repoHelpText}</p>
                )}

                <RepoSelectorForAnswer
                  value={existingRepos}
                  onRepositoriesChange={(repos) => {
                    // Transform RepositoryInterface[] to the answer format
                    // Save all repository data to preserve it across selections
                    const repoAnswers = repos.map(repo => ({
                      repositoryId: repo.uri,
                      repositoryName: repo.name,
                      repositoryWebsite: repo.website,
                      repositoryDescription: repo.description,
                      repositoryKeywords: repo.keywords,
                      repositoryType: repo.repositoryType
                    }));
                    handleCellChange(colIndex, repoAnswers);
                  }}
                />
              </div>
            );
          case METADATA_STANDARD_SEARCH_ID:
            const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
            const stdHelpText = col?.content?.attributes?.help || col?.help;

            // Check if we have an explicit answer (even if empty) vs no answer at all
            const hasExplicitStdAnswer = Array.isArray(value);

            // Type guard for metadata standard answer
            type MetadataStdAnswer = { metadataStandardId: string; metadataStandardName: string };
            const metadataValue = (Array.isArray(value) && value.length > 0 &&
              typeof value[0] === 'object' &&
              'metadataStandardId' in value[0])
              ? value as MetadataStdAnswer[]
              : [];

            const existingMetaDataStandards = hasExplicitStdAnswer
              ? (metadataValue.length > 0
                ? metadataValue
                  .filter((std): std is MetadataStdAnswer =>
                    !!std.metadataStandardId && !!std.metadataStandardName
                  )
                  .map((std) => ({
                    id: std.metadataStandardId,
                    name: std.metadataStandardName,
                    uri: std.metadataStandardId
                  }))
                : [])  // User explicitly removed all items - show empty
              : ((colStdPreferences && colStdPreferences.length > 0)
                ? colStdPreferences
                  .filter((pref: { value?: string; label?: string }): pref is { value: string; label: string } =>
                    !!pref.value && !!pref.label
                  )
                  .map((pref) => ({
                    id: pref.value,
                    name: pref.label,
                    uri: pref.value
                  }))
                : []);  // No answer yet - show preferences

            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <h3 className={`${styles.customHeading} h2`}>{translatedLabel}</h3>
                {stdHelpText && (
                  <p className={styles.helpText}>{stdHelpText}</p>
                )}
                <MetaDataStandardsForAnswer
                  value={existingMetaDataStandards}
                  onMetaDataStandardsChange={(stds) => {
                    // Transform to the answer format (assuming MetaDataStandardsForAnswer returns a similar interface)
                    const stdAnswers = stds.map(std => ({
                      metadataStandardId: String(std.uri || std.id),
                      metadataStandardName: std.name
                    }));
                    handleCellChange(colIndex, stdAnswers);
                  }}
                />
              </div>
            )

          case LICENSE_SEARCH_ID:
            const licenseAnswer = value as LicenseSearchAnswerType['answer'];
            const colLicensesPreferences = 'preferences' in col ? col.preferences : undefined;

            // Use preferences if available, otherwise fall back to recommended licenses
            let licensesItems: { id: string; name: string }[] = [];

            if (colLicensesPreferences && colLicensesPreferences.length > 0) {
              licensesItems = colLicensesPreferences.map(option => ({
                id: option.value,
                name: option.label
              }));
            } else if (recommendedLicensesData?.recommendedLicenses) {
              // Fall back to recommended licenses
              licensesItems = recommendedLicensesData.recommendedLicenses
                .filter((license): license is NonNullable<typeof license> => license !== null)
                .map((license) => ({
                  id: license.uri,
                  name: license.name
                }));
            }

            const selectedLicense =
              licenseAnswer.length > 0 && licenseAnswer[0]?.licenseId
                ? licenseAnswer[0].licenseId
                : '';

            return (
              <div
                key={col.heading}
                ref={(el) => { fieldRefs.current[`col-${colIndex}`] = el; }}
              >
                <FormSelect
                  label={translatedLabel}
                  ariaLabel={translatedLabel}
                  isRequired={col.required}
                  isInvalid={!!fieldError}
                  errorMessage={fieldError}
                  name={name}
                  selectedKey={selectedLicense}
                  items={(licensesItems.length > 0 ? licensesItems : [])}
                  helpMessage={col.content.attributes?.help || col?.help}
                  onChange={val => {
                    const selected = licensesItems?.find(item => item.id === val);
                    const licenseObj = selected
                      ? { licenseId: selected.id, licenseName: selected.name }
                      : null;
                    handleCellChange(colIndex, licenseObj ? [licenseObj] : []);
                  }}
                />
              </div>
            );
        }
      })}

      {/* Always include Anticipated Release Date - not configurable */}
      <div key="anticipated-release-date">
        <DateComponent
          name="startDate"
          value={getCalendarDateValue(
            typeof currentRow?.columns[releaseDateColIndex]?.answer === 'string'
              ? currentRow?.columns[releaseDateColIndex]?.answer
              : ''
          )}
          onChange={(newDate) => {
            const dateString = newDate ? newDate.toString() : '';
            handleCellChange(releaseDateColIndex, dateString);
          }}
          label={Global('labels.anticipatedReleaseDate')}
        />
      </div>


      {/* Always include Byte Size - not configurable */}
      <div key="byte-size" className={styles.fileSizeRow}>
        <FormInput
          label={Global('labels.anticipatedFileSize')}
          name="research_output_file_size"
          type="number"
          isRequired={false}
          value={byteSizeValue}
          min={0}
          onChange={(e) => {
            handleCellChange(byteSizeColIndex, {
              value: e.target.value === '' ? 0 : Number(e.target.value),
              context: byteSizeUnit
            });

          }}
          maxLength={10}
        />

        <FormSelect
          name="research_output_file_size_unit"
          ariaLabel={Global('labels.fileSizeUnit')}
          isRequired={false}
          label={Global('labels.unit')}
          items={[
            { id: 'bytes', name: 'bytes' },
            { id: 'kb', name: 'KB' },
            { id: 'mb', name: 'MB' },
            { id: 'gb', name: 'GB' },
            { id: 'tb', name: 'TB' },
            { id: 'pb', name: 'PB' }
          ]}
          selectClasses={styles.fileSizeSelect}
          selectedKey={byteSizeUnit}
          onChange={(val) => {
            handleCellChange(byteSizeColIndex, {
              value: byteSizeValue === '' ? 0 : Number(byteSizeValue),
              context: val
            });
          }}
        >
          {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
        </FormSelect>
      </div>

      {/* Show Save/Update and Cancel buttons if showButtons is true */}
      {showButtons && (
        <div className={styles.btnContainer}>
          {(!isNewEntry || hasOtherRows) && onCancel && (
            <Button
              className={`${styles.editBtn} small secondary`}
              onPress={handleCancelClick}
            >
              &lt; {Global('buttons.backToList')}
            </Button>
          )}
          <Button
            className="primary"
            onPress={handleOnSave}
          >
            {isNewEntry ? Global('buttons.save') : Global('buttons.update')}
          </Button>

        </div>
      )}
    </div>
  );
};


export default React.memo(SingleResearchOutputComponent);