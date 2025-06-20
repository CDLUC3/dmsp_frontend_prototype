import React from 'react';
import type { TypeaheadSearchQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MockedProvider } from '@apollo/client/testing';
import { AffiliationsDocument } from '@/generated/graphql';

import AffiliationSearchQuestionComponent from '../index';

expect.extend(toHaveNoViolations);

describe('TypeaheadSearchQuestionComponent', () => {
  const mockHandleAffiiationChange = jest.fn();
  const mockHandleOtherAffiliationChange = jest.fn();
  const mockSetOtherField = jest.fn();
  const mockAffiliationData = {
    affiliationName: 'Test Institution',
    affiliationId: '12345'
  };
  const mockParsedQuestion: TypeaheadSearchQuestionType = {
    type: "typeaheadSearch",
    meta: {
      schemaVersion: "1.0",
      labelTranslationKey: "questions.organizations"
    },
    graphQL: {
      responseField: "organizations",
      localQueryId: "getOrganizations",
      displayFields: [
        {
          label: "Organization Name",
          propertyName: "name",
          labelTranslationKey: "organization.name"
        },
        {
          label: "Acronym",
          propertyName: "acronym",
          labelTranslationKey: "organization.acronym"
        }
      ],
      query: `
      query getOrganizations($search: String!) {
        organizations(search: $search) {
          id
          name
          acronym
        }
      }
    `,
      variables: [
        {
          name: "search",
          type: "String",
          label: "Search Term",
          labelTranslationKey: "search.label",
          minLength: 2
        }
      ]
    }
  };

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          publishPlan: {
            success: true,
          },
        },
      }),
    }) as jest.Mock;
  })
  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should render correct label and text', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName=''
        otherField={false}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    expect(screen.getByLabelText('Organization Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type to search...')).toHaveValue('Test Institution');
    expect(screen.getByText('Search Term')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'institution');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should renders the typeahead with correct props', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName=""
        otherField={false}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    expect(screen.getByLabelText('Organization Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type to search...')).toHaveValue('Test Institution');
    expect(screen.getByText('Search Term')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'institution');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should set otherField to false if it is not passed in', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName=""
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    expect(screen.queryByLabelText('Other institution')).not.toBeInTheDocument();
  });

  it('should set otherAffiliationName to an empty string if none is passed', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherField={true}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    expect(screen.queryByLabelText('Other institution')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter other institution name')).toHaveValue('');
  });

  it('should render the "Other institution" input when otherField is true', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName="Other Inst"
        otherField={true}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    expect(screen.getByLabelText('Other institution')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter other institution name')).toHaveValue('Other Inst');
  });

  it('should call handleAffiliationChange when typing in the typeahead', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName=""
        otherField={false}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    fireEvent.change(screen.getByRole('textbox', { name: /organization name/i }), {
      target: { value: 'New Institution' }
    });
    expect(mockHandleAffiiationChange).toHaveBeenCalled();
  });

  it('should call handleOtherAffiliationChange when typing in "Other institution"', () => {
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName="Other Inst"
        otherField={true}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    const input = screen.getByPlaceholderText('Enter other institution name');
    fireEvent.change(input, { target: { value: 'Another Inst' } });
    expect(mockHandleOtherAffiliationChange).toHaveBeenCalled();
  });

  it('should renders default label and helpText if not provided in parsedQuestion', () => {
    const minimalParsedQuestion = {
      ...mockParsedQuestion,
      graphQL: {
        ...mockParsedQuestion.graphQL,
        displayFields: [],
        variables: []
      }
    };
    render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={minimalParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName=""
        otherField={false}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    expect(screen.getByLabelText(/institution/i)).toBeInTheDocument();
    expect(screen.getByText(/institutionHelp/i)).toBeInTheDocument();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <AffiliationSearchQuestionComponent
        parsedQuestion={mockParsedQuestion}
        affiliationData={mockAffiliationData}
        otherAffiliationName=""
        otherField={false}
        setOtherField={mockSetOtherField}
        handleAffiliationChange={mockHandleAffiiationChange}
        handleOtherAffiliationChange={mockHandleOtherAffiliationChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});