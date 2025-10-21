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
import { TypeAheadWithOther, useAffiliationSearch } from '@/components/Form/TypeAheadWithOther';

import ErrorMessages from '@/components/ErrorMessages';

// Hooks
import { extractErrors } from '@/utils/errorHandler';

import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/index';
import styles from './ProjectsProjectMembersSearch.module.scss';

type AddProjectMemberErrors = {
  email?: string;
  general?: string;
  givenName?: string;
  affiliationId: string,
  affiliationName: string,
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
  affiliationId: string,
  affiliationName: string,
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

  // For TypeAhead component
  const { suggestions, handleSearch } = useAffiliationSearch();

  const [errors, setErrors] = useState<string[]>([]);
  const [otherField, setOtherField] = useState(false);


  // Add separate state for search and load more
  const [searchResults, setSearchResults] = useState<CollaboratorSearchResult[]>([]);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Project member
  const [projectMember, setProjectMember] = useState({
    givenName: '',
    surName: '',
    affiliationId: '',
    affiliationName: '',
    otherAffiliationName: '',
    email: '',
    orcid: '',
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<CollaboratorSearchResult | null>(null);

  // Field errors for funding form
  const [fieldErrors, setFieldErrors] = useState({
    givenName: '',
    surName: '',
    affiliationId: '',
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


  const reset = () => {
    clearAllFieldErrors();
    setErrors([]);
    clearAllFormFields();
  }

  const updateAffiliationFormData = async (id: string, value: string) => {
    // Clear previous error messages
    clearAllFieldErrors();
    setErrors([]);
    return setProjectMember({ ...projectMember, affiliationName: value, affiliationId: id });
  }

  // Handle any changes to form field values
  function handleOtherAffiliationInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Clear previous error messages
    clearAllFieldErrors();
    setErrors([]);
    const { name, value } = e.target;
    setProjectMember({ ...projectMember, [name]: value });
  }


  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    reset();
    const trimmedValue = value.trim();
    setSearchTerm(trimmedValue);
  }


  const extractOrcidFromInput = (input: string): string => {
    // If input is empty, return empty string
    if (!input) return '';

    // Regex to find ORCID pattern anywhere in the string
    const orcidPattern = /\b\d{4}-\d{4}-\d{4}-\d{4}\b/;

    const match = input.match(orcidPattern);
    if (!match) {
      setErrors([t('messaging.errors.valueOrcidRequired')]);
      return '';
    }

    return match[0];
  }

  // Handler for search button
  const handleMemberSearch = async () => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      setErrors([t('messaging.errors.searchTermRequired')]);
      return;
    }

    const orcidId = extractOrcidFromInput(trimmedTerm); // Extract the matched ORCID

    // Do not fetch if no valid orcid match
    if (!orcidId) return;

    clearAllFormFields();
    setErrors([]);
    setIsSearchFetch(true);
    setSearchResults([]); // Clear previous search results
    lastProcessedCursorRef.current = null; // Reset processed cursor tracking
    hasProcessedInitialResults.current = false; // Reset initial results flag

    await fetchCollaborator({
      variables: {
        term: searchTerm.trim().toLowerCase(),
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
      email: result?.email || '',
      orcid: result?.orcid || '',
      affiliationName: result?.affiliationName || '',
      affiliationId: result?.affiliationId || '',
      otherAffiliationName: '',
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
    clearAllFieldErrors();
    setErrors([]);
    setRoles(values); // Set the selected role IDs
  }

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      givenName: '',
      surName: '',
      affiliationName: '',
      affiliationId: '',
      email: '',
      projectRoles: ''
    });
  }

  const clearAllFormFields = () => {
    setProjectMember({
      givenName: '',
      surName: '',
      affiliationId: '',
      affiliationName: '',
      otherAffiliationName: '',
      email: '',
      orcid: '',
    });

    setRoles([]);
  }

  // Validate form fields
  const validateForm = () => {
    const newFieldErrors = {
      givenName: '',
      surName: '',
      affiliationName: '',
      affiliationId: '',
      email: '',
      projectRoles: ''
    };

    let hasErrors = false;

    console.log("****Affiliation Name:", projectMember.affiliationName);

    if (!projectMember.givenName.trim()) {
      newFieldErrors.givenName = t('messaging.errors.givenNameRequired');
      hasErrors = true;
    }

    if (!projectMember.surName.trim()) {
      newFieldErrors.surName = t('messaging.errors.surNameRequired');
      hasErrors = true;
    }

    if (!projectMember.affiliationName.trim()) {
      newFieldErrors.affiliationId = t('messaging.errors.affiliationRequired');
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

    return { fieldErrors: newFieldErrors, hasErrors };
  }

  // Handle form submission
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Clear previous errors
    setErrors([]);
    clearAllFieldErrors();

    // Validate form
    const { fieldErrors: newFieldErrors, hasErrors } = validateForm();

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      // Extract the error messages and add them to the general errors state
      const errorMessages = extractErrors(newFieldErrors);
      setErrors(errorMessages);
      return;
    }

    // Convert role IDs from strings to numbers
    const memberRoleIds = roles.map(roleId => parseInt(roleId, 10));
    const extractedOrcid = extractOrcidFromInput(projectMember.orcid);
    const response = await addProjectMember({
      projectId: Number(projectId),
      givenName: projectMember.givenName,
      surName: projectMember.surName,
      email: projectMember.email,
      orcid: extractedOrcid, // Include ORCID if available from search
      affiliationName: projectMember.otherAffiliationName ? projectMember.otherAffiliationName : projectMember.affiliationName,
      affiliationId: projectMember.affiliationId,
      memberRoleIds
    });

    // Handle redirect from server action (e.g., authentication required)
    if (response.redirect) {
      router.push(response.redirect);
      return;
    }

    if (!response.success) {
      // Use specific error messages if available, otherwise use default
      const errorMessages = response.errors && response.errors.length > 0
        ? response.errors
        : [t('messaging.errors.failedToAddProjectMember')];
      setErrors(errorMessages);
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

    const newItems = (collaboratorData.findCollaborator.items || []).filter((item): item is CollaboratorSearchResult => item !== null);

    if (isSearchFetch) {
      if (newItems.length === 0) {
        setErrors([t('messaging.noSearchResultsFound')]);
      } else {
        // Set search results directly since we only get one result
        setSearchResults(newItems);
      }


      // Auto-populate form with the first result if no result is currently selected
      if (newItems.length > 0 && !selectedSearchResult) {
        const firstResult = newItems[0];
        setSelectedSearchResult(firstResult);
        setProjectMember({
          givenName: firstResult?.givenName || '',
          surName: firstResult?.surName || '',
          affiliationId: firstResult?.affiliationRORId || '',
          affiliationName: firstResult?.affiliationName || '',
          otherAffiliationName: '',
          email: firstResult?.email || '',
          orcid: firstResult?.orcid || '',
        });

        // Clear any previous errors
        setErrors([]);
        clearAllFieldErrors();
      }
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
        affiliationId: '',
        affiliationName: '',
        otherAffiliationName: '',
        email: '',
        orcid: '',
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
              <Label>{t('searchLabel')} <span className="is-required">(recommended)</span></Label>
              <Input
                aria-describedby="search-help"
                value={searchTerm}
                onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  handleMemberSearch();
                }}
              >
                {Global('buttons.lookup')}
              </Button>
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
            <Form onSubmit={handleFormSubmit}>
              <FormInput
                name="firstName"
                type="text"
                isRequiredVisualOnly={true}
                label={t('labels.givenName')}
                value={projectMember.givenName}
                onChange={(e) => {
                  setErrors([]); // clear errors on input change
                  clearAllFieldErrors();
                  setProjectMember({ ...projectMember, givenName: e.target.value })
                }}
                isInvalid={(!!fieldErrors.givenName)}
                errorMessage={fieldErrors.givenName}
              />

              <FormInput
                name="lastName"
                type="text"
                isRequiredVisualOnly={true}
                label={t('labels.surName')}
                value={projectMember.surName}
                onChange={(e) => {
                  setErrors([]); // clear errors on input change
                  clearAllFieldErrors();
                  setProjectMember({ ...projectMember, surName: e.target.value })
                }}
                isInvalid={(!!fieldErrors.surName)}
                errorMessage={fieldErrors.surName}
              />

              <TypeAheadWithOther
                label={t('labels.affiliation')}
                fieldName="affiliation"
                setOtherField={setOtherField}
                isRequired={true}
                error={fieldErrors.affiliationId}
                updateFormData={updateAffiliationFormData}
                value={projectMember.affiliationName}
                suggestions={suggestions}
                onSearch={handleSearch}
              />
              {otherField && (
                <div className={`${styles.formRow} ${styles.oneItemRow}`}>
                  <FormInput
                    name="otherAffiliationName"
                    type="text"
                    label="Other Affiliation Name"
                    placeholder={projectMember.otherAffiliationName}
                    value={projectMember.otherAffiliationName}
                    onChange={handleOtherAffiliationInputChange}
                  />
                </div>
              )}

              <FormInput
                name="email"
                type="email"
                isRequired={false}
                isRecommended={true}
                label={t('labels.email')}
                value={projectMember.email}
                onChange={(e) => {
                  setErrors([]); // clear errors on input change
                  clearAllFieldErrors();
                  setProjectMember({ ...projectMember, email: e.target.value })
                }}
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
                  isRequired={false}
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
