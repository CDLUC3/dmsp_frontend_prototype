/* eslint-disable react/prop-types */

'use client'

import { useState } from "react";
import { Checkbox, } from "react-aria-components";

import FormInput from '@/components/Form/FormInput';
import { useTranslations } from 'next-intl';
import { Question } from '@/app/types';
import styles from './optionsComponent.module.scss';


interface Row {
  id?: number | null;
  text: string;
  isSelected?: boolean | null;
}

interface QuestionOptionsComponentProps {
  rows: Row[] | null;
  setRows: (rows: Row[]) => void;
  questionJSON?: string;
  formSubmitted?: boolean;
  setFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}


/**This component is used to add question type fields that use options
 * For example, radio buttons, check boxes and select drop-downs
 */
const QuestionOptionsComponent: React.FC<QuestionOptionsComponentProps> = ({ rows, setRows, questionJSON, formSubmitted, setFormSubmitted }) => {
  const [announcement, setAnnouncement] = useState<string>("");
  const parsedQuestionJSON = (typeof questionJSON === 'string') ? JSON.parse(questionJSON) : questionJSON || {};
  const Global = useTranslations('Global');
  const QuestionOptions = useTranslations('QuestionOptionsComponent');

  // Add options row
  const addRow = () => {
    if (rows) {
      // Either calculate next order number off of last orderNumber, if present, or just use the row.length to increment
      const length = rows.length;
      const nextNum = (length + 1);

      const newRow = {
        id: nextNum, //if rows already has a set value, then increment from there
        text: "",
        isSelected: false,
      };

      setRows([...rows, newRow]);
      setAnnouncement(QuestionOptions('announcements.rowAdded', { nextNum }));
      setFormSubmitted(false);
    }
  };

  // Delete options row
  const deleteRow = (id: number) => {
    if (id && id !== 0) {
      const updatedRows = rows?.filter(row => row.id !== id);
      setRows(updatedRows || []);
      setAnnouncement(QuestionOptions('announcements.rowRemoved', { id }));
    }
  };


  const toggleSelection = (id: number) => {
    if (!rows) return;

    const updatedRows = rows.map(row =>
      row.id === id
        ? { ...row, isSelected: !row.isSelected }
        : row
    );

    setRows(updatedRows); // this calls updateRows()
  };

  const setDefault = (id: number) => {
    if (!rows) return;

    // allow multiple selections for checkboxes or multiSelect
    if (parsedQuestionJSON.type === 'checkBoxes' || parsedQuestionJSON.attributes?.multiple === true) {
      toggleSelection(id);
    } else {
      const updatedRows = rows.map(row => ({
        ...row,
        isSelected: row.id === id, // only one selected
      }));

      setRows(updatedRows);
      setAnnouncement(QuestionOptions('announcements.rowDefault', { id }));
    }
  };

  // Update rows state
  const handleChange = (id: number | string | null, field: string, value: string | number) => {
    if (!rows) return;

    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });

    setRows(updatedRows);
  };

  return (
    <>
      <div className={styles.tableContainer}>
        {rows && rows.map((row, index) => (
          <div key={row.id} className={styles.row} role="group">
            {/**Let screenreader know which row they are on */}
            <span id={`row-label-${row.id}`} className='hidden-accessibly'>
              {QuestionOptions('messages.rowInfo', { number: index + 1 })}
            </span>

            <div className={styles.cell}>
              <FormInput
                id={`order-${row.id}`}
                name="orderNumber"
                type="text"
                disabled={true}
                isRequired={true}
                label={QuestionOptions('labels.order')}
                value={(index + 1).toString()}
                placeholder={QuestionOptions('placeholder.orderNumber')}
                ariaLabel={index === 0 ? undefined : "Order"}
              />
            </div>
            <div className={styles.cell}>
              <FormInput
                id={`text-${row.id}`}
                name="text"
                type="text"
                isRequired={true}
                label={QuestionOptions('labels.text')}
                labelClasses={styles.textFieldLabel}
                value={row.text}
                onChange={(e) => handleChange(row.id ?? null, "text", e.target.value)}
                placeholder={QuestionOptions('placeholder.text')}
                ariaLabel={index === 0 ? undefined : "Text"}
                isInvalid={!row.text && formSubmitted}
                errorMessage="Text field is required"
              />
            </div>
            <div className={`${styles.cell} ${styles.default}`}>
              <label htmlFor={`default-${row.id}`}>{QuestionOptions('labels.default')}</label>
              <Checkbox
                id={`default-${row.id}`}
                data-testid={`default-${row.id}`}
                aria-checked={row.isSelected}
                aria-label={`Set row ${index + 1} as default`}
                onChange={() => setDefault(row.id || 0)}
                className={`${styles.optionsCheckbox} react-aria-Checkbox`}
                isSelected={row.isSelected ? row.isSelected : false}
              >
                <div className={`${styles.checkBox} checkbox`}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
              </Checkbox>
            </div>
            <div className={styles.remove}>
              <button
                type="button"
                onClick={() => deleteRow(row.id || 0)}
                aria-label={QuestionOptions('buttons.deleteRow', { count: index + 1 })}
                className={`${styles.deleteButton} react-aria-Button secondary`}
              >
                {Global('buttons.remove')}
              </button>
              {/**Screen readers will announce when a new row was added */}
              <p aria-live="polite" className='hidden-accessibly'>
                {rows.length > 0 ? QuestionOptions('messages.successAddingRow', { number: rows.length }) : ""}
              </p>

            </div>
          </div >
        )
        )}

        <button type="button" onClick={addRow} aria-live="polite">
          {QuestionOptions('buttons.addRow')}
        </button>
      </div>
      {/** Hidden live region for screen readers */}
      <p aria-live="polite" className="hidden-accessibly">
        {announcement}
      </p>

    </>
  );
}

export default QuestionOptionsComponent;
