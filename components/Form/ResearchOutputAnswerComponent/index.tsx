/* eslint-disable react/prop-types */
'use client'

import React, { useEffect } from 'react';
import {
  Checkbox,
  ListBoxItem
} from "react-aria-components";
import {
  DefaultTextAnswer,
  DefaultTextAreaAnswer,
  DefaultSelectBoxAnswer,
  DefaultCheckboxesAnswer,
  DefaultLicenseSearchAnswer,
  DefaultRepositorySearchAnswer,
  DefaultMetadataStandardSearchAnswer,
  DefaultResearchOutputTableQuestion,
  AnyTableColumnAnswerType,
  LicenseSearchAnswerType
} from '@dmptool/types';
import {
  CheckboxGroupComponent,
  DateComponent,
  FormInput,
  FormSelect,
  FormTextArea,
} from '@/components/Form';
import RepoSelectorForAnswer from '@/components/QuestionAdd/RepoSelectorForAnswer';
import MetaDataStandardsForAnswer from '@/components/QuestionAdd/MetaDataStandardForAnswer';
import TinyMCEEditor from "@/components/TinyMCEEditor";
import {
  StandardField,
  RepositoryInterface,
  MetaDataStandardInterface,
  MetaDataStandardFieldInterface,
  ResearchOutputTable
} from '@/app/types';
import { getCalendarDateValue } from '@/utils/dateUtils';
import styles from './researchOuptutAnswer.module.scss';

export const DEFAULT_ACCESS_LEVELS = [
  {
    label: 'Unrestricted Access',
    value: 'open',
    selected: false
  },
  {
    label: 'Controlled Access',
    value: 'restricted',
    selected: false
  },
  {
    label: 'Other',
    value: 'closed',
    selected: false
  },
];

const getDefaultAnswerForType = (
  type: string,
  schemaVersion: string = "1.0"
): AnyTableColumnAnswerType => {
  switch (type) {
    case "text":
      return { ...DefaultTextAnswer, meta: { schemaVersion } };
    case "textArea":
      return { ...DefaultTextAreaAnswer, meta: { schemaVersion } };
    case "selectBox":
      return { ...DefaultSelectBoxAnswer, meta: { schemaVersion } };
    case "checkBoxes":
      return { ...DefaultCheckboxesAnswer, meta: { schemaVersion } };
    case "repositorySearch":
      return { ...DefaultRepositorySearchAnswer, meta: { schemaVersion } };
    case "metadataStandardSearch":
      return { ...DefaultMetadataStandardSearchAnswer, meta: { schemaVersion } };
    case "licenseSearch":
      return { ...DefaultLicenseSearchAnswer, meta: { schemaVersion } };
    // ... all other types
    default:
      throw new Error(`Unknown column type: ${type}`);
  }
};

type ResearchOutputTableAnswerRow = {
  columns: AnyTableColumnAnswerType[];
};

type ResearchOutputAnswerComponentProps = {
  columns: typeof DefaultResearchOutputTableQuestion['columns'];
  rows: ResearchOutputTable[];
  setRows: (rows: ResearchOutputTable[]) => void;
  onRepositoriesChange: (repos: RepositoryInterface[]) => void;
  onMetaDataStandardsChange: (standards: MetaDataStandardInterface[]) => void;
};

// Helper to get initial answer based on field type
const getInitialAnswerForType = (type: string): any => {
  switch (type) {
    case 'text':
    case 'textArea':
      return '';
    case 'selectBox':
      return '';
    case 'checkBoxes':
      return [];
    case 'repositorySearch':
      return [];
    default:
      return null;
  }
};


