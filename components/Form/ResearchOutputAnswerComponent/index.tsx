/* eslint-disable react/prop-types */
'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "react-aria-components";
import {
  CURRENT_SCHEMA_VERSION,
  DefaultResearchOutputTableQuestion
} from '@dmptool/types';
import { useTranslations } from "next-intl";

import {
  ResearchOutputTable
} from '@/app/types';

import {
  REPOSITORY_SEARCH_ID,
  METADATA_STANDARD_SEARCH_ID,
} from '@/lib/constants';

import SingleResearchOutputComponent from './SingleResearchOutputComponent';
import { getDefaultAnswerForType } from '@/utils/researchOutputTable';
import styles from './researchOutputAnswer.module.scss';

type ResearchOutputAnswerComponentProps = {
  columns: typeof DefaultResearchOutputTableQuestion['columns'];
  rows: ResearchOutputTable[];
  setRows: React.Dispatch<React.SetStateAction<ResearchOutputTable[]>>;
  columnHeadings?: string[];
  onSave?: () => Promise<void>; // Callback to trigger parent save
};

const ResearchOutputAnswerComponent = ({
  columns,
  rows,
  setRows,
  columnHeadings = [],// Will use column headings to find title, type and repository type to display in list view
  onSave,
}: ResearchOutputAnswerComponentProps) => {

  // To track that the page was rendered once
  const hasInitialized = useRef(false);

  // State to track which row is being edited (null means showing list view)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  // State to track if we're adding a new entry
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Localization
  const Global = useTranslations('Global');
  const t = useTranslations('QuestionEdit');

  // Helper function to get title from a row based on columnHeadings
  const getRowTitle = (row: ResearchOutputTable): string => {
    // Find the index of "Title" in columnHeadings
    const titleIndex = columnHeadings.findIndex(heading =>
      heading.toLowerCase() === 'title'
    );

    if (titleIndex !== -1 && row.columns[titleIndex]) {
      const titleAnswer = row.columns[titleIndex].answer;
      if (typeof titleAnswer === 'string' && titleAnswer.trim()) {
        return titleAnswer;
      }
    }

    // Fallback: try to find first text field with content
    const firstTextColumn = row.columns.find(col =>
      (col.type === 'text' || col.type === 'textArea') &&
      typeof col.answer === 'string' &&
      col.answer.trim()
    );

    if (firstTextColumn?.answer && typeof firstTextColumn.answer === 'string') {
      // If it's HTML, strip tags for display
      const stripped = firstTextColumn.answer.replace(/<[^>]*>/g, '');
      return stripped.substring(0, 50) + (stripped.length > 50 ? '...' : '');
    }

    return 'Untitled Research Output';
  };

  // Helper to get Output Type from columnHeadings
  const getRowOutputType = (row: ResearchOutputTable): string => {
    const outputTypeIndex = columnHeadings.findIndex(
      heading => heading.toLowerCase() === 'output type'
    );
    if (
      row.columns[outputTypeIndex] &&
      typeof row.columns[outputTypeIndex].answer === 'string'
    ) {
      return row.columns[outputTypeIndex].answer;
    }
    return '';
  };

  // Helper to get selected repositories from columnHeadings
  const getRowRepositories = (row: ResearchOutputTable): string[] => {
    const repoIndex = columnHeadings.findIndex(
      heading => heading.toLowerCase() === 'repositories'
    );
    if (
      row.columns[repoIndex] &&
      Array.isArray(row.columns[repoIndex].answer)
    ) {
      // Each repo: { repositoryId, repositoryName }
      return row.columns[repoIndex].answer.map(
        (repo: any) => repo.repositoryName
      );
    }
    return [];
  };

  // Create an empty research output row to add a new output
  const createEmptyRow = (): ResearchOutputTable => {
    return {
      columns: [
        ...columns.map(col => {
          const schemaVersion = col.content?.meta?.schemaVersion || CURRENT_SCHEMA_VERSION;
          const baseAnswer = getDefaultAnswerForType(col.content.type, schemaVersion);

          // Handle repositorySearch with preferences
          if (col.content.type === REPOSITORY_SEARCH_ID) {
            const colRepoPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
            if (colRepoPreferences && colRepoPreferences.length > 0) {
              return {
                type: "repositorySearch" as const,
                meta: baseAnswer.meta,
                answer: colRepoPreferences.map((pref: any) => ({
                  repositoryId: pref.value,
                  repositoryName: pref.label
                }))
              };
            }
          }

          // Handle metadataStandardSearch with preferences
          if (col.content.type === METADATA_STANDARD_SEARCH_ID) {
            const colStdPreferences = 'preferences' in col && Array.isArray(col.preferences) ? col.preferences : undefined;
            if (colStdPreferences && colStdPreferences.length > 0) {
              return {
                type: "metadataStandardSearch" as const,
                meta: baseAnswer.meta,
                answer: colStdPreferences.map((pref: any) => ({
                  metadataStandardId: String(pref.value),
                  metadataStandardName: pref.label
                }))
              };
            }
          }

          return baseAnswer;
        }),
        getDefaultAnswerForType("date", "1.0"),
        getDefaultAnswerForType("numberWithContext", "1.0")
      ]
    };
  };

  // Handle adding a new research output
  const handleAddNew = () => {
    const emptyRow = createEmptyRow();
    setRows(prev => [...prev, emptyRow]);
    setEditingRowIndex(rows.length); // Edit the newly created row
    setIsAddingNew(true); // Mark as adding new
  };

  // Handle edit button click
  const handleEdit = (index: number) => {
    setEditingRowIndex(index);
    setIsAddingNew(false); // Mark as editing existing
  };

  // Handle delete
  const handleDelete = async (index: number) => {
    const msg = t('messages.areYouSureYouWantToDelete');
    if (confirm(msg)) {
      setRows(prev => prev.filter((_, i) => i !== index));
      // If we were editing this row, go back to list view
      if (editingRowIndex === index) {
        setEditingRowIndex(null);
      }
    }
    // Trigger parent page save if onSave callback exists
    if (onSave) {
      await onSave();
      // scroll to top of this form + 20px offset
      const formWrapper = document.querySelector('.ro-form-wrapper');
      if (formWrapper) {
        const elementPosition = formWrapper.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 100;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Handle done editing
  const handleDoneEditing = async () => {
    setEditingRowIndex(null);
    setIsAddingNew(false);

    // Trigger parent page save if onSave callback exists
    if (onSave) {
      await onSave();
    }
  };

  // Handle cancel (go back to list view, and if it was a new empty row, remove it)
  const handleCancel = () => {
    if (editingRowIndex !== null) {
      const editedRow = rows[editingRowIndex];
      // Check if this is an empty row (all answers are empty/default)
      const isEmpty = editedRow.columns.every(col => {
        const answer = col.answer;
        if (typeof answer === 'string') return !answer.trim();
        if (typeof answer === 'number') return answer === 0;
        if (Array.isArray(answer)) return answer.length === 0;
        if (typeof answer === 'object' && answer !== null) {
          // Check for objects like { value: 0, context: 'kb' }
          return Object.values(answer).every(v => !v || v === 0 || v === 'kb');
        }
        return true;
      });

      if (isEmpty || isAddingNew) {
        // Remove the empty row or new row that was cancelled
        setRows(prev => prev.filter((_, i) => i !== editingRowIndex));
      }
    }
    setEditingRowIndex(null);
    setIsAddingNew(false);
  };

  // Automatically show form when there are no rows (i.e., first time adding an answer)
  useEffect(() => {
    // Skip if already initialized
    if (hasInitialized.current) return;

    // If rows already exist (data loaded), just mark as initialized
    if (rows.length > 0) {
      hasInitialized.current = true;
      return;
    }

    // Wait briefly for async data to load before deciding to show form
    const timer = setTimeout(() => {
      if (!hasInitialized.current && rows.length === 0 && editingRowIndex === null) {
        hasInitialized.current = true;
        handleAddNew();
      }
    }, 50); // Small delay to let data load

    return () => clearTimeout(timer);
  }, [rows.length, editingRowIndex]);

  // If editing a specific row, show the single form
  if (editingRowIndex !== null) {
    // Create a subset of rows with just the one being edited
    const editingRows = [rows[editingRowIndex]];

    return (
      <div className={styles.singleEditView}>
        <div className={styles.btnContainer}>
          <h3 className="h3">
            {isAddingNew ? t('headings.addResearchOutput') : t('headings.editResearchOutput')}
          </h3>
          {/* Only show cancel button when editing existing */}
          {!isAddingNew && (
            <Button
              className="secondary small"
              onPress={handleCancel}
            >
              &lt; {Global('buttons.backToList')}
            </Button>
          )}
        </div>

        <SingleResearchOutputComponent
          columns={columns}
          rows={editingRows}
          setRows={(updateFn) => {
            setRows(prevRows => {
              const newRows = [...prevRows];
              // Apply the update function to just the editing row
              const updatedEditingRows = typeof updateFn === 'function'
                ? updateFn([newRows[editingRowIndex]])
                : updateFn;

              if (updatedEditingRows.length > 0) {
                newRows[editingRowIndex] = updatedEditingRows[0];
              }
              return newRows;
            });
          }}
          showButtons={true}
          onSave={handleDoneEditing}
          onDelete={() => handleDelete(editingRowIndex!)}
          isNewEntry={isAddingNew}
        />
      </div>
    );
  }

  // Show list view
  return (
    <div className={`${styles.listView} ro-form-wrapper`}>
      <div className={styles.listHeader}>
        <Button
          className="primary small"
          onPress={handleAddNew}
        >
          + {t('buttons.addOutput')}
        </Button>
      </div>

      <ul className={styles.outputList}>
        {rows.map((row, index) => {
          // Set the title, output type and repository for display based on our mapping to columnHeadings
          const title = getRowTitle(row);
          const outputType = getRowOutputType(row);
          const repositories = getRowRepositories(row);

          return (
            <li key={index} className={styles.outputItem}>
              <div className={styles.outputTitle}>
                <h4 className={styles.outputTitleText}>{title}</h4>

                {(outputType || repositories.length > 0) && (
                  <dl className={styles.dList}>
                    {outputType && (
                      <>
                        <dt>{t('definitions.type')}:</dt>
                        <dd className={styles.outputType}>{outputType}</dd>
                      </>
                    )}
                    {repositories.length > 0 && (
                      <>
                        <dt>{t('definitions.repository')}:</dt>
                        <dd>{repositories[0]}</dd>
                      </>
                    )}
                  </dl>
                )}
              </div>

              <div className={styles.outputActions}>
                <Button
                  className="secondary small"
                  onPress={() => handleEdit(index)}
                >
                  {Global('buttons.edit')}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

    </div>
  );
};

export default ResearchOutputAnswerComponent;
