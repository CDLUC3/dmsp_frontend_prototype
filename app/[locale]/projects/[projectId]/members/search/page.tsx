'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";

//GraphQL
import {
  CollaboratorSearchResult,
  useFindCollaboratorLazyQuery
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
import ErrorMessages from '@/components/ErrorMessages';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
import { extractErrors } from '@/utils/errorHandler';

import { useToast } from '@/context/ToastContext';
import { logECS, routePath } from '@/utils/index';
import styles from './ProjectsProjectMembersSearch.module.scss';

type AddProjectMemberErrors = {
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
  affiliationId: string;
}


const ProjectsProjectMembersSearch = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast();

  const projectId = String(params.projectId);

  // Top scroll to top when search is reset
  const topRef = useRef<HTMLDivElement>(null);

  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // To track previous length of search results for scrolling
  const prevLengthRef = useRef(0);

  // To track last processed cursor to avoid duplicate processing
  const lastProcessedCursorRef = useRef<string | null>(null);
  // To track if we've processed the initial results
  const hasProcessedInitialResults = useRef(false);

  const { scrollToTop } = useScrollToTop();

  const [errors, setErrors] = useState<string[]>([]);

  // Add separate state for search and load more
  const [searchNextCursor, setSearchNextCursor] = useState<string | null>(null);
  const [searchTotalCount, setSearchTotalCount] = useState<number | null>(0);
  const [searchResults, setSearchResults] = useState<CollaboratorSearchResult[]>([]);
  const [isSearchFetch, setIsSearchFetch] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadMore, setLoadMore] = useState(false);

  // Translation keys
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectMembersSearch');

  const [fetchCollaborators, { data: collaboratorData, loading }] = useFindCollaboratorLazyQuery();

  const LIMIT = 5;

  // zero out search and filters
  const resetSearch = () => {
    setSearchTerm('');
    setIsSearchFetch(false);
    setSearchResults([]); // Clear search results
    setSearchNextCursor(null); // Reset search cursor
    setSearchTotalCount(0); // Reset search total count
    lastProcessedCursorRef.current = null; // Reset last processed cursor
    hasProcessedInitialResults.current = false; // Reset initial results flag
    scrollToTop(topRef);
  }

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Handler for search button
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setErrors([]);
    setIsSearchFetch(true);
    setSearchResults([]); // Clear previous search results
    setSearchNextCursor(null); // Reset search cursor
    lastProcessedCursorRef.current = null; // Reset processed cursor tracking
    hasProcessedInitialResults.current = false; // Reset initial results flag

    await fetchCollaborators({
      variables: {
        options: {
          type: "CURSOR",
          cursor: null, // Start fresh search
          limit: LIMIT,
        },
        term: searchTerm.toLowerCase(),
      },
    });
  };

  // Handler for search "Load more"
  const handleSearchLoadMore = async () => {
    if (!searchNextCursor) return;

    setLoadMore(true);
    setErrors([]);

    try {
      const result = await fetchCollaborators({
        variables: {
          options: {
            type: "CURSOR",
            cursor: searchNextCursor,
            limit: LIMIT,
          },
          term: searchTerm.toLowerCase(),
        },
      });

      // Check if Apollo returned an error in the result
      if (result.error) {
        logECS('error', 'handleSearchLoadMore', {
          error: result.error,
          url: { path: routePath('projects.members.search', { projectId }) }
        });
        setErrors(prev => [...prev, t('messaging.errors.failedToLoadMoreCollaborators')]);
      }
    } catch (err) {
      logECS('error', 'handleSearchLoadMore', {
        error: err,
        url: { path: routePath('projects.members.search', { projectId }) }
      });
      setErrors(prev => [...prev, t('messaging.errors.failedToLoadMoreCollaborators')]);
    } finally {
      setLoadMore(false);
    }
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
    });


    if (response.redirect) {
      router.push(response.redirect);
    }

    return response;
  }

  // Handle adding a member by clicking "Add" button from search result
  const handleAddMember = async (result: CollaboratorSearchResult | null) => {
    // If no result, do nothing
    if (!result) return;

    // Remove previous errors
    setErrors([]);

    const response = await addProjectMember({
      projectId: Number(projectId),
      givenName: result?.givenName || '',
      surName: result?.surName || '',
      email: result?.email || '',
      orcid: result?.orcid || '',
      affiliationId: result?.affiliationId || ''
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
      const successMessage = `${t('messaging.success.addedProjectMember', { name: `${result?.givenName} ${result?.surName}` })}`;
      toastState.add(successMessage, { type: 'success' });
      router.push(routePath('projects.members.index', { projectId }))
    }
  }

  // Redirect users to the create member page
  const handleCreateMember = () => {
    router.push(routePath('projects.members.create', { projectId }));
  }


  // Process fetched collaborator data
  useEffect(() => {
    if (!collaboratorData || !collaboratorData?.findCollaborator || loading) return;

    const currentCursor = collaboratorData.findCollaborator?.nextCursor ?? null;

    // For initial search (cursor is null), check if we've already processed initial results
    // For pagination (cursor is not null), check if we've already processed this cursor
    if (currentCursor === null && hasProcessedInitialResults.current) {
      console.log("Early return - initial results already processed");
      return;
    }

    if (currentCursor !== null && lastProcessedCursorRef.current === currentCursor) {
      console.log("Early return - cursor already processed");
      return;
    }

    const newItems = (collaboratorData.findCollaborator.items || []).filter((item): item is CollaboratorSearchResult => item !== null);

    if (isSearchFetch) {
      const newTotalCount = collaboratorData.findCollaborator?.totalCount ?? null;

      setSearchTotalCount(newTotalCount);

      // Append new items only if they're not already in the results
      setSearchResults(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewItems];
      });

      setSearchNextCursor(currentCursor);
    }

    // Update the last processed cursor and mark initial results as processed
    lastProcessedCursorRef.current = currentCursor;
    if (currentCursor === null) {
      hasProcessedInitialResults.current = true;
    }

  }, [collaboratorData, loading, isSearchFetch]);

  // Reset search when search term is cleared
  useEffect(() => {
    // Need this to set list of projects back to original, full list after filtering
    if (searchTerm === '') {
      setSearchResults([]);
      setIsSearchFetch(false);
      setSearchNextCursor(null);
      setSearchTotalCount(0);
      lastProcessedCursorRef.current = null;
      hasProcessedInitialResults.current = false;
    }
  }, [searchTerm])

  // Scroll down to newly added items when loading more
  useEffect(() => {
    // Only scroll when results are appended (not replaced)
    if (loadMore && searchResults.length > prevLengthRef.current) {
      const newItem = document.querySelector(
        `[data-result-index= "${prevLengthRef.current}"]`
      );
      newItem?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    prevLengthRef.current = searchResults.length;
  }, [searchResults, searchNextCursor]);

  return (
    <>
      <PageHeader
        title={t('title')}
        description=""
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
                aria-describedby={t('ariaSearchInput')}
                value={searchTerm}
                onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  handleSearch();
                }}
              >
                {Global('buttons.search')}
              </Button>

              <FieldError />
              <Text slot="description" className="help" id="search-help">
                {t('searchDescription')}
              </Text>
            </SearchField>
          </section>

          {isSearchFetch && (
            <section aria-labelledby="results-section">
              {searchResults.length > 0 && (
                <h2 id="results-section" className="heading-3">{t('headings.searchResultsHeader', { length: searchResults.length, total: String(searchTotalCount) })}</h2>
              )}

              <div>
                {searchResults.length === 0 && !loading && (
                  <div className={styles.noResults}>
                    <p>{Global('messaging.noItemsFound')}</p>
                  </div>
                )}

                {searchResults.map((result: CollaboratorSearchResult, index) => {
                  const name = `${result?.givenName} ${result?.surName} `;
                  return (
                    <div
                      key={result.id}
                      data-testid={`result-${index} `}
                      data-result-index={index}
                      className={styles.memberResultsListItem}
                      role="group"
                      aria-label={t('ariaSearchItemName', { name })}
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
                      <Button
                        className="secondary"
                        onPress={() => handleAddMember(result)}
                        aria-label={t('ariaAddMemberButton', { name })}
                      >
                        {Global('buttons.add')}
                      </Button>
                    </div>
                  )
                })}

                {searchNextCursor && (
                  <div className={styles.loadBtnContainer}>
                    <Button
                      type="button"
                      data-testid="search-load-more-btn"
                      onPress={handleSearchLoadMore}
                      aria-label="load more search results"
                    >
                      {Global('buttons.loadMore')}
                    </Button>
                    <div>
                      {Global('messaging.numDisplaying', { num: searchResults.length, total: searchTotalCount || '' })}
                    </div>
                    <Button onPress={resetSearch} className={`${styles.searchMatchText} link`}> {Global('links.clearFilter')}</Button>
                  </div>
                )}

              </div>
            </section>
          )}

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
