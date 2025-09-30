import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@apollo/client/react';

import {
  Table,
  TableProps,
  TableBody,
  TableHeader,
  TableHeaderProps,
  Column,
  Row,
  RowProps,
  Cell,
  Collection,
  useTableOptions,
} from 'react-aria-components';
import {
  SortDescriptor,
} from '@react-types/table';

import { DmpIcon } from '@/components/Icons';

import styles from './table.module.scss';


export type DmpTableColumn = {
  id: string;
  name: string;
  isRowHeader: boolean;
  allowsSorting: boolean;
}

export type DmpTableProps = TableProps & {
  columns: DmpTableColumn[];
  rows: Array<Record<string, any>>;
  label: string;
  id?: string;
  className?: string;

  // Callbacks
  onSortChange?: (SortDescriptor) => void;
}


// Sub-Components that make up the table
export function DmpTableHeader<T extends object>({
  columns,
  children,
}: TableHeaderProps<T>) {
  return (
    <TableHeader className={styles.dmpTableHeader}>
      <Collection items={columns}>
        {children}
      </Collection>
    </TableHeader>
  );
}

export function DmpTableRow<T extends object>({
  id,
  columns,
  row,
  children,
  ...otherProps
}: RowProps<T>) {
  return (
    <Row
      id={id}
      className={styles.dmpTableRow}
      {...otherProps}
    >
      <Collection items={columns} dependencies={[row]}>
        {children}
      </Collection>
    </Row>
  );
}


export function DmpTable({
  id,
  className,
  columns,
  rows,
  label,
  onSortChange,
}: DmpTableProps): React.ReactElement {

  const [sorting, setSorting] = useState<SortDescriptor>({
    column: "",
    direction: "ascending",
  });

  function handleOnSortChange(descriptor: SortDescriptor) {
    setSorting(descriptor);
    if (onSortChange) onSortChange(descriptor);
  }

  // FIXME::TODO:: Columns each have their own sort direction!
  // So our approach below will not work as expected.
  //
  // {col.allowsSorting && sorting?.direction && (
  //   <>
  //   {sorting.direction == "ascending" && (<DmpIcon icon="up_arrow" />)}
  //   {sorting.direction == "descending" && (<DmpIcon icon="down_arrow" />)}
  //   </>
  // )}

  return (
    <Table
      id={id}
      aria-label={label}
      className={classNames(styles.dmpTable, className)}
      onSortChange={handleOnSortChange}
      sortDescriptor={sorting}
    >
      <DmpTableHeader className={styles.dmpTableHeader} columns={columns}>
        {(col) => (
          <Column isRowHeader={col.isRowHeader} allowsSorting={col.allowsSorting}>
            {col.name}
          </Column>
        )}
      </DmpTableHeader>

      <TableBody items={rows} dependencies={[columns]}>
        {(row) => (
          <DmpTableRow id={row.id} columns={columns}>
            {(col) => <Cell>{row[col.id]}</Cell>}
          </DmpTableRow>
        )}
      </TableBody>
    </Table>
  );
}
