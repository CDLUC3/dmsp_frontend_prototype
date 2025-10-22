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

const ORCID_REGEX = /\b\d{4}-\d{4}-\d{4}-\d{4}\b/;

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

  // --- helpers ---
  const extractOrcidFromInput = (input: string): { orcid: string; error?: string } => {
    if (!input.trim()) return { orcid: '' };
    const match = input.match(ORCID_REGEX);
    if (!match) return { orcid: '', error: t('messaging.errors.valueOrcidRequired') };
    return { orcid: match[0] };
  };

  // --- event handlers ---
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

  const handleMemberSearch = async () => {
    const trimmed = searchState.term.trim();

    if (!trimmed) {
      setSearchState((prev) => ({
        ...prev,
        errors: [t('messaging.errors.searchTermRequired')],
      }));
      return;
    }

    const orcidResult = extractOrcidFromInput(trimmed);
    if (orcidResult.error) {
      setSearchState((prev) => ({
        ...prev,
        errors: [orcidResult.error!], // Use non-null assertion since we know it exists
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

  // --- sync results with query ---
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
