import React, { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { gql } from 'graphql-tag';


import { FormInput } from '@/components/Form';
import TypeAheadWithOther from '@/components/Form/TypeAheadWithOther';
import {
  useAffiliationsLazyQuery,
} from '@/generated/graphql';
import { AffiliationSearchQuestionProps, SuggestionInterface } from '@/app/types';
import { debounce } from '@/hooks/debounce';


const AffiliationSearchQuestionComponent: React.FC<AffiliationSearchQuestionProps> = ({
  parsedQuestion,
  affiliationData,
  otherAffiliationName = '',
  otherField = false,
  setOtherField,
  handleAffiliationChange,
  handleOtherAffiliationChange
}) => {
  const Signup = useTranslations('SignupPage');
  const [suggestions, setSuggestions] = useState<SuggestionInterface[]>([]);

  const [fetchAffiliations] = useAffiliationsLazyQuery();

  const handleSearch = useCallback(debounce(async (term: string) => {
    if (!term) {
      setSuggestions([]);
      return;
    }

    const { data } = await fetchAffiliations({
      variables: {
        name: term.toLowerCase(),
      },
    });

    if (data?.affiliations?.items) {
      const affiliations = data?.affiliations?.items
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .map((item) => ({
          id: String(item.id) ?? undefined,
          displayName: item.displayName,
          uri: item.uri,
        }));
      setSuggestions(affiliations);
    }
  }, 300), [fetchAffiliations]);

  console.log("IN AFFILIATION SEARCH QUESTION", affiliationData?.affiliationName);
  return (
    <>
      <TypeAheadWithOther
        label={parsedQuestion?.attributes?.label || Signup('institution')}
        fieldName="institution"
        setOtherField={setOtherField}
        required={true}
        error=""
        helpText={parsedQuestion?.attributes?.help || Signup('institutionHelp')}
        updateFormData={handleAffiliationChange}
        value={affiliationData?.affiliationName || ''}
        suggestions={suggestions}
        onSearch={handleSearch}
      />
      {otherField && (
        <div className="form-row">
          <FormInput
            name="otherAffiliationName"
            type="text"
            label="Other institution"
            placeholder="Enter other institution name"
            value={otherAffiliationName}
            onChange={handleOtherAffiliationChange}
          />
        </div >
      )
      }
    </>
  )
};

export default AffiliationSearchQuestionComponent;