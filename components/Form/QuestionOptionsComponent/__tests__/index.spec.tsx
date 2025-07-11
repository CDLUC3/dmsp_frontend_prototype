import React, { ReactNode } from 'react';
import { fireEvent, render, screen } from '@/utils/test-utils';
import { RichTranslationValues } from 'next-intl';
import QuestionOptionsComponent
  from '@/components/Form/QuestionOptionsComponent';

type MockUseTranslations = {
  (key: string, ...args: unknown[]): string;
  rich: (key: string, values?: RichTranslationValues) => ReactNode;
};

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: MockUseTranslations = ((key: string) => key) as MockUseTranslations;

    mockUseTranslations.rich = (key, values) => {
      const p = values?.p;
      if (typeof p === 'function') {
        return p(key); // Can return JSX
      }
      return key; // fallback
    };

    return mockUseTranslations;
  }),
}));

const mockQuestionJSON = "{\"meta\":{\"schemaVersion\":\"1.0\"},\"type\":\"radioButtons\",\"options\":[{\"type\":\"option\",\"attributes\":{\"label\":\"Option 1\",\"value\":\"1\",\"selected\":false}},{\"type\":\"option\",\"attributes\":{\"label\":\"Option 2\",\"value\":\"2\",\"selected\":true}}]}"


type Row = {
  id?: number | null;
  text: string;
  isSelected?: boolean | null;
};