const ResearchOutputAnswerComponent = ({
  columns,
  rows,
  setRows,
  onRepositoriesChange,
  onMetaDataStandardsChange
}: ResearchOutputAnswerComponentProps) => {

  const handleCellChange = (colIndex: number, value: any) => {
    const rowIndex = 0;
    const updatedRows = [...rows];
    const colType = columns[colIndex]?.content?.type;
    const schemaVersion = columns[colIndex]?.content?.meta?.schemaVersion || "1.0";

    let newValue = value;

    if (colType === "repositorySearch" && Array.isArray(value)) {
      newValue = value.map(repo => ({
        type: "repositorySearch",
        answer: repo.uri || repo.id, // use the correct field for the URL
        name: repo.name,
        meta: { schemaVersion }
      }));
    }

    // Transform for metadataStandardSearch
    if (colType === "metadataStandardSearch" && Array.isArray(value)) {
      newValue = value.map(std => ({
        metadataStandardId: String(std.id || std.value || std.metadataStandardId),
        metadataStandardName: std.name || std.label || std.metadataStandardName
      }));
    }
    // Ensure the row exists
    if (!updatedRows[rowIndex]) {
      updatedRows[rowIndex] = {
        columns: columns.map(col => {
          const schemaVersion = col.content?.meta?.schemaVersion || "1.0";
          switch (col.content.type) {
            case "text":
              return { type: "text", answer: "", meta: { schemaVersion } };
            case "textArea":
              return { type: "textArea", answer: "", meta: { schemaVersion } };
            case "selectBox":
              return { type: "selectBox", answer: "", meta: { schemaVersion } };
            case "checkBoxes":
              return { type: "checkBoxes", answer: [], meta: { schemaVersion } };
            case "repositorySearch":
              return { type: "repositorySearch", answer: [], meta: { schemaVersion } };
            case "metadataStandardSearch":
              return { type: "metadataStandardSearch", answer: [], meta: { schemaVersion } };
            case "licenseSearch":
              return { type: "licenseSearch", answer: DefaultLicenseSearchAnswer.answer, meta: { schemaVersion } };
            case "date":
              return { type: "date", answer: "", meta: { schemaVersion } };
            case "radioButtons":
              return { type: "radioButtons", answer: "", meta: { schemaVersion } };
            // ...add all other types from AnyTableColumnAnswerType
            default:
              throw new Error(`Unknown column type: ${col.content.type}`);
          }
        })
      };
    }

    // Update the specific column's answer
    updatedRows[rowIndex].columns[colIndex].answer = newValue;
    setRows(updatedRows);
  };

  // Add this function inside your component
  const handleCheckboxChange = (colIndex: number, checked: boolean, value: any, col: any) => {
    let newValue = Array.isArray(value) ? [...value] : [];
    const optionObj = col.content.options[0]?.value; // This is now an object, not a string

    if (checked) {
      // Only add if not already present (deep equality)
      if (!newValue.some((v: any) => JSON.stringify(v) === JSON.stringify(optionObj))) {
        newValue.push(optionObj);
      }
    } else {
      // Remove by deep equality
      newValue = newValue.filter((v: any) => JSON.stringify(v) !== JSON.stringify(optionObj));
    }
    handleCellChange(colIndex, newValue);
  };


  // Initialize rows if empty
  useEffect(() => {
    if (!rows || rows.length === 0) {
      const initialRow: ResearchOutputTableAnswerRow = {
        columns: [
          ...columns.map(col => {
            const schemaVersion = col.content?.meta?.schemaVersion || "1.0";
            return getDefaultAnswerForType(col.content.type, schemaVersion);
          }),
          // Add static fields:
          { type: "date", answer: "", meta: { schemaVersion: "1.0" } }, // for release date
          { type: "numberWithContext", answer: { value: 0, context: 'kb' }, meta: { schemaVersion: "1.0" } } // for byte size
        ]
      };
      setRows([initialRow]);
    }
  }, []);


  // Get current row data
  const currentRow = rows && rows[0];
  const releaseDateColIndex = columns.length;
  const byteSizeColIndex = columns.length + 1;

  // Parse byte size answer
  const byteSizeAnswer = currentRow?.columns[byteSizeColIndex]?.answer || { value: 0, context: 'kb' };

  const isNumberWithContext = (ans: any): ans is { value: number; context: string } =>
    ans && typeof ans === 'object' && 'value' in ans && 'context' in ans;

  const byteSizeValue = isNumberWithContext(byteSizeAnswer) ? byteSizeAnswer.value ?? '' : '';
  const byteSizeUnit = isNumberWithContext(byteSizeAnswer) ? byteSizeAnswer.context : 'kb';


  return (
    <div>
      {columns.map((col, colIndex) => {
        const colKey = col.heading;
        const value = currentRow ? currentRow.columns[colIndex].answer : '';
        const name = col.heading.replace(/\s+/g, '_').toLowerCase();
        switch (col.content.type) {

          case 'text':
            return (
              <div key={col.heading}>
                <FormInput
                  type="text"
                  value={typeof value === "string" || typeof value === "number" ? value : ""}
                  label={col.heading}
                  name={name}
                  helpMessage={col?.content?.attributes?.help || col?.help}
                  maxLength={col.content.attributes?.maxLength}
                  minLength={col.content.attributes?.minLength}
                  onChange={e => handleCellChange(colIndex, e.target.value)}
                />
              </div>
            );

          case 'textArea':
            return (
              <div key={col.heading}>
                <FormTextArea
                  name={name}
                  isRequired={false}
                  richText={true}
                  label={col.heading}
                  helpMessage={col?.content?.attributes?.help || col?.help}
                  value={value as string}
                  onChange={(newContent) => handleCellChange(colIndex, newContent)}
                />
              </div>
            );
          case 'selectBox':
            // Check if this is Initial Access Levels with empty options
            const isAccessLevelsField = col.heading === 'Initial Access Levels';
            const hasNoOptions = !col.content.options || col.content.options.length === 0;

            // Use default access levels if needed, otherwise use provided options
            let options = col.content.options || [];
            if (isAccessLevelsField && hasNoOptions) {
              options = DEFAULT_ACCESS_LEVELS;
            }

            // Transform the options to match FormSelect's expected format
            const selectItems = options.map(option => ({
              id: option.value,
              name: option.label
            }));

            return (
              <div key={col.heading}>
                <FormSelect
                  label={col.heading}
                  ariaLabel={col.heading}
                  isRequired={col.required}
                  name={name}
                  items={selectItems}
                  selectedKey={String(value)}
                  errorMessage={"Make this dynamic? How can we get field level errors"}
                  helpMessage={col.content.attributes?.help || col?.help}
                  onChange={val => handleCellChange(colIndex, val)}
                />
              </div>
            );
          case 'checkBoxes': {
            const options =
              'options' in col.content && Array.isArray(col.content.options)
                ? col.content.options
                : [];

            // The value should be an array of string values (e.g., ['sensitive', 'personal'])
            const selectedValues = Array.isArray(value)
              ? value.map((v: any) => (typeof v === 'string' ? v : v.value))
              : [];


            return (
              <div key={col.heading} className={styles.checkboxGroupContainer}>
                <CheckboxGroupComponent
                  name={name}
                  value={selectedValues}
                  onChange={(values: string[]) => {
                    // ✅ Just pass the string array directly - don't convert to objects
                    handleCellChange(colIndex, values);
                  }}
                  checkboxGroupLabel={col.heading}
                  checkboxGroupDescription={col.help}
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
            );
          }

          case 'repositorySearch':
            const repoField: StandardField = {
              id: `repoSelector_${colIndex}`,
              label: col.heading || 'Repositories',
              enabled: false,
              placeholder: '',
              helpText: col?.content?.attributes?.help || col?.help || '',
              value: '',
              repoConfig: {
                hasCustomRepos: 'preferences' in col && Array.isArray(col.preferences) && col.preferences.length > 0,
                customRepos: [] as RepositoryInterface[],
              }
            };

            // Type guard to check if preferences exist
            const colPreferences = 'preferences' in col ? col.preferences : undefined;

            return (
              <div key={col.heading}>
                <h3 className="h2">{col.heading}</h3>
                <RepoSelectorForAnswer
                  field={repoField}
                  preferences={colPreferences}
                  onRepositoriesChange={(repos) => {
                    handleCellChange(colIndex, repos); // <-- This saves to rows state
                    onRepositoriesChange(repos);
                  }}
                />
              </div>
            )
          case 'metadataStandardSearch':
            const metaDataStandardField: MetaDataStandardFieldInterface = {
              id: `metadataStandardSelector_${colIndex}`,
              label: col.heading || 'Metadata Standards',
              enabled: false,
              helpText: col?.content?.attributes?.help || col?.help || '',
              value: '',
              metaDataConfig: {
                hasCustomStandards: false,
                customStandards: [] as MetaDataStandardInterface[],
              }
            };

            // Type guard to check if preferences exist
            const colStandardsPreferences = 'preferences' in col ? col.preferences : undefined;

            return (
              <div key={col.heading}>
                <h3 className="h2">{col.heading}</h3>
                <MetaDataStandardsForAnswer
                  field={metaDataStandardField}
                  preferences={colStandardsPreferences}
                  onMetaDataStandardsChange={(stds) => {
                    handleCellChange(colIndex, stds); // <-- This saves to rows state
                    onMetaDataStandardsChange(stds);
                  }}
                />
              </div>
            )

          case 'licenseSearch':

            const licenseAnswer = value as LicenseSearchAnswerType['answer'];

            // Type guard to check if preferences exist
            const colLicensesPreferences = 'preferences' in col ? col.preferences : undefined;
            const licensesItems = colLicensesPreferences?.map(option => ({
              id: option.value,
              name: option.label
            }));

            const selectedLicense =
              licenseAnswer.length > 0 && licenseAnswer[0]?.licenseId
                ? licenseAnswer[0].licenseId
                : '';
            return (
              <div key={col.heading}>
                <FormSelect
                  label={col.heading}
                  ariaLabel={col.heading}
                  isRequired={col.required}
                  name={name}
                  selectedKey={selectedLicense}
                  items={colLicensesPreferences && colLicensesPreferences.length > 0 ? licensesItems : []}
                  helpMessage={col.content.attributes?.help || col?.help}
                  onChange={val => {
                    const selected = licensesItems?.find(item => item.id === val);
                    // Map to the expected object shape
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
            currentRow?.columns[releaseDateColIndex]?.answer || ''
          )}
          onChange={(newDate) => {
            handleCellChange(releaseDateColIndex, newDate);
          }}
          label="Anticipated Release Date"
        />
      </div>


      {/* Always include Byte Size - not configurable */}
      <div key="byte-size" className={styles.fileSizeRow}>
        <FormInput
          label="Anticipated file size"
          name="research_output_file_size"
          type="number"
          isRequired={false}
          value={byteSizeValue}
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
          ariaLabel="File size unit"
          isRequired={false}
          label="Unit"
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
    </div>
  );
};


export default ResearchOutputAnswerComponent;
