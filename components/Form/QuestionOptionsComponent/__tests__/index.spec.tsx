import React from 'react';
import { render, screen, act, fireEvent } from '@/utils/test-utils';
import { useTranslations as OriginalUseTranslations } from 'next-intl';
import QuestionOptionsComponent from '@/components/Form/QuestionOptionsComponent';

type UseTranslationsType = ReturnType<typeof OriginalUseTranslations>;

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: UseTranslationsType = ((key: string) => key) as UseTranslationsType;

    /*eslint-disable @typescript-eslint/no-explicit-any */
    mockUseTranslations.rich = (
      key: string,
      values?: Record<string, any>
    ) => {
      // Handle rich text formatting
      if (values?.p) {
        return values.p(key); // Simulate rendering the `p` tag function
      }
      return key;
    };

    return mockUseTranslations;
  }),
}));

type Row = {
  id?: number | null;
  orderNumber: number;
  text: string;
  isDefault?: boolean | null;
  questionId: number;
};

describe('QuestionOptionsComponent', () => {
  let rows: Row[], setRows: jest.Mock;

  beforeEach(() => {
    rows = [
      { id: 1, orderNumber: 1, text: 'Option 1', isDefault: false, questionId: 123 },
    ];
    setRows = jest.fn();
  });

  it('should render initial rows correctly', () => {
    render(<QuestionOptionsComponent rows={rows} setRows={setRows} questionId={123} />);

    expect(screen.getByLabelText('labels.order')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.text')).toBeInTheDocument();
    expect(screen.getByLabelText('labels.default')).toBeInTheDocument();
  });

  it('should add a new row when the add button is clicked', () => {
    render(<QuestionOptionsComponent rows={rows} setRows={setRows} questionId={123} />);

    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });
    fireEvent.click(addButton);

    expect(setRows).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update text field correctly', () => {
    render(<QuestionOptionsComponent rows={rows} setRows={setRows} questionId={123} />);

    const textInput = screen.getByLabelText('labels.text');
    fireEvent.change(textInput, { target: { value: 'Updated Option' } });

    expect(setRows).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should set a row as default when checkbox is clicked', () => {
    render(<QuestionOptionsComponent rows={rows} setRows={setRows} questionId={123} />);

    const defaultCheckbox = screen.getByLabelText('labels.default');
    fireEvent.click(defaultCheckbox);

    expect(setRows).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should remove a row when delete button is clicked', () => {
    render(<QuestionOptionsComponent rows={rows} setRows={setRows} questionId={123} />);

    const deleteButton = screen.getByRole('button', { name: /buttons.deleteRow/i });
    fireEvent.click(deleteButton);

    expect(setRows).toHaveBeenCalledWith(expect.any(Function));
  });
});