describe('QuestionOptionsComponent', () => {
  let rows: Row[], setRows: jest.Mock;

  beforeEach(() => {
    rows = [
      { id: 1, text: 'Option 1', isSelected: false },
    ];
    setRows = jest.fn();
  });

  it('should render initial rows correctly', () => {
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={mockQuestionJSON}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    expect(screen.getByLabelText(/labels\.order/)).toBeInTheDocument();
    expect(screen.getByLabelText(/labels\.text/)).toBeInTheDocument();
    expect(screen.getByLabelText('labels.default')).toBeInTheDocument();
  });

  it('should add a new row when the add button is clicked', () => {
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={mockQuestionJSON}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });
    fireEvent.click(addButton);

    expect(setRows).toHaveBeenCalledWith([{ "id": 1, "isSelected": false, "text": "Option 1" }, { "id": 2, "isSelected": false, "text": "" }]);
    expect(screen.getByText('announcements.rowAdded')).toBeInTheDocument();
  });

  it('should update text field correctly', () => {
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={mockQuestionJSON}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    const textInput = screen.getByLabelText(/labels\.text/);
    fireEvent.change(textInput, { target: { value: 'Updated Option' } });

    expect(setRows).toHaveBeenCalledWith([{ "id": 1, "isSelected": false, "text": "Updated Option" }]);
  });

  it('should handle case where questionJSON is passed as an object', () => {
    const questionJSONObj = JSON.parse(mockQuestionJSON);
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={questionJSONObj}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    const textInput = screen.getByLabelText('labels.text');
    fireEvent.change(textInput, { target: { value: 'Updated Option' } });

    expect(setRows).toHaveBeenCalledWith([{ "id": 1, "isSelected": false, "text": "Updated Option" }]);
  });

  it('should set a row as default when checkbox is clicked', () => {
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={mockQuestionJSON}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    const defaultCheckbox = screen.getByLabelText('labels.default');
    fireEvent.click(defaultCheckbox);


    expect(setRows).toHaveBeenCalledWith([{ "id": 1, "isSelected": true, "text": "Option 1" }]);
  });

  it('should allow checking of multiple checkboxes', () => {
    const mockCheckboxJSON = "{\"type\":\"checkBoxes\",\"meta\":{\"schemaVersion\":\"1.0\",\"labelTranslationKey\":\"questions.research_methods\"},\"options\":[{\"type\":\"option\",\"attributes\":{\"label\":\"Interviews\",\"value\":\"interviews\",\"checked\":true}},{\"type\":\"option\",\"attributes\":{\"label\":\"Surveys\",\"value\":\"surveys\",\"checked\":false}},{\"type\":\"option\",\"attributes\":{\"label\":\"Observations\",\"value\":\"observations\",\"checked\":true}},{\"type\":\"option\",\"attributes\":{\"label\":\"Focus Groups\",\"value\":\"focus_groups\",\"checked\":true}}]}"

    // Use a stateful wrapper so setRows updates the UI
    function Wrapper() {
      const [rows, setRows] = React.useState<Row[]>([
        { id: 1, text: 'Option 1', isSelected: false }
      ]);
      return (
        <QuestionOptionsComponent
          rows={rows}
          setRows={setRows}
          questionJSON={mockCheckboxJSON}
          formSubmitted={true}
          setFormSubmitted={jest.fn()}
        />
      );
    }

    render(<Wrapper />);

    const textInput = screen.getByLabelText(/labels\.text/);
    fireEvent.change(textInput, { target: { value: 'Option 1' } });

    const defaultCheckbox = screen.getByTestId('default-1');
    fireEvent.click(defaultCheckbox);


    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });
    fireEvent.click(addButton);

    const defaultCheckbox2 = screen.getByTestId('default-2');
    fireEvent.click(defaultCheckbox2);

    // Assert that there are now two checkboxes
    expect(screen.getAllByTestId(/^default-/)).toHaveLength(2);

    //Delete the second row
    const removeButtons = screen.getAllByLabelText('buttons.deleteRow');
    fireEvent.click(removeButtons[1]); // Click the first one

    expect(rows).toEqual([
      { id: 1, text: 'Option 1', isSelected: false }
    ]);
  });

  it('should add a row when the add button is clicked', () => {
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={mockQuestionJSON}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    const addButton = screen.getByRole('button', { name: /buttons.addRow/i });
    fireEvent.click(addButton);

    expect(setRows).toHaveBeenCalledWith([{ "id": 1, "isSelected": false, "text": "Option 1" }, { "id": 2, "isSelected": false, "text": "" }]);
  });

  it('should remove a row when delete button is clicked', () => {
    render(<QuestionOptionsComponent
      rows={rows}
      setRows={setRows}
      questionJSON={mockQuestionJSON}
      formSubmitted={true}
      setFormSubmitted={jest.fn()}
    />);

    const deleteButton = screen.getByRole('button', { name: /buttons.deleteRow/i });
    fireEvent.click(deleteButton);

    expect(setRows).toHaveBeenCalledWith([]);
  });

  it('should set the correct row as default and unset others', () => {
    const mockSetRows = jest.fn();
    const rows = [
      { id: 1, orderNumber: 1, text: 'Option 1', isSelected: false, questionId: 1 },
      { id: 2, orderNumber: 2, text: 'Option 2', isSelected: false, questionId: 1 },
    ];

    const { getByLabelText } = render(
      <QuestionOptionsComponent
        rows={rows}
        setRows={mockSetRows}
        questionJSON={mockQuestionJSON}
        setFormSubmitted={jest.fn()}
      />
    );

    const defaultCheckbox = getByLabelText('Set row 2 as default');
    fireEvent.click(defaultCheckbox);

    expect(mockSetRows).toHaveBeenCalledTimes(1);

    const updatedRows = mockSetRows.mock.calls[0][0];
    expect(updatedRows).toEqual([
      { id: 1, orderNumber: 1, text: 'Option 1', isSelected: false, questionId: 1 },
      { id: 2, orderNumber: 2, text: 'Option 2', isSelected: true, questionId: 1 },
    ]);
    expect(updatedRows).toEqual([
      { id: 1, orderNumber: 1, text: 'Option 1', isSelected: false, questionId: 1 },
      { id: 2, orderNumber: 2, text: 'Option 2', isSelected: true, questionId: 1 }, // <== isDefault changed
    ]);
  });
});
