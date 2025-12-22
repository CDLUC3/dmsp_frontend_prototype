/* eslint-disable react/prop-types */
'use client'

import React, { useEffect, useRef } from 'react';
import {
  Checkbox,
  ListBoxItem
} from "react-aria-components";
import {
  DefaultResearchOutputTableQuestion,
  LicenseSearchAnswerType
} from '@dmptool/types';
import {
  CheckboxGroupComponent,
  DateComponent,
  FormInput,
  FormSelect,
  FormTextArea,
} from '@/components/Form';
import RepoSelectorForAnswer from '@/components/RepoSelectorForAnswer';
import MetaDataStandardsForAnswer from '@/components/MetaDataStandardForAnswer';
import {
  ResearchOutputTable
} from '@/app/types';

// Utils
import { defaultAccessLevels, getDefaultAnswerForType } from '@/utils/researchOutputTable';
import { getCalendarDateValue } from '@/utils/dateUtils';
import styles from './researchOutputAnswer.module.scss';

type ResearchOutputAnswerComponentProps = {
  columns: typeof DefaultResearchOutputTableQuestion['columns'];
  rows: ResearchOutputTable[];
  setRows: React.Dispatch<React.SetStateAction<ResearchOutputTable[]>>;
};


const ResearchOutputAnswerComponent = ({
  columns,
  rows,
  setRows,
}: ResearchOutputAnswerComponentProps) => {


  const textAreaFirstUpdate = useRef<{ [key: number]: boolean }>({}); // To track first updates for text area since setContent is called during initialization and calling handleCelLChange prematurely
  const initializedRef = useRef(false);


  function parseByteSizeAnswer(answer: string) {
    if (typeof answer !== 'string') return { value: '', context: 'kb' };
    const match = answer.match(/^(\d+)\s*(\w+)$/);
    if (match) {
      return { value: match[1], context: match[2] };
    }
    return { value: '', context: 'kb' };
  }

  const handleCellChange = (colIndex: number, value: any) => {
    setRows(prevRows => {
      // If rows haven't been initialized yet, just return prevRows
      if (!prevRows || prevRows.length === 0) {
        return prevRows;
      }

      // Make a shallow copy of the rows array
      const updatedRows = [...prevRows];

      // Make a copy of the first row
      const updatedRow = { ...updatedRows[0] };

      // Make a copy of the columns array
      updatedRow.columns = [...updatedRow.columns];

      // Make a copy of the specific column we're updating
      updatedRow.columns[colIndex] = { ...updatedRow.columns[colIndex] };

      const colType =
        colIndex < columns.length ? columns[colIndex]?.content?.type : null;

      let newValue = value;

      if (colType === "repositorySearch" && Array.isArray(value)) {
        newValue = value.map(repo => ({
          repositoryId: repo.uri || repo.id,
          repositoryName: repo.name
        }));
      }

      if (colType === "metadataStandardSearch" && Array.isArray(value)) {
        newValue = value.map(std => ({
          metadataStandardId: String(std.id || std.value || std.metadataStandardId),
          metadataStandardName: std.name || std.label || std.metadataStandardName
        }));
      }

      // byte size
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

      // Update only the specific cell
      updatedRow.columns[colIndex].answer = newValue;

      // Put the updated row back
      updatedRows[0] = updatedRow;
      return updatedRows;
    });
  };


  // Initialize rows ONCE on mount
  useEffect(() => {
    if (!initializedRef.current && rows.length === 0) {
      const initializedColumns = columns.map((col) => {
        const schemaVersion = col.content?.meta?.schemaVersion || "1.0";

        // Handle repositorySearch with preferences
        if (col.content.type === "repositorySearch") {
          const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
          if (colRepoPreferences && colRepoPreferences.length > 0) {
            const defaultAnswer = getDefaultAnswerForType("repositorySearch", schemaVersion);
            return {
              ...defaultAnswer,
              answer: colRepoPreferences.map((pref: any) => ({
                repositoryId: pref.value,
                repositoryName: pref.label
              }))
            } as typeof defaultAnswer;
          }
        }

        // Handle metadataStandardSearch with preferences
        if (col.content.type === "metadataStandardSearch") {
          const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
          if (colStdPreferences && colStdPreferences.length > 0) {
            const defaultAnswer = getDefaultAnswerForType("metadataStandardSearch", schemaVersion);
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
  }, []); // Only run once on mount
  // Get current row data
  const currentRow = rows && rows[0];
  const releaseDateColIndex = columns.length;
  const byteSizeColIndex = columns.length + 1;

  // Parse byte size answer so it will be in correct format for rendering
  const byteSizeAnswer = currentRow?.columns[byteSizeColIndex]?.answer || '';
  const { value: byteSizeValue, context: byteSizeUnit } = parseByteSizeAnswer(
    typeof byteSizeAnswer === 'string' ? byteSizeAnswer : ''
  );


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
                  onChange={e => {
                    handleCellChange(colIndex, e.target.value)
                  }}
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
                  onChange={(newContent) => {
                    // Skip the first onChange call during TinyMCE initialization
                    if (!textAreaFirstUpdate.current[colIndex]) {
                      textAreaFirstUpdate.current[colIndex] = true;
                      return;
                    }
                    handleCellChange(colIndex, newContent);
                  }}
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
              options = defaultAccessLevels;
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
            // Type guard to check if preferences exist
            const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
            // Get existing repository data and transform it to the format RepoSelectorForAnswer expects
            const existingRepos = Array.isArray(value) && value.length > 0
              ? value.map((repo: any) => ({
                id: repo.repositoryId,
                uri: repo.repositoryId,
                name: repo.repositoryName
              }))
              : (colRepoPreferences
                ? colRepoPreferences.map((pref: any) => ({
                  id: pref.value,
                  uri: pref.value,
                  name: pref.label
                }))
                : []);

            return (
              <div key={col.heading}>
                <h3 className="h2">{col.heading}</h3>
                <RepoSelectorForAnswer
                  value={existingRepos}
                  onRepositoriesChange={(repos) => {
                    handleCellChange(colIndex, repos);
                  }}
                />
              </div>
            );
          case 'metadataStandardSearch':
            // 
            const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;

            // Get existing metadata standards data and transform to the format MetaDataStandardsForAnswer expects
            const existingMetaDataStandards = Array.isArray(value)
              ? value.map((std: any) => ({
                id: std.metadataStandardId,
                name: std.metadataStandardName,
                uri: std.metadataStandardId
              }))
              : (colStdPreferences
                ? colStdPreferences.map((pref: any) => ({
                  id: pref.value,
                  name: pref.label,
                  uri: pref.value
                }))
                : []);

            return (
              <div key={col.heading}>
                <h3 className="h2">{col.heading}</h3>
                <MetaDataStandardsForAnswer
                  value={existingMetaDataStandards}
                  onMetaDataStandardsChange={(stds) => {
                    handleCellChange(colIndex, stds); // <-- This saves to rows state
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
          value={getCalendarDateValue( //ensure that only a string is passed to getCalendarDateValue
            typeof currentRow?.columns[releaseDateColIndex]?.answer === 'string'
              ? currentRow?.columns[releaseDateColIndex]?.answer
              : ''
          )}
          onChange={(newDate) => {
            // Convert CalendarDate to ISO string
            const dateString = newDate ? newDate.toString() : '';
            handleCellChange(releaseDateColIndex, dateString);
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
