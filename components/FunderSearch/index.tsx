'use client'

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useAffiliationFundersLazyQuery } from '@/generated/graphql';
import { FunderSearchResults } from '@/app/types';

import {
  Button,
  Form,
  Input,
  Label,
  SearchField,
  Text,
} from "react-aria-components";


interface FunderSearchProps extends React.HTMLAttributes<HTMLDivElement> {
  // Call back to return the results
  onResults(results: FunderSearchResults): void;

  // A simple counter to trigger fetching more results
  moreTrigger?: number;

  // Specifies result limit to paginate by
  limit?: number,
}

const FunderSearch = ({
  limit = 50,
  onResults,
  moreTrigger,
}: FunderSearchProps) => {

  const trans = useTranslations('Global');
  const [moreCounter, setMoreCounter] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fetchAffiliations, {data}] = useAffiliationFundersLazyQuery({});
  const [nextCursor, setNextCursor] = useState<string|null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Don't perform any lookup if the search term is empty.
    if (!searchTerm.trim()) return;

    // Now perform the affiliation search with our search term
    fetchAffiliations({
      variables: {
        paginationOptions: {
          type: "CURSOR",
          limit: limit,
        },
        name: searchTerm.toLowerCase(),
        funderOnly: true,
      },
    });
  };

  useEffect(() => {
    if (data?.affiliations) {
      setNextCursor(data.affiliations.nextCursor ?? null);
      if (onResults) {
        onResults(data.affiliations as FunderSearchResults);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!moreTrigger) return;
    if (moreTrigger > moreCounter) {
      fetchAffiliations({
        variables: {
          paginationOptions: {
            type: "CURSOR",
            cursor: nextCursor,
            limit: limit,
          },
          name: searchTerm.toLowerCase(),
          funderOnly: true,
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
            <Label>{trans('labels.funderSearch')}</Label>
            <Input
              aria-describedby="search-help"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={trans('placeholders.funderSearch')}
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

export default FunderSearch;
