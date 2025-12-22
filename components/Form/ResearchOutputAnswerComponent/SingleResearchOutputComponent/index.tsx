/* eslint-disable react/prop-types */
'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import {
  Checkbox,
  ListBoxItem,
  Button
} from "react-aria-components";
import {
  DefaultResearchOutputTableQuestion,
  LicenseSearchAnswerType
} from '@dmptool/types';

//GraphQL
import {
  ResearchOutputTable
} from '@/app/types';
import {
  useRecommendedLicensesQuery,
  useDefaultResearchOutputTypesQuery,
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
import { defaultAccessLevels, getDefaultAnswerForType } from '@/utils/researchOutputTable';
import { getCalendarDateValue } from '@/utils/dateUtils';
import styles from '../researchOutputAnswer.module.scss';

type ResearchOutputAnswerComponentProps = {
  columns: typeof DefaultResearchOutputTableQuestion['columns'];
  rows: ResearchOutputTable[];
  setRows: React.Dispatch<React.SetStateAction<ResearchOutputTable[]>>;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  showButtons?: boolean;
  isNewEntry?: boolean; // Determines if this is a new entry or editing existing
};


const SingleResearchOutputComponent = ({
  columns,
  rows,
  setRows,
  onSave,
  onCancel,
  onDelete,
  showButtons = false,
  isNewEntry = false,
}: ResearchOutputAnswerComponentProps) => {

  const textAreaFirstUpdate = useRef<{ [key: number]: boolean }>({});
  const initializedRef = useRef(false);
  // For form errors
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Add state for field-level errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  // Localization
  const Global = useTranslations('Global');


  // Query request for recommended licenses
  const { data: recommendedLicensesData } = useRecommendedLicensesQuery({
    variables: { recommended: true },
  });

  // Query request for default research output types
  const { data: defaultResearchOutputTypesData } = useDefaultResearchOutputTypesQuery();


  // Helper function to get translated label
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


  // Validate a single field
  const validateField = (colIndex: number, value: any): string => {
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

    if (!currentRow) return false;

    // Validate each column
    columns.forEach((col, colIndex) => {
      const value = currentRow.columns[colIndex]?.answer;
      const error = validateField(colIndex, value);

      if (error) {
        newErrors[`col-${colIndex}`] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    // Scroll to errors if validation fails
    if (!isValid && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        // scroll to top of this form + 20px offset
        const formWrapper = document.querySelector('.research-output-form');
        if (formWrapper) {
          const elementPosition = formWrapper.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 100;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }

  const handleCellChange = (colIndex: number, value: any) => {
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

      if (colType === REPOSITORY_SEARCH_ID && Array.isArray(value)) {
        newValue = value.map(repo => ({
          repositoryId: repo.uri || repo.id,
          repositoryName: repo.name
        }));
      }

      if (colType === METADATA_STANDARD_SEARCH_ID && Array.isArray(value)) {
        newValue = value.map(std => ({
          metadataStandardId: String(std.id || std.value || std.metadataStandardId),
          metadataStandardName: std.name || std.label || std.metadataStandardName
        }));
      }

      if (
        colIndex === columns.length + 1 &&
        value &&
        typeof value === "object"
      ) {
        newValue =
          value.value !== undefined && value.value !== ""
            ? `${value.value} ${value.context}`
            : "";
      }

      updatedRow.columns[colIndex].answer = newValue;
      updatedRows[0] = updatedRow;

      return updatedRows;
    });
  };


  useEffect(() => {
    if (!initializedRef.current && rows.length === 0) {
      const initializedColumns = columns.map((col) => {
        const schemaVersion = col.content?.meta?.schemaVersion || "1.0";

        if (col.content.type === REPOSITORY_SEARCH_ID) {
          const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
          if (colRepoPreferences && colRepoPreferences.length > 0) {
            const defaultAnswer = getDefaultAnswerForType(REPOSITORY_SEARCH_ID, schemaVersion);
            return {
              ...defaultAnswer,
              answer: colRepoPreferences.map((pref: any) => ({
                repositoryId: pref.value,
                repositoryName: pref.label
              }))
            } as typeof defaultAnswer;
          }
        }

        if (col.content.type === METADATA_STANDARD_SEARCH_ID) {
          const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
          if (colStdPreferences && colStdPreferences.length > 0) {
            const defaultAnswer = getDefaultAnswerForType(METADATA_STANDARD_SEARCH_ID, schemaVersion);
            return {
              ...defaultAnswer,
              answer: colStdPreferences.map((pref: any) => ({
                metadataStandardId: String(pref.value),
                metadataStandardName: pref.label
              }))
            } as typeof defaultAnswer;
          }
        }

        return getDefaultAnswerForType(col.content.type, schemaVersion);
      });

      setRows([{
        columns: [
          ...initializedColumns,
          getDefaultAnswerForType("date", "1.0"),
          getDefaultAnswerForType("numberWithContext", "1.0")
        ]
      }]);

      initializedRef.current = true;
    }
  }, []);

  const currentRow = rows && rows[0];
  const releaseDateColIndex = columns.length;
  const byteSizeColIndex = columns.length + 1;

  const byteSizeAnswer = currentRow?.columns[byteSizeColIndex]?.answer || '';
  const { value: byteSizeValue, context: byteSizeUnit } = parseByteSizeAnswer(
    typeof byteSizeAnswer === 'string' ? byteSizeAnswer : ''
  );

  return (
    <div className="research-output-form">
      <ErrorMessages errors={errors} noScroll={true} ref={errorRef} />
      {columns.map((col, colIndex) => {
        const value = currentRow ? currentRow.columns[colIndex].answer : '';
        const name = col.heading.replace(/\s+/g, '_').toLowerCase();
        const fieldError = errors[`col-${colIndex}`];
        const translatedLabel = getTranslatedLabel(col);
        switch (col.content.type) {
          case TEXT_FIELD_QUESTION_TYPE:
            return (
              <div key={col.heading}>
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
              <div key={col.heading}>
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
              <div key={col.heading}>
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
              <div key={col.heading}>
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
              colHelp = Global('helpText.dataFlags'); //Translate for dataFlags

              allOptions =
                'options' in col.content && Array.isArray(col.content.options)
                  ? col.content.options.map(opt => ({
                    ...opt,
                    // Translate option labels
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

            const selectedValues = Array.isArray(value)
              ? value.map((v: any) => {
                return (typeof v === 'string' ? v : v.value);
              })
              : [];


            return (
              options.length > 0 && (
                <div key={col.heading} className={styles.checkboxGroupContainer}>
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

            const existingRepos = Array.isArray(value)
              ? value.map((repo: any) => ({
                id: repo.repositoryId,
                uri: repo.repositoryId,
                name: repo.repositoryName
              }))
              : ((colRepoPreferences && colRepoPreferences.length > 0)
                ? colRepoPreferences.map((pref: any) => ({
                  id: pref.value,
                  uri: pref.value,
                  name: pref.label
                }))
                : []);

            return (
              <div key={col.heading}>
                <h3 className={`${styles.customHeading} h2`}>{translatedLabel}</h3>
                {repoHelpText && (
                  <p className={styles.helpText}>{repoHelpText}</p>
                )}

                <RepoSelectorForAnswer
                  value={existingRepos}
                  onRepositoriesChange={(repos) => {
                    handleCellChange(colIndex, repos);
                  }}
                />
              </div>
            );
          case METADATA_STANDARD_SEARCH_ID:
            const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
            const stdHelpText = col?.content?.attributes?.help || col?.help;

            const existingMetaDataStandards = Array.isArray(value)
              ? value
                .filter((std: any) => std.metadataStandardId && std.metadataStandardName)//Filter out values with no data
                .map((std: any) => ({
                  id: std.metadataStandardId,
                  name: std.metadataStandardName,
                  uri: std.metadataStandardId
                }))
              : ((colStdPreferences && colStdPreferences.length > 0)
                ? colStdPreferences
                  .filter((pref: any) => pref.value && pref.label) //filter out items with no data
                  .map((pref: any) => ({
                    id: pref.value,
                    name: pref.label,
                    uri: pref.value
                  }))
                : []);

            return (
              <div key={col.heading}>
                <h3 className={`${styles.customHeading} h2`}>{translatedLabel}</h3>
                {stdHelpText && (
                  <p className={styles.helpText}>{stdHelpText}</p>
                )}
                <MetaDataStandardsForAnswer
                  value={existingMetaDataStandards}
                  onMetaDataStandardsChange={(stds) => {
                    handleCellChange(colIndex, stds);
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
              <div key={col.heading}>
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
              value: e.target.value === '' ? undefined : Number(e.target.value),
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
              value: byteSizeValue,
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
          {(isNewEntry && onCancel) ? (
            <>
              <Button
                className="secondary"
                onPress={onCancel}
              >
                {Global('buttons.cancel')}
              </Button>
            </>
          ) : (
            <Button
              className="secondary"
              onPress={onDelete}
            >
              {Global('buttons.delete')}
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