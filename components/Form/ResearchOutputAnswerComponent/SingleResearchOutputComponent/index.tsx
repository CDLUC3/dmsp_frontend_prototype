/* eslint-disable react/prop-types */
'use client'

import React, { useEffect, useRef } from 'react';
import {
  Checkbox,
  ListBoxItem,
  Button
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
import RepoSelectorForAnswer from '@/components/QuestionAdd/RepoSelectorForAnswer';
import MetaDataStandardsForAnswer from '@/components/QuestionAdd/MetaDataStandardForAnswer';
import {
  ResearchOutputTable
} from '@/app/types';

// Utils
import { DEFAULT_ACCESS_LEVELS, getDefaultAnswerForType } from '@/utils/researchOutputTable';
import { getCalendarDateValue } from '@/utils/dateUtils';
import styles from '../researchOuptutAnswer.module.scss';

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
  }, []);

  const currentRow = rows && rows[0];
  const releaseDateColIndex = columns.length;
  const byteSizeColIndex = columns.length + 1;

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
            const isAccessLevelsField = col.heading === 'Initial Access Levels';
            const hasNoOptions = !col.content.options || col.content.options.length === 0;

            let options = col.content.options || [];
            if (isAccessLevelsField && hasNoOptions) {
              options = DEFAULT_ACCESS_LEVELS;
            }

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

            const selectedValues = Array.isArray(value)
              ? value.map((v: any) => (typeof v === 'string' ? v : v.value))
              : [];


            return (
              <div key={col.heading} className={styles.checkboxGroupContainer}>
                <CheckboxGroupComponent
                  name={name}
                  value={selectedValues}
                  onChange={(values: string[]) => {
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
            const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
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
            const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;

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
                    handleCellChange(colIndex, stds);
                  }}
                />
              </div>
            )

          case 'licenseSearch':

            const licenseAnswer = value as LicenseSearchAnswerType['answer'];

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

      {/* Show Save/Update and Cancel buttons if showButtons is true */}
      {showButtons && (
        <div className={styles.btnContainer}>
          <Button
            className="secondary"
            onPress={onCancel}
          >
            Delete
          </Button>
          <Button
            className="primary"
            onPress={onSave}
          >
            {isNewEntry ? 'Save' : 'Update'}
          </Button>
        </div>
      )}
    </div>
  );
};


export default SingleResearchOutputComponent;