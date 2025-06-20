import React from 'react';
import type { CheckboxesQuestionType } from '@dmptool/types';
import { act, fireEvent, render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CheckboxesQuestionComponent } from '@/components/Form/QuestionComponents';
expect.extend(toHaveNoViolations);


describe('RadioButtonsQuestionComponent', () => {
  const mockHandleCheckboxChange = jest.fn();
  const mockParsedQuestion: CheckboxesQuestionType = {
    type: "checkBoxes",
    meta: {
      schemaVersion: "1.0",
      labelTranslationKey: "questions.research_methods"
    },
    options: [
      {
        type: "option",
        attributes: {
          label: "Interviews",
          value: "interviews",
          checked: true
        }
      },
      {
        type: "option",
        attributes: {
          label: "Surveys",
          value: "surveys",
          checked: false
        }
      },
      {
        type: "option",
        attributes: {
          label: "Observations",
          value: "observations",
          checked: true
        }
      },
      {
        type: "option",
        attributes: {
          label: "Focus Groups",
          value: "focus_groups",
          checked: true
        }
      }
    ]
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render checkboxes with correct labels and values', () => {
    render(
      <CheckboxesQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedCheckboxValues={['surveys', 'observations']}
        handleCheckboxGroupChange={mockHandleCheckboxChange}
      />
    );

    // Check that all checkboxes are rendered
    expect(screen.getByLabelText('Interviews')).toBeInTheDocument();
    expect(screen.getByLabelText('Surveys')).toBeInTheDocument();
    expect(screen.getByLabelText('Observations')).toBeInTheDocument();
    expect(screen.getByLabelText('Focus Groups')).toBeInTheDocument();
  });

  it('should check the correct checkboxes based on selectedCheckboxValues', () => {
    render(
      <CheckboxesQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedCheckboxValues={['surveys', 'observations']}
        handleCheckboxGroupChange={mockHandleCheckboxChange}
      />
    );
    expect(screen.getByLabelText('Surveys')).toBeChecked();
    expect(screen.getByLabelText('Observations')).toBeChecked();
    expect(screen.getByLabelText('Interviews')).not.toBeChecked();
    expect(screen.getByLabelText('Focus Groups')).not.toBeChecked();
  });

  it('should check the correct checkboxes based on initial checked attribute if selectedCheckboxValues is empty', () => {
    render(
      <CheckboxesQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedCheckboxValues={[]}
        handleCheckboxGroupChange={mockHandleCheckboxChange}
      />
    );
    expect(screen.getByLabelText('Interviews')).toBeChecked();
    expect(screen.getByLabelText('Observations')).toBeChecked();
    expect(screen.getByLabelText('Focus Groups')).toBeChecked();
    expect(screen.getByLabelText('Surveys')).not.toBeChecked();
  });

  it('should call handleCheckboxGroupChange with correct values when a checkbox is clicked', () => {
    render(
      <CheckboxesQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedCheckboxValues={['surveys']}
        handleCheckboxGroupChange={mockHandleCheckboxChange}
      />
    );
    fireEvent.click(screen.getByLabelText('Interviews'));
    expect(mockHandleCheckboxChange).toHaveBeenCalled();
    expect(mockHandleCheckboxChange).toHaveBeenCalledWith(expect.arrayContaining(['surveys', 'interviews']));
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <CheckboxesQuestionComponent
        parsedQuestion={mockParsedQuestion}
        selectedCheckboxValues={['surveys']}
        handleCheckboxGroupChange={mockHandleCheckboxChange}
      />
    );
    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    })
  })
});