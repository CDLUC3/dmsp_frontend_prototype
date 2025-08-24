import { useCallback, useState } from "react";
import { debounce } from '@/hooks/debounce';
import { useAffiliationsLazyQuery } from '@/generated/graphql';
import { SuggestionInterface } from '@/app/types';

export function useAffiliationSearch() {
  const [suggestions, setSuggestions] = useState<SuggestionInterface[]>([]);
  const [fetchAffiliations] = useAffiliationsLazyQuery();


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
            id: String(item.id) ?? undefined,
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