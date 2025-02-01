'use client'

import styles from './optionsComponent.module.scss';
import {
  Checkbox,
} from "react-aria-components";

interface Row {
  id: number;
  order: number;
  text: string;
  isDefault: boolean;
}

interface QuestionOptionsComponentProps {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
}


/**This component is used to add question type fields that use options
 * For example, radio buttons, check boxes and select drop-downs
 */
const QuestionOptionsComponent: React.FC<QuestionOptionsComponentProps> = ({ rows, setRows }) => {

  // Add options row
  const addRow = () => {
    const newRow = {
      id: rows.length + 1,
      order: rows.length + 1,
      text: "",
      isDefault: false,
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  // Delete options row
  const deleteRow = (id: number) => {
    setRows((prevRows) => prevRows.filter(row => row.id !== id));
  };


  // Set one row as default (only one can be true)
  const setDefault = (id: number) => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        isDefault: row.id === id,
      }))
    );
  };

  // Update rows state
  const handleChange = (id: number, field: string, value: string) => {
    setRows((prevRows) => {

      // Update the specific field for the matching row
      return prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      );
    });
  };

  return (
    <>
      <div className={styles.tableContainer}>
        {rows.map((row, index) => (

          <div key={row.id} className={styles.row} role="group">
            {/**Let screenreader know which row they are on */}
            <span id={`row-label-${row.id}`} className='hidden-accessibly'>
              Row {index + 1}
            </span>

            <div className={styles.cell}>
              <label htmlFor={`order=${row.id}`}>Order</label>
              <input
                type="text"
                className={styles.orderNumber}
                id={`order-${row.id}`}
                name="order"
                value={row.order}
                placeholder="Enter order #"
                onChange={(e) => handleChange(row.id, "order", e.target.value)}
                aria-label={index === 0 ? undefined : "Order"}
              />
            </div>
            <div className={styles.cell}>
              <label htmlFor={`text-${row.id}`}>Text (required)</label>
              <input
                type="text"
                className={styles.text}
                id={`text-${row.id}`}
                name="text"
                value={row.text}
                placeholder="Enter text"
                onChange={(e) => handleChange(row.id, "text", e.target.value)}
                aria-label={index === 0 ? undefined : "Text"}
              />
            </div>
            <div className={`${styles.cell} ${styles.default}`}>
              <label htmlFor={`default-${row.id}`}>Default</label>
              <Checkbox
                id={`default-${row.id}`}
                aria-checked={row.isDefault}
                aria-label={`Set row ${index + 1} as default`}
                onChange={() => setDefault(row.id)}
                className={`${styles.optionsCheckbox} react-aria-Checkbox`}
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
                onClick={() => deleteRow(row.id)}
                aria-label={`Delete row ${index + 1}`}
                className={`${styles.deleteButton} react-aria-Button secondary`}
              >
                Remove
              </button>
              {/**Screen readers will announce when a new row was added */}
              <p aria-live="polite" className='hidden-accessibly'>
                {rows.length > 0 ? `Row ${rows.length} added` : ""}
              </p>

            </div>
          </div >
        )

        )}

        <button type="button" onClick={addRow} aria-live="polite">
          Add Row
        </button>
      </div>
    </>
  );
}

export default QuestionOptionsComponent;