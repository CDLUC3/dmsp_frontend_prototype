'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";

//GraphQL
import {
  CollaboratorSearchResult,
  MemberRole,
  useFindCollaboratorLazyQuery,
  useMemberRolesQuery,
} from '@/generated/graphql';

import {
  addProjectMemberAction
} from '@/app/actions';

// Types
import { AddProjectMemberResponse } from '@/app/types';

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';
import { CheckboxGroupComponent, FormInput } from "@/components/Form";
import ErrorMessages from '@/components/ErrorMessages';

// Hooks
import { extractErrors } from '@/utils/errorHandler';

import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/index';
import styles from './ProjectsProjectMembersSearch.module.scss';

type AddProjectMemberErrors = {
  affiliationName?: string;
  affiliationId?: string;
  email?: string;
  general?: string;
  givenName?: string;
  memberRoleIds?: string;
  orcid?: string;
  projectId?: string;
  surName?: string;
}

type ProjectMemberInfo = {
  projectId: number;
  givenName: string;
  surName: string;
  email: string;
  orcid: string;
  affiliationId?: string;
  affiliationName?: string;
  memberRoleIds?: number[];
}

const ProjectsProjectMembersSearch = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast();

  const projectId = String(params.projectId);

  // Scroll to top when search is reset
  const topRef = useRef<HTMLDivElement>(null);

  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // To track last processed cursor to avoid duplicate processing
  const lastProcessedCursorRef = useRef<string | null>(null);
  // To track if we've processed the initial results
  const hasProcessedInitialResults = useRef(false);

  const [errors, setErrors] = useState<string[]>([]);

  // Add separate state for search and load more
  const [searchResults, setSearchResults] = useState<CollaboratorSearchResult[]>([]);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Project member
  const [projectMember, setProjectMember] = useState({
    givenName: '',
    surName: '',
    affiliationName: '',
    affiliationId: '',
    email: '',
    orcid: '',
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<CollaboratorSearchResult | null>(null);

  // Field errors for funding form
  const [fieldErrors, setFieldErrors] = useState({
    givenName: '',
    surName: '',
    affiliationName: '',
    email: '',
    projectRoles: ''
  });

  // Translation keys
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectMembersSearch');

  // Get Member Roles
  const { data: memberRolesData } = useMemberRolesQuery();
  const memberRoles: MemberRole[] = memberRolesData?.memberRoles?.filter((role): role is MemberRole => role !== null) || [];

  // Lazy query for searching collaborators
  const [fetchCollaborator, { data: collaboratorData, loading }] = useFindCollaboratorLazyQuery();

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    const trimmedValue = value.trim();
    setSearchTerm(trimmedValue);
  }

  // Handler for search button
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setErrors([]);
    setIsSearchFetch(true);
    setSearchResults([]); // Clear previous search results
    lastProcessedCursorRef.current = null; // Reset processed cursor tracking
    hasProcessedInitialResults.current = false; // Reset initial results flag

    await fetchCollaborator({
      variables: {
        term: searchTerm.toLowerCase(),
      },
    });
  };

  // Call Server Action addProjectMemberAction
  const addProjectMember = async (memberInfo: ProjectMemberInfo): Promise<AddProjectMemberResponse> => {
    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await addProjectMemberAction({
      projectId: memberInfo.projectId,
      givenName: memberInfo.givenName,
      surName: memberInfo.surName,
      email: memberInfo.email,
      orcid: memberInfo.orcid,
      affiliationId: memberInfo.affiliationId,
      affiliationName: memberInfo.affiliationName,
      memberRoleIds: memberInfo.memberRoleIds,
    });

    if (response.redirect) {
      router.push(response.redirect);
    }

    return response;
  }

  // Handle selecting a search result to populate form fields
  const handleSelectSearchResult = (result: CollaboratorSearchResult) => {
    setSelectedSearchResult(result);
    setProjectMember({
      givenName: result?.givenName || '',
      surName: result?.surName || '',
      affiliationName: result?.affiliationName || '',
      email: result?.email || '',
      orcid: result?.orcid || '',
      affiliationId: result?.affiliationId || ''
    });

    // Clear any previous errors
    setErrors([]);
    clearAllFieldErrors();

    // Scroll to form
    const formSection = document.getElementById('member-details');
    formSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Handle clearing the form to start fresh
  const handleClearForm = () => {
    setSearchTerm('');
  }

  // Redirect users to the create member page
  const handleCreateMember = () => {
    router.push(routePath('projects.members.create', { projectId }));
  }

  // Handle changes to role checkbox selection
  const handleCheckboxChange = (values: string[]) => {
    setRoles(values); // Set the selected role IDs
  }

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      givenName: '',
      surName: '',
      affiliationName: '',
      email: '',
      projectRoles: ''
    });
  }

  // Handle manual form submission
  const handleManualFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Clear previous errors
    setErrors([]);
    clearAllFieldErrors();

    // Basic validation
    const newFieldErrors = {
      givenName: '',
      surName: '',
      affiliationName: '',
      email: '',
      projectRoles: ''
    };

    let hasErrors = false;

    if (!projectMember.givenName.trim()) {
      newFieldErrors.givenName = t('messaging.errors.givenNameRequired');
      hasErrors = true;
    }

    if (!projectMember.surName.trim()) {
      newFieldErrors.surName = t('messaging.errors.surNameRequired');
      hasErrors = true;
    }

    // Email validation - only validate format if provided
    if (projectMember.email.trim() && !/\S+@\S+\.\S+/.test(projectMember.email)) {
      newFieldErrors.email = t('messaging.errors.invalidEmail');
      hasErrors = true;
    }

    if (roles.length === 0) {
      newFieldErrors.projectRoles = t('messaging.errors.projectRolesRequired');
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    // Convert role IDs from strings to numbers
    const memberRoleIds = roles.map(roleId => parseInt(roleId, 10));

    const response = await addProjectMember({
      projectId: Number(projectId),
      givenName: projectMember.givenName,
      surName: projectMember.surName,
      email: projectMember.email,
      orcid: projectMember.orcid, // Include ORCID if available from search
      affiliationName: projectMember.affiliationName, // Include affiliationName if available from search
      memberRoleIds
    });

    if (!response.success) {
      setErrors([t('messaging.errors.failedToAddProjectMember')]);
    } else {
      if (response.data?.errors) {
        // Convert nulls to undefined before passing to extractErrors
        const normalizedErrors = Object.fromEntries(
          Object.entries(response.data.errors).map(([key, value]) => [key, value ?? undefined])
        ) as AddProjectMemberErrors;

        // Handle errors as an object with general or field-level errors
        const errs = extractErrors<AddProjectMemberErrors>(normalizedErrors, ['general', 'affiliationId', 'email', 'givenName', 'memberRoleIds', 'orcid', 'projectId', 'surName']);
        if (errs.length > 0) {
          setErrors(errs);
          return;
        }
      }

      // On success
      const successMessage = `${t('messaging.success.addedProjectMember', { name: `${projectMember.givenName} ${projectMember.surName}` })}`;
      toastState.add(successMessage, { type: 'success' });
      router.push(routePath('projects.members.index', { projectId }))
    }
  }

  // Process fetched collaborator data
  useEffect(() => {
    if (!collaboratorData || !collaboratorData?.findCollaborator || loading) return;

    const currentCursor = collaboratorData.findCollaborator?.nextCursor ?? null;

    const newItems = (collaboratorData.findCollaborator.items || []).filter((item): item is CollaboratorSearchResult => item !== null);

    if (isSearchFetch) {

      // Append new items only if they're not already in the results
      setSearchResults(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
        const updatedResults = [...prev, ...uniqueNewItems];

        // Auto-populate form with first result if this is a fresh search (cursor is null)
        if (currentCursor === null && updatedResults.length > 0 && !selectedSearchResult) {
          const firstResult = updatedResults[0];
          setSelectedSearchResult(firstResult);
          setProjectMember({
            givenName: firstResult?.givenName || '',
            surName: firstResult?.surName || '',
            affiliationName: firstResult?.affiliationName || '',
            email: firstResult?.email || '',
            orcid: firstResult?.orcid || '',
            affiliationId: firstResult?.affiliationId || ''
          });

          // Clear any previous errors
          setErrors([]);
          clearAllFieldErrors();
        }

        return updatedResults;
      });
    }

    // Update the last processed cursor and mark initial results as processed
    lastProcessedCursorRef.current = currentCursor;
    if (currentCursor === null) {
      hasProcessedInitialResults.current = true;
    }

  }, [collaboratorData, loading, isSearchFetch, selectedSearchResult]);

  // Reset search when search term is cleared
  useEffect(() => {
    // Need this to set list of projects back to original, full list after filtering
    if (searchTerm === '') {
      setSearchResults([]);
      setIsSearchFetch(false);
      lastProcessedCursorRef.current = null;
      hasProcessedInitialResults.current = false;

      // Clear form when search is cleared
      setSelectedSearchResult(null);
      setProjectMember({
        givenName: '',
        surName: '',
        affiliationName: '',
        email: '',
        orcid: '',
        affiliationId: ''
      });
      setRoles([]);
      clearAllFieldErrors();
      setErrors([]);
    }
  }, [searchTerm])

  // Description for the member roles checkbox radio group
  const rolesDescription = t.rich('memberRolesDescription', {
    p: (chunks) => <p>{chunks}</p>,
    link: (chunks) => (
      <Link href="https://credit.niso.org/" target="_blank" rel="noopener noreferrer">
        {chunks}
        <span className="hidden-accessibly">({Global('opensInNewTab')})</span>
      </Link>
    )
  });

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-members-search"
      />

      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutContainer>
        <ContentContainer>
          <section id="search-section" className={styles.searchSection} role="search" ref={topRef}>
            <SearchField>
              <Label>{t('searchLabel')}</Label>
              <Input
                aria-describedby="search-help"
                value={searchTerm}
                onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  handleSearch();
                }}
              >
                {Global('buttons.lookup')}
              </Button>

              <FieldError />
              <Text slot="description" className="help-text" id="search-help">
                {t('searchDescription')}
              </Text>
            </SearchField>
          </section>

          {isSearchFetch && (
            <section aria-labelledby="results-section">
              {searchResults.length > 0 && (
                <>
                  <div id="results-section" className={styles.resultsHeader}><strong>{t('headings.searchResultsHeader')}</strong>
                    <Button
                      className="link"
                      onPress={handleClearForm}
                      aria-label={t('buttons.clearForm')}
                    >
                      {t('buttons.clearForm')}
                    </Button>
                  </div>
                </>
              )}

              <div>
                {searchResults.length === 0 && !loading && (
                  <div className={styles.noResults}>
                    <p>{Global('messaging.noItemsFound')}</p>
                  </div>
                )}

                {searchResults.map((result: CollaboratorSearchResult, index) => {
                  const name = `${result?.givenName} ${result?.surName} `;
                  const isSelected = selectedSearchResult?.id === result.id;
                  return (
                    <div
                      key={result.id}
                      data-testid={`result-${index} `}
                      data-result-index={index}
                      className={`${styles.memberResultsListItem} ${isSelected ? styles.selected : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectSearchResult(result)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectSearchResult(result);
                        }
                      }}
                      aria-label={t('ariaSelectSearchResult', { name })}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.memberInfo}>
                        <div className={styles.nameAndOrcid}>
                          <p className={styles.name}>{name}</p>
                        </div>
                        <p className={styles.organization}>
                          {result?.affiliationName}

                          <br />
                          {result?.orcid && (
                            <span className={styles.orcid}>
                              <OrcidIcon icon="orcid" classes={styles.orcidLogo} />
                              {result.orcid}
                            </span>
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <div className={styles.selectedIndicator}>
                          ✓ {t('labels.selected')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <section id="member-details">
            <h2>{t('headings.enterMemberDetails')}</h2>
            <Form onSubmit={handleManualFormSubmit}>
              <FormInput
                name="firstName"
                type="text"
                isRequired={true}
                label={t('labels.givenName')}
                value={projectMember.givenName}
                onChange={(e) => setProjectMember({ ...projectMember, givenName: e.target.value })}
                isInvalid={(!!fieldErrors.givenName)}
                errorMessage={fieldErrors.givenName}
              />

              <FormInput
                name="lastName"
                type="text"
                isRequired={true}
                label={t('labels.surName')}
                value={projectMember.surName}
                onChange={(e) => setProjectMember({ ...projectMember, surName: e.target.value })}
                isInvalid={(!!fieldErrors.surName)}
                errorMessage={fieldErrors.surName}
              />

              <FormInput
                name="affiliation"
                type="text"
                isRequired={false}
                label={t('labels.affiliation')}
                value={projectMember.affiliationName}
                onChange={(e) => setProjectMember({ ...projectMember, affiliationName: e.target.value })}
              />

              <FormInput
                name="email"
                type="email"
                isRequired={false}
                label={t('labels.email')}
                value={projectMember.email}
                onChange={(e) => setProjectMember({ ...projectMember, email: e.target.value })}
                isInvalid={(!!fieldErrors.email)}
                errorMessage={fieldErrors.email}
              />

              <div className={styles.memberRoles}>
                <CheckboxGroupComponent
                  name="memberRoles"
                  value={roles}
                  checkboxGroupLabel={t('labels.definedRole')}
                  checkboxGroupDescription={rolesDescription}
                  onChange={(newValues) => handleCheckboxChange(newValues)}
                  isRequired={true}
                  isInvalid={(!!fieldErrors.projectRoles)}
                  errorMessage={fieldErrors.projectRoles}
                >
                  {memberRoles.map((role, index) => (
                    <Checkbox key={role?.id ?? index} value={role?.id?.toString() ?? ''} aria-label="project roles option">
                      <div className="checkbox">
                        <svg viewBox="0 0 18 18" aria-hidden="true">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                      <div className="">
                        <span>
                          {role.label}
                        </span>

                      </div>
                    </Checkbox>
                  ))}
                </CheckboxGroupComponent>
              </div>
              <Button type="submit" className="submit-button">{t('buttons.addToProject')}</Button>
            </Form>
          </section>

          <section aria-labelledby="manual-section"
            className={styles.createNew}>
            <h2 id="manual-section" className="heading-3">{t('headings.createCollaboratorHeader')}</h2>
            <p>{t('createCollaboratorDescription')}</p>
            <Button
              className="secondary"
              onPress={handleCreateMember}
            >
              {t('buttons.createMember')}
            </Button>
          </section>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectMembersSearch;
