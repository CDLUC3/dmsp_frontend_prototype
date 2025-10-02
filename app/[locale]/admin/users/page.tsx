'use client'

import React, { useState, useRef } from 'react';

import { useTranslations } from 'next-intl';
import { logECS, routePath } from '@/utils/index';

import {
  FieldError,
  Breadcrumb,
  Breadcrumbs,
  Button,
  Input,
  Link,
  ListBox,
  ListBoxItem,
  Label,
  Popover,
  SearchField,
  Select,
  SelectValue,
  Text,
} from 'react-aria-components';

import {
  ContentContainer,
  LayoutContainer,
  SidebarPanel,
} from '@/components/Container';

import FormInput from '@/components/Form/FormInput';
import {
  DmpTable,
  DmpTableProps,
  DmpTableColumn,
} from '@/components/Table';

import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import ErrorMessages from '@/components/ErrorMessages';

import styles from './UsersDashboardPage.module.scss';


const StaticPermissions = [
  'Super Admin',
  'Org Admin',
]

const StaticUserList = Array.from({ length: 8 }, (_, i) => {
  const count = i + 1;
  return {
    id: count,
    name: `User ${count} Name`,
    email: `user${count}@example.com`,
    school: "School",
    plans: "24",
    active: "Yes",
    permission: "Super Admin",
    created: "27/09/2025",
    activity: "27/09/2025",
  }
});

const initialColumns = [
  {id: 'id', name: 'id', isRowHeader: false},
  {id: 'name', name: 'Name', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'email', name: 'Email', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'school', name: 'School', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'plans', name: 'Plans', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'active', name: 'Active', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'permission', name: 'Permission', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'created', name: 'Created', isRowHeader: true, allowsSorting: true, direction: ""},
  {id: 'activity', name: 'Activity', isRowHeader: true, allowsSorting: true, direction: ""},
]

const paginationProps = {
  currentPage: 1,
  totalPages: 10,
  hasPreviousPage: false,
  hasNextPage: true,
  handlePageClick: () => {},
};


function OrgUserAccountsPage(): React.ReactElement {
  const usersTrans = useTranslations('Admin.users');

  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [columns, setColumns] = useState<DmpTableColumn[]>(initialColumns);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);


  function handleSearchInput(e: ChangeEvent<HTMLInputElement>) {
    // TODO::
    console.log('TODO');
  }

  function onSortChangeHandler(newColumns: DmpTableColumn[]) {
    // Make sure to update the column states
    setColumns(newColumns);

    // NOTE::TODO
    // Now update the sorting for the items.
    // Currently we are using the static list of demo users, but in a live
    // setting, we will re-request the user list, from the backend, passing the
    // new sort order in the params.
  }

  return (
    <>
      <PageHeader
        title={usersTrans('title')}
        description={usersTrans('description')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('admin.index')}>Admin</Link></Breadcrumb>
            <Breadcrumb>{usersTrans('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link
              href="#"
              className="button-link button--primary"
            >
              {usersTrans('buttons.createUserLabel')}
            </Link>
          </>
        }
        className="page-organization-users-dashboard-header"
      />
      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutContainer>
        <ContentContainer>
          <div className={styles.pageTools} role="search" ref={topRef}>
            <FormInput
              name="search"
              type="text"
              label={usersTrans('tools.searchLabel')}
              onChange={setSearchTerm}
              value={searchTerm}
            />

            <Select name="permission">
              <Label>{usersTrans('tools.permissionLabel')}</Label>
              <Button>
                <SelectValue />
                <span aria-hidden="true">▼</span>
              </Button>
              <Popover>
                <ListBox>
                  {StaticPermissions.map((perm, i) => (
                    <ListBoxItem key={`_permission_${i}`}>{perm}</ListBoxItem>
                  ))}
                </ListBox>
              </Popover>
              <FieldError />
            </Select>

            <Button
              onPress={() => { console.log('TODO') }}
              isDisabled={isSearching}
            >
              {usersTrans('buttons.searchLabel')}
            </Button>
          </div>

          <DmpTable
            label={usersTrans('userTable.label')}
            className={styles.userList}
            columnData={columns}
            rowData={StaticUserList}
          />

          <Pagination {...paginationProps} />
        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default OrgUserAccountsPage;
