import { useCallback, useState } from "react";

// GraphQL
import { useLazyQuery } from '@apollo/client/react';
import { AffiliationsDocument } from '@/generated/graphql';

// Utils and other
import { debounce } from '@/hooks/debounce';
import { SuggestionInterface } from '@/app/types';

export function useAffiliationSearch() {
  const [suggestions, setSuggestions] = useState<SuggestionInterface[]>([]);
  const [fetchAffiliations] = useLazyQuery(AffiliationsDocument);


  const handleSearch = useCallback(
    debounce(async (term: string) => {
      if (!term) {
        setSuggestions([]);
        return;
      }

      const { data } = await fetchAffiliations({
        variables: { name: term.toLowerCase() },
      });

      if (data?.affiliations?.items) {
        const affiliations = data.affiliations.items
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .map((item) => ({
            id: item.id != null ? String(item.id) : '',
            displayName: item.displayName,
            uri: item.uri,
          }));
        setSuggestions(affiliations);
      }
    }, 300),
    []
  );

  return { suggestions, handleSearch };
}