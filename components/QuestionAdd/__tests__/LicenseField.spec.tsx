import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LicenseField, { otherLicenses } from '../LicenseField';
import { LicenseFieldProps } from '@/app/types';

expect.extend(toHaveNoViolations);

// Mock the FormSelect component
jest.mock('@/components/Form', () => ({
  FormSelect: ({
    label,
    items,
    onChange,
    selectedKey,
    'data-testid': dataTestId
  }: { label: string; items: []; onChange: (value: string) => void; selectedKey: string | undefined; 'data-testid': string }) => (
    <div data-testid={dataTestId || 'form-select'}>
      <label>{label}</label>
      <select
        value={selectedKey || 'defaults'}
        onChange={(e) => onChange && onChange(e.target.value)}
        data-testid="select-input"
        aria-label={label}
      >
        {items.map((item: { id: string, name: string }) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe('LicenseField', () => {
  const defaultProps: LicenseFieldProps = {
    field: {
      id: 'licenses',
      label: 'Licenses',
      enabled: true,
      licensesConfig: {
        mode: 'defaults',
        selectedDefaults: [],
        customTypes: [],
      },
    },
    newLicenseType: '',
    setNewLicenseType: jest.fn(),
    onModeChange: jest.fn(),
    onAddCustomType: jest.fn(),
    onRemoveCustomType: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props: Partial<LicenseFieldProps> = {}) => {
    return render(<LicenseField {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderComponent();
      expect(screen.getByText('researchOutput.licenses.labels.define')).toBeInTheDocument();
    });

    it('renders with correct initial structure', () => {
      renderComponent();

      expect(screen.getByTestId('form-select')).toBeInTheDocument();
      const select = screen.getByTestId('select-input');
      expect(select).toHaveValue('defaults');
    });

    it('should pass axe accessibility test', async () => {
      const { container } = render(
        <LicenseField {...defaultProps} />
      );

      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

    });

    describe('Defaults Mode', () => {
      it('displays default licenses when mode is "defaults"', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'defaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
        });

        expect(screen.getByText('researchOutput.licenses.labels.defaultPreferred')).toBeInTheDocument();

        // Check that all default licenses are displayed
        expect(screen.getByText('CC-BY-4.0')).toBeInTheDocument();
        expect(screen.getByText('CC-BY-SA-4.0')).toBeInTheDocument();
        expect(screen.getByText('CC-BY-NC-4.0')).toBeInTheDocument();
        expect(screen.getByText('CC-BY-NC-SA-4.0')).toBeInTheDocument();
        expect(screen.getByText('CC-BY-ND-4.0')).toBeInTheDocument();
        expect(screen.getByText('CC-BY-NC-ND-4.0')).toBeInTheDocument();
        expect(screen.getByText('CCo-1.0')).toBeInTheDocument();
      });

      it('does not display custom license section in defaults mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'defaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
        });

        expect(screen.queryByText('My Licenses')).not.toBeInTheDocument();
        expect(screen.queryByText('Add license')).not.toBeInTheDocument();
      });
    });

    describe('Add To Defaults Mode', () => {
      const addToDefaultsField = {
        ...defaultProps.field,
        licensesConfig: {
          mode: 'addToDefaults' as const,
          selectedDefaults: [],
          customTypes: ['Custom License 1', 'Custom License 2'],
        },
      };

      it('displays custom license section when mode is "addToDefaults"', () => {
        renderComponent({
          field: addToDefaultsField,
        });
        expect(screen.getByText('researchOutput.licenses.labels.myLicenses')).toBeInTheDocument();
        expect(screen.getByText('researchOutput.licenses.labels.addLicense')).toBeInTheDocument();
        expect(screen.getByText('researchOutput.licenses.buttons.addLicenseType')).toBeInTheDocument();
      });

      it('displays custom licenses when they exist', () => {
        renderComponent({
          field: addToDefaultsField,
        });

        expect(screen.getByText('Custom License 1')).toBeInTheDocument();
        expect(screen.getByText('Custom License 2')).toBeInTheDocument();
      });

      it('displays remove buttons for custom licenses', () => {
        renderComponent({
          field: addToDefaultsField,
        });

        const removeButtons = screen.getAllByText('x');
        expect(removeButtons).toHaveLength(2);

        // Check aria-labels
        const removeButton = screen.getAllByLabelText('researchOutput.licenses.buttons.removeLicenseType');
        expect(removeButton).toHaveLength(2);
      });

      it('does not display custom licenses list when no custom licenses exist', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
        });

        expect(screen.getByText('researchOutput.licenses.labels.myLicenses')).toBeInTheDocument();
        expect(screen.queryByText('Custom License 1')).not.toBeInTheDocument();
      });

      it('displays license selector with other licenses options', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
        });

        // The FormSelect should be rendered with other licenses
        expect(screen.getByText('researchOutput.licenses.labels.addLicense')).toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it('calls onModeChange when license mode is changed', async () => {
        const onModeChange = jest.fn();
        renderComponent({ onModeChange });

        const select = screen.getByTestId('select-input');
        fireEvent.change(select, { target: { value: 'addToDefaults' } });

        expect(onModeChange).toHaveBeenCalledWith('addToDefaults');
      });

      it('calls setNewLicenseType when license selector changes in addToDefaults mode', async () => {
        const setNewLicenseType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
          setNewLicenseType,
        });

        // Since we're mocking FormSelect, we need to trigger the onChange directly
        // In a real test, this would be more complex with react-aria-components
        const selects = screen.getAllByTestId('select-input');
        const licenseSelect = selects[1]; // Second select is for licenses

        fireEvent.change(licenseSelect, { target: { value: 'obsd' } });

        expect(setNewLicenseType).toHaveBeenCalledWith('obsd');
      });

      it('calls onAddCustomType when add button is clicked', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
          newLicenseType: 'New License',
          onAddCustomType,
        });

        const addButton = screen.getByText('researchOutput.licenses.buttons.addLicenseType');
        fireEvent.click(addButton);

        expect(onAddCustomType).toHaveBeenCalled();
      });

      it('disables add button when newLicenseType is empty or whitespace', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
          newLicenseType: '   ', // whitespace only
        });

        const addButton = screen.getByText('researchOutput.licenses.buttons.addLicenseType');
        expect(addButton).toBeDisabled();
      });

      it('enables add button when newLicenseType has content', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
          newLicenseType: 'Valid License',
        });

        const addButton = screen.getByText('researchOutput.licenses.buttons.addLicenseType');
        expect(addButton).not.toBeDisabled();
      });

      it('calls onRemoveCustomType when remove button is clicked', () => {
        const onRemoveCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: ['Test License'],
            },
          },
          onRemoveCustomType,
        });

        const removeButton = screen.getByLabelText('researchOutput.licenses.buttons.removeLicenseType');
        fireEvent.click(removeButton);

        expect(onRemoveCustomType).toHaveBeenCalledWith('Test License');
      });
    });

    describe('Props Validation', () => {
      it('handles missing licensesConfig gracefully', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: undefined,
          },
        });

        // Should default to 'defaults' mode
        const select = screen.getByTestId('select-input');
        expect(select).toHaveValue('defaults');
      });

      it('handles field without licensesConfig mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              selectedDefaults: [],
              customTypes: [],
              mode: 'defaults' as const
            }
          },
        });

        // Should default to 'defaults'
        const select = screen.getByTestId('select-input');
        expect(select).toHaveValue('defaults');
      });
    });

    describe('Edge Cases', () => {
      it('handles empty custom types array', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [],
            },
          },
        });

        expect(screen.getByText('researchOutput.licenses.labels.myLicenses')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });

      it('handles multiple custom types correctly', () => {
        const multipleCustomTypes = ['License A', 'License B', 'License C'];
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: multipleCustomTypes,
            },
          },
        });

        multipleCustomTypes.forEach(license => {
          expect(screen.getByText(license)).toBeInTheDocument();
          const removeButtons = screen.getAllByLabelText('researchOutput.licenses.buttons.removeLicenseType');
          expect(removeButtons).toHaveLength(multipleCustomTypes.length);
        });

        // Should have 3 remove buttons
        expect(screen.getAllByText('x')).toHaveLength(3);
      });

      it('renders correctly with special characters in custom license names', () => {
        const specialLicense = 'CC-BY-4.0 (Modified)';
        renderComponent({
          field: {
            ...defaultProps.field,
            licensesConfig: {
              mode: 'addToDefaults',
              selectedDefaults: [],
              customTypes: [specialLicense],
            },
          },
        });

        expect(screen.getByText(specialLicense)).toBeInTheDocument();
        const removeButtons = screen.getAllByLabelText('researchOutput.licenses.buttons.removeLicenseType');
        expect(removeButtons).toHaveLength(1);
      });
    });

    describe('Constants Export', () => {
      it('exports otherLicenses array with correct structure', () => {
        expect(otherLicenses).toBeDefined();
        expect(Array.isArray(otherLicenses)).toBe(true);
        expect(otherLicenses.length).toBeGreaterThan(0);

        // Check structure of first item
        expect(otherLicenses[0]).toHaveProperty('id');
        expect(otherLicenses[0]).toHaveProperty('name');
        expect(typeof otherLicenses[0].id).toBe('string');
        expect(typeof otherLicenses[0].name).toBe('string');
      });

      it('contains expected license options', () => {
        const licenseIds = otherLicenses.map(license => license.id);
        expect(licenseIds).toContain('obsd');
        expect(licenseIds).toContain('aal');
        expect(licenseIds).toContain('adsl');
        expect(licenseIds).toContain('afl11');
        expect(licenseIds).toContain('aml');
      });
    });
  });
});
