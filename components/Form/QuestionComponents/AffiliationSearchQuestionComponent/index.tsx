import React from 'react';
import { useTranslations } from 'next-intl';
import { gql } from 'graphql-tag';


import { FormInput } from '@/components/Form';
import TypeAheadWithOther from '@/components/Form/TypeAheadWithOther';
import {
  AffiliationsDocument,
} from '@/generated/graphql';
import { AffiliationSearchQuestionProps } from '@/app/types';


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
        label={parsedQuestion?.graphQL?.displayFields?.[0]?.label || Signup('institution')}
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