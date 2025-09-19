import React, { useState } from "react";
import styles from "./ExpandableNameList.module.scss";
import { Button } from "react-aria-components";

type ExpandableNameListProps<T> = {
  items: T[];
  matches: number[];
  maxItems: number;
  renderItem: (item: T, isMatch: boolean | null) => React.ReactNode;
};

export default function ExpandableNameList<T>({ items, matches, maxItems, renderItem }: ExpandableNameListProps<T>) {
  const tooMany = items.length > maxItems;
  const remainder = items.length - maxItems;
  const [isOpen, setOpen] = useState(!tooMany);
  const visible = items.slice(0, tooMany && !isOpen ? maxItems : items.length);
  const matchSet = new Set(matches);

  if (items.length === 0) {
    return null;
  }

  const label = isOpen ? "less" : `+${remainder} more`;

  return (
    <>
      {visible
        .map((item, i) => {
          const isMatch = matchSet.has(i);
          return { item, isMatch };
        })
        .map((result, i, array) => {
          return (
            <React.Fragment key={i}>
              {renderItem(result.item, result.isMatch)}
              {i < array.length - 1 ? ", " : " "}
            </React.Fragment>
          );
        })}
      {tooMany && (
        <Button
          className={`${styles.collapseButton} link`}
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
        >
          {label}
        </Button>
      )}
    </>
  );
}
