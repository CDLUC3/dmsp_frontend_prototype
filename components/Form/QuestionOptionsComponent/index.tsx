/* eslint-disable react/prop-types */

'use client'

import { useState, useEffect } from "react";
import { Checkbox, } from "react-aria-components";

import FormInput from '@/components/Form/FormInput';
import { useTranslations } from 'next-intl';
import styles from './optionsComponent.module.scss';


interface Row {
  id?: number | null;
  text: string;
  isDefault?: boolean | null;
}

interface QuestionOptionsComponentProps {
  rows: Row[] | null;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  questionId?: number;
  formSubmitted?: boolean;
  setFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}


/**This component is used to add question type fields that use options
 * For example, radio buttons, check boxes and select drop-downs
 */
const QuestionOptionsComponent: React.FC<QuestionOptionsComponentProps> = ({ rows, setRows, formSubmitted, setFormSubmitted }) => {
  const [announcement, setAnnouncement] = useState<string>("");

  // localization keys
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
        isDefault: false,
      };

      setRows((prevRows) => [...prevRows, newRow]);
      setAnnouncement(QuestionOptions('announcements.rowAdded', { nextNum }));
      setFormSubmitted(false);
    }
  };

  // Delete options row
  const deleteRow = (id: number) => {
    if (id && id !== 0) {
      setRows((prevRows) => prevRows.filter(row => row.id !== id));
      setAnnouncement(QuestionOptions('announcements.rowRemoved', { id }));
    }
  };


  // Set one row as default (only one can be true)
  const setDefault = (id: number) => {

    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        isDefault: row.id === id,
      }))
    );
    setAnnouncement(QuestionOptions('announcements.rowDefault', { id: id }));

  };

  // Update rows state
  const handleChange = (id: number | string, field: string, value: string | number) => {
    console.log("ID", id, "Field", field, "Value", value);
    setRows((prevRows) => {
      return prevRows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value }; // Update only the matching row
        }
        return row; // Leave other rows unchanged
      });
    });

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
                value={(index + 1).toString()} // Changed to index + 1
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
                onChange={(e) => handleChange(row.id || 0, "text", e.target.value)} // Use row.id instead of index + 1
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
                aria-checked={row.isDefault}
                aria-label={`Set row ${index + 1} as default`}
                onChange={() => setDefault(row.id || 0)}
                className={`${styles.optionsCheckbox} react-aria-Checkbox`}
                isSelected={row.isDefault ? row.isDefault : false}
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
