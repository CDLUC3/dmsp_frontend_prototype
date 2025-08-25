import styles from "./LinkFilter.module.scss";
import React, { useState } from "react";
import { RadioGroup, Radio } from "react-aria-components";

interface LinkFilterProps {
  label: string;
  categories: { label: string; id: string; count?: null | number }[];
}

const LinkFilter = ({ label, categories }: LinkFilterProps) => {
  const [category, setCategory] = useState(categories.length ? categories[0].id: null);

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}</span>
      <RadioGroup
        aria-label="Priority filter"
        orientation="horizontal"
        value={category}
        onChange={(value) => {
          setCategory(value);
        }}
        className={styles.radioGroup}
      >
        {categories.map((category, i) => {
          let label = category.label;
          if (category.count != null) {
            label += `(${category.count})`;
          }

          return (
            <React.Fragment key={category.id}>
              <Radio
                value={category.id}
                className={styles.radio}
              >
                {/* CSS trick to stop the radio button label font weight change from making other items in the layout
                    shift. There is a hidden label that is always bold and underlined determining the size
                    of the label and the label that we see is positioned absolutely on top and centred.
                 */}
                <span
                  className={styles.radioLabelHidden}
                  aria-hidden="true"
                >
                  {label}
                </span>
                <span className={styles.radioLabel}>{label}</span>
              </Radio>
              {i !== categories.length - 1 && (
                <span
                  aria-hidden
                  className={styles.separator}
                >
                  /
                </span>
              )}
            </React.Fragment>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default LinkFilter;
