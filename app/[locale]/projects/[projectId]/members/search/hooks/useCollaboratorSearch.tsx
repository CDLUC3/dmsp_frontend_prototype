'use client';

import { useState, useEffect } from 'react';
import { useFindCollaboratorLazyQuery, CollaboratorSearchResult } from '@/generated/graphql';
import { useTranslations } from 'next-intl';

type SearchState = {
  term: string;
  results: CollaboratorSearchResult[];
  isSearching: boolean;
  errors: string[];
  loading: boolean;
};

export const useCollaboratorSearch = () => {
  const t = useTranslations('ProjectsProjectMembersSearch');
  const [searchState, setSearchState] = useState<SearchState>({
    term: '',
    results: [],
    isSearching: false,
    errors: [],
    loading: false,
  });

  const [fetchCollaborator, { data, loading }] = useFindCollaboratorLazyQuery();

  // Set search state on input change
  const handleSearchInput = (value: string) => {
    const trimmed = value.trim();
    setSearchState({
      term: trimmed,
      results: [],
      isSearching: false,
      errors: [],
      loading: false,
    });
  };

  // Execute search
  const handleMemberSearch = async () => {
    const trimmed = searchState.term.trim();

    if (!trimmed) {
      setSearchState((prev) => ({
        ...prev,
        errors: [t('messaging.errors.searchTermRequired')],
      }));
      return;
    }

    setSearchState((prev) => ({ ...prev, isSearching: true, errors: [], loading: true }));
    await fetchCollaborator({ variables: { term: trimmed.toLowerCase() } });
  };

  const clearSearch = () => {
    setSearchState({
      term: '',
      results: [],
      isSearching: false,
      errors: [],
      loading: false,
    });
  };

  // Update search results when data changes
  useEffect(() => {
    if (!data?.findCollaborator) return;
    const items = (data.findCollaborator.items || []).filter(
      (i): i is CollaboratorSearchResult => i !== null
    );

    if (items.length === 0) {
      setSearchState((prev) => ({
        ...prev,
        errors: [t('messaging.noSearchResultsFound')],
        results: [],
        isSearching: false,
        loading: false,
      }));
    } else {
      setSearchState((prev) => ({
        ...prev,
        results: items,
        isSearching: true,
        loading: false,
        errors: [],
      }));
    }
  }, [data, loading, t]);

  return {
    ...searchState,
    setSearchTerm: handleSearchInput,
    handleMemberSearch,
    clearSearch,
  };
};
