import React, { useEffect } from 'react';
import classNames from 'classnames';

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

import styles from './table.module.scss';


export type DmpTableColumn = {
  id: string;
  name: string;
  isRowHeader: boolean;
  allowSorting: boolean;
}

export type DmpTableProps = TableProps & {
  columns: DmpTableColumn[];
  rows: any[];
  label: string;
  id?: string;
  className?: string;
  onSortChange?: (() => void),
  onSortChange?: ((value: string[]) => void),
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

  return (
    <Table
      id={id}
      aria-label={label}
      className={classNames(styles.dmpTable, className)}
      sortDescriptor={"test"}
      onSortChange={onSortChange}
    >
      <DmpTableHeader columns={columns}>
        {(col) => (
          <Column isRowHeader={col.isRowHeader} allowSorting={col.allowSorting}>
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
