import React from 'react';
import { useTranslations } from 'next-intl';
import { gql } from 'graphql-tag';


import { TypeaheadSearchQuestionType } from '@dmptool/types';
import { FormInput, TypeAheadWithOther } from '@/components/Form';
import {
  AffiliationsDocument,
} from '@/generated/graphql';

interface AffiliationSearchQuestionProps {
  parsedQuestion: TypeaheadSearchQuestionType;
  affiliationData: { affiliationName: string, affiliationId: string };
  otherAffiliationName?: string;
  otherField?: boolean;
  setOtherField: (value: boolean) => void;
  handleAffiliationChange: (id: string, value: string) => Promise<void>
  handleOtherAffiliationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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
  return (
    <>
      <TypeAheadWithOther
        label={parsedQuestion?.graphQL?.displayFields?.[0].label || Signup('institution')}
        fieldName="institution"
        graphqlQuery={
          typeof parsedQuestion?.graphQL?.query === 'string'
            ? gql`${parsedQuestion.graphQL.query}`
            : AffiliationsDocument
        }
        resultsKey={parsedQuestion?.graphQL?.responseField}
        setOtherField={setOtherField}
        required={true}
        error=""
        helpText={parsedQuestion?.graphQL?.variables?.[0]?.label || Signup('institutionHelp')}
        updateFormData={handleAffiliationChange}
        value={affiliationData?.affiliationName || ''}
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