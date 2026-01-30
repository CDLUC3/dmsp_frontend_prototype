'use client'

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Form,
  Input,
  Label,
  SearchField,
  Text,
} from "react-aria-components";

// GraphQL
import { useLazyQuery } from '@apollo/client/react';
import { ManagedAffiliationsWithGuidanceDocument } from '@/generated/graphql';

// Utils and other
import { FunderSearchResults } from '@/app/types';

interface AffiliationSearchForGuidanceProps extends React.HTMLAttributes<HTMLDivElement> {
  // Call back to return the results
  onResults(results: FunderSearchResults, newSearch: boolean): void;

  // A simple counter to trigger fetching more results
  moreTrigger: number;

  // Specifies result limit to paginate by
  limit?: number,

  // Callback when search term changes
  onSearchChange?(value: string): void;
}

const AffiliationSearchForGuidance = ({
  limit = 5,
  onResults,
  moreTrigger,
  onSearchChange,
}: AffiliationSearchForGuidanceProps) => {

  const trans = useTranslations('Global');
  const [moreCounter, setMoreCounter] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fetchManagedAffiliations, { data }] = useLazyQuery(ManagedAffiliationsWithGuidanceDocument, {});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [newSearch, setNewSearch] = useState<boolean>(true);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Don't perform any lookup if the search term is empty.
    if (!searchTerm.trim()) return;
    setNewSearch(true);

    // Now perform the affiliation search with our search term
    fetchManagedAffiliations({
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit,
        },
        name: searchTerm.toLowerCase(),
      },
    });
  };

  useEffect(() => {
    if (data?.managedAffiliationsWithGuidance) {
      setNextCursor(data.managedAffiliationsWithGuidance.nextCursor ?? null);
      onResults(data.managedAffiliationsWithGuidance as FunderSearchResults, newSearch);
    }
  }, [data]);

  useEffect(() => {
    if (moreTrigger > moreCounter) {
      setNewSearch(false);
      fetchManagedAffiliations({
        variables: {
          paginationOptions: {
            type: "CURSOR",
            cursor: nextCursor,
            limit,
          },
          name: searchTerm.toLowerCase(),
        },
      });
      setMoreCounter(moreTrigger);
    }
  }, [moreTrigger]);

  return (
    <>
      <Form onSubmit={handleSubmit} aria-labelledby="search-section">
        <section id="search-section">
          <SearchField
            data-testid="search-field"
            aria-label="Search funders"
          >
            <Label>{trans('labels.nameSearch')}</Label>
            <Input
              aria-describedby="search-help"
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={trans('placeholders.nameSearch')}
            />
            <Button data-testid="search-btn" type={"submit"}>
              {trans('buttons.search')}
            </Button>
            <Text slot="description" className="help" id="search-help">
              {trans('helpText.funderSearch')}
            </Text>
          </SearchField>
        </section>
      </Form>
    </>
  );
};

export default AffiliationSearchForGuidance;
