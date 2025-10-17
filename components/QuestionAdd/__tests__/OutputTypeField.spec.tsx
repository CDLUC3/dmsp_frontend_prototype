import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import OutputTypeField from '../OutputTypeField';
import { OutputTypeFieldConfigProps } from '@/app/types';

expect.extend(toHaveNoViolations);

// Mock the FormSelect and FormInput components
jest.mock('@/components/Form', () => ({
  FormSelect: ({
    label,
    items,
    onChange,
    selectedKey,
    'data-testid': dataTestId
  }: any) => (
    <div data-testid={dataTestId || 'form-select'}>
      <label>{label}</label>
      <select
        value={selectedKey || 'defaults'}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-testid="select-input"
        aria-label={label}
      >
        {items.map((item: any) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  ),
  FormInput: ({
    label,
    value,
    onChange,
    onKeyDown,
    'data-testid': dataTestId,
  }: any) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      data-testid={dataTestId || 'form-input'}
      aria-label={label}
      placeholder={label}
    />
  ),
}));

describe('OutputTypeField', () => {
  const defaultProps: OutputTypeFieldConfigProps = {
    field: {
      id: 'outputTypes',
      label: 'Output Types',
      enabled: true,
      outputTypeConfig: {
        mode: 'defaults',
        customTypes: [],
      },
    },
    newOutputType: '',
    setNewOutputType: jest.fn(),
    onModeChange: jest.fn(),
    onAddCustomType: jest.fn(),
    onRemoveCustomType: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props: Partial<OutputTypeFieldConfigProps> = {}) => {
    return render(<OutputTypeField {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByTestId('form-select')).toBeInTheDocument();
    });

    it('renders with correct initial structure', () => {
      renderComponent();

      expect(screen.getByTestId('form-select')).toBeInTheDocument();
      const select = screen.getByTestId('select-input');
      expect(select).toHaveValue('defaults');
    });

    it('should pass axe accessibility test', async () => {
      const { container } = render(
        <OutputTypeField {...defaultProps} />
      );

      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    describe('Defaults Mode', () => {
      it('displays default output types when mode is "defaults"', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'defaults',
              customTypes: [],
            },
          },
        });

        // Check that all default output types are displayed
        expect(screen.getByText('Audiovisual')).toBeInTheDocument();
        expect(screen.getByText('Collection')).toBeInTheDocument();
        expect(screen.getByText('Data paper')).toBeInTheDocument();
        expect(screen.getByText('Dataset')).toBeInTheDocument();
        expect(screen.getByText('Event')).toBeInTheDocument();
        expect(screen.getByText('Image')).toBeInTheDocument();
        expect(screen.getByText('Interactive resource')).toBeInTheDocument();
        expect(screen.getByText('Model representation')).toBeInTheDocument();
        expect(screen.getByText('Physical object')).toBeInTheDocument();
        expect(screen.getByText('Service')).toBeInTheDocument();
        expect(screen.getByText('Software')).toBeInTheDocument();
        expect(screen.getByText('Sound')).toBeInTheDocument();
        expect(screen.getByText('Text')).toBeInTheDocument();
        expect(screen.getByText('Workflow')).toBeInTheDocument();
      });

      it('does not display custom output type section in defaults mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'defaults',
              customTypes: [],
            },
          },
        });

        expect(screen.queryByText('researchOutput.outputType.legends.myOutputs')).not.toBeInTheDocument();
        expect(screen.queryByText('researchOutput.outputType.buttons.addOutputType')).not.toBeInTheDocument();
      });
    });

    describe('Mine Mode', () => {
      const mineField = {
        ...defaultProps.field,
        outputTypeConfig: {
          mode: 'mine' as const,
          customTypes: ['Custom Type 1', 'Custom Type 2'],
        },
      };

      it('displays custom output type section when mode is "mine"', () => {
        renderComponent({
          field: mineField,
        });

        expect(screen.getByText('researchOutput.outputType.legends.myOutputs')).toBeInTheDocument();
        expect(screen.getByText('researchOutput.outputType.buttons.addOutputType')).toBeInTheDocument();
      });

      it('displays custom output types when they exist', () => {
        renderComponent({
          field: mineField,
        });

        expect(screen.getByText('Custom Type 1')).toBeInTheDocument();
        expect(screen.getByText('Custom Type 2')).toBeInTheDocument();
      });

      it('displays remove buttons for custom output types', () => {
        renderComponent({
          field: mineField,
        });

        const removeButtons = screen.getAllByText('x');
        expect(removeButtons).toHaveLength(2);
      });

      it('does not display custom types list when no custom types exist', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
        });

        expect(screen.getByText('researchOutput.outputType.legends.myOutputs')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });
    });

    describe('Add To Defaults Mode', () => {
      const addToDefaultsField = {
        ...defaultProps.field,
        outputTypeConfig: {
          mode: 'addToDefaults' as const,
          customTypes: ['Custom Type 1', 'Custom Type 2'],
        },
      };

      it('displays both default and custom output type sections when mode is "addToDefaults"', () => {
        renderComponent({
          field: addToDefaultsField,
        });

        expect(screen.getByText('researchOutput.outputType.legends.default')).toBeInTheDocument();
        expect(screen.getByText('researchOutput.outputType.legends.myOutputs')).toBeInTheDocument();
      });

      it('displays all default output types in addToDefaults mode', () => {
        renderComponent({
          field: addToDefaultsField,
        });

        expect(screen.getByText('Audiovisual')).toBeInTheDocument();
        expect(screen.getByText('Dataset')).toBeInTheDocument();
        expect(screen.getByText('Text')).toBeInTheDocument();
      });

      it('displays custom output types when they exist', () => {
        renderComponent({
          field: addToDefaultsField,
        });

        expect(screen.getByText('Custom Type 1')).toBeInTheDocument();
        expect(screen.getByText('Custom Type 2')).toBeInTheDocument();
      });

      it('displays remove buttons for custom output types', () => {
        renderComponent({
          field: addToDefaultsField,
        });

        const removeButtons = screen.getAllByText('x');
        expect(removeButtons).toHaveLength(2);
      });

      it('does not display custom types list when no custom types exist', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'addToDefaults',
              customTypes: [],
            },
          },
        });

        expect(screen.getByText('researchOutput.outputType.legends.myOutputs')).toBeInTheDocument();
        expect(screen.queryByText('Custom Type 1')).not.toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it('calls onModeChange when output type mode is changed', async () => {
        const onModeChange = jest.fn();
        renderComponent({ onModeChange });

        const select = screen.getByTestId('select-input');
        fireEvent.change(select, { target: { value: 'mine' } });

        expect(onModeChange).toHaveBeenCalledWith('mine');
      });

      it('calls setNewOutputType when input value changes in mine mode', () => {
        const setNewOutputType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
          setNewOutputType,
        });

        const input = screen.getByPlaceholderText('researchOutput.outputType.labels.enterOutputType');
        fireEvent.change(input, { target: { value: 'New Output Type' } });

        expect(setNewOutputType).toHaveBeenCalledWith('New Output Type');
      });

      it('calls onAddCustomType when add button is clicked in mine mode', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
          newOutputType: 'New Type',
          onAddCustomType,
        });

        const addButton = screen.getByText('researchOutput.outputType.buttons.addOutputType');
        fireEvent.click(addButton);

        expect(onAddCustomType).toHaveBeenCalled();
      });

      it('calls onAddCustomType when Enter key is pressed in mine mode', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
          newOutputType: 'New Type',
          onAddCustomType,
        });

        const input = screen.getByPlaceholderText('researchOutput.outputType.labels.enterOutputType');
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onAddCustomType).toHaveBeenCalled();
      });

      it('disables add button when newOutputType is empty or whitespace in mine mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
          newOutputType: '   ',
        });

        const addButton = screen.getByText('researchOutput.outputType.buttons.addOutputType');
        expect(addButton).toBeDisabled();
      });

      it('enables add button when newOutputType has content in mine mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
          newOutputType: 'Valid Output Type',
        });

        const addButton = screen.getByText('researchOutput.outputType.buttons.addOutputType');
        expect(addButton).not.toBeDisabled();
      });

      it('calls onRemoveCustomType when remove button is clicked', () => {
        const onRemoveCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: ['Test Type'],
            },
          },
          onRemoveCustomType,
        });

        const removeButton = screen.getByText('x');
        fireEvent.click(removeButton);

        expect(onRemoveCustomType).toHaveBeenCalledWith('Test Type');
      });

      it('calls onAddCustomType and setNewOutputType when add button is clicked in addToDefaults mode', () => {
        const onAddCustomType = jest.fn();
        const setNewOutputType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'addToDefaults',
              customTypes: [],
            },
          },
          newOutputType: 'New Type',
          onAddCustomType,
          setNewOutputType,
        });

        const addButtons = screen.getByText('researchOutput.outputType.buttons.addOutputType');
        fireEvent.click(addButtons); // Click the add button in custom types section

        expect(onAddCustomType).toHaveBeenCalled();
      });
    });

    describe('Props Validation', () => {
      it('handles missing outputTypeConfig gracefully', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: undefined,
          },
        });

        const select = screen.getByTestId('select-input');
        expect(select).toHaveValue('defaults');
      });

      it('handles field without outputTypeConfig mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              customTypes: [],
            } as any,
          },
        });

        const select = screen.getByTestId('select-input');
        expect(select).toHaveValue('defaults');
      });
    });

    describe('Edge Cases', () => {
      it('handles empty custom types array in mine mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [],
            },
          },
        });

        expect(screen.getByText('researchOutput.outputType.legends.myOutputs')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });

      it('handles multiple custom types correctly in mine mode', () => {
        const multipleCustomTypes = ['Type A', 'Type B', 'Type C'];
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: multipleCustomTypes,
            },
          },
        });

        multipleCustomTypes.forEach(type => {
          expect(screen.getByText(type)).toBeInTheDocument();
        });

        expect(screen.getAllByText('x')).toHaveLength(3);
      });

      it('renders correctly with special characters in custom output type names', () => {
        const specialType = 'Dataset (v2.0 - Enhanced)';
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'mine',
              customTypes: [specialType],
            },
          },
        });

        expect(screen.getByText(specialType)).toBeInTheDocument();
        expect(screen.getByText('x')).toBeInTheDocument();
      });

      it('displays all 14 default output types', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            outputTypeConfig: {
              mode: 'defaults',
              customTypes: [],
            },
          },
        });

        const expectedTypes = [
          'Audiovisual', 'Collection', 'Data paper', 'Dataset', 'Event', 'Image',
          'Interactive resource', 'Model representation', 'Physical object', 'Service',
          'Software', 'Sound', 'Text', 'Workflow'
        ];

        expectedTypes.forEach(type => {
          expect(screen.getByText(type)).toBeInTheDocument();
        });
      });
    });
  });
});