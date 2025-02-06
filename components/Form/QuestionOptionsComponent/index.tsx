'use client'

import { useState } from "react";
import {
  Checkbox,
} from "react-aria-components";

import { useTranslations } from 'next-intl';
import styles from './optionsComponent.module.scss';


interface Row {
  id?: number | null;
  orderNumber: number;
  text: string;
  isDefault?: boolean | null;
  questionId: number;
}

interface QuestionOptionsComponentProps {
  rows: Row[] | null;
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  questionId?: number;
}


/**This component is used to add question type fields that use options
 * For example, radio buttons, check boxes and select drop-downs
 */
const QuestionOptionsComponent: React.FC<QuestionOptionsComponentProps> = ({ rows, setRows, questionId }) => {
  const [announcement, setAnnouncement] = useState<string>("");

  // localization keys
  const Global = useTranslations('Global');
  const QuestionOptions = useTranslations('QuestionOptionsComponent');

  // Add options row
  const addRow = () => {
    if (rows) {
      const newRow = {
        id: rows.length + 1,
        orderNumber: rows.length + 1,
        text: "",
        isDefault: false,
        questionId: questionId || 0 //If there is no questionId, then it won't update the question when set to 0

      };
      setRows((prevRows) => [...prevRows, newRow]);
      setAnnouncement(QuestionOptions('announcements.rowAdded', { orderNumber: newRow.orderNumber }));
    }
  };

  // Delete options row
  const deleteRow = (id: number) => {
    if (id && id !== 0) {
      setRows((prevRows) => prevRows.filter(row => row.id !== id));
      setAnnouncement(QuestionOptions('announcements.rowRemoved', { id: id }));
    }
  };


  // Set one row as default (only one can be true)
  const setDefault = (id: number) => {
    if (id && id !== 0) {
      setRows((prevRows) =>
        prevRows.map((row) => ({
          ...row,
          isDefault: row.id === id,
        }))
      );
      setAnnouncement(QuestionOptions('announcments.rowDefault', { id: id }));
    }
  };

  // Update rows state
  const handleChange = (id: number, field: string, value: string | number) => {
    if (id && id !== 0) {
      setRows((prevRows) => {

        // Update the specific field for the matching row
        return prevRows.map((row) =>
          row.id === id ? { ...row, [field]: value } : row
        );
      });
    }
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
              <label htmlFor={`order-${row.id}`}>{QuestionOptions('labels.order')}</label>
              <input
                type="text"
                className={styles.orderNumber}
                id={`order-${row.id}`}
                name="orderNumber"
                value={row.orderNumber}
                placeholder="Enter order #"
                onChange={(e) => handleChange(row.id || 0, "orderNumber", Number(e.target.value) || 0)}
                aria-label={index === 0 ? undefined : "Order"}
              />
            </div>
            <div className={styles.cell}>
              <label htmlFor={`text-${row.id}`}>{QuestionOptions('labels.text')}</label>
              <input
                type="text"
                className={styles.text}
                id={`text-${row.id}`}
                name="text"
                value={row.text}
                placeholder="Enter text"
                onChange={(e) => handleChange(row.id || 0, "text", e.target.value)}
                aria-label={index === 0 ? undefined : "Text"}
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