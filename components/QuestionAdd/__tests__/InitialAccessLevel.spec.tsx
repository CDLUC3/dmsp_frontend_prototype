import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import InitialAccessLevelField from '../InitialAccessLevel';
import { AccessLevelsFieldProps } from '@/app/types';

expect.extend(toHaveNoViolations);

describe('InitialAccessLevelField', () => {
  const defaultProps: AccessLevelsFieldProps = {
    field: {
      id: 'accessLevels',
      label: 'Access Levels',
      enabled: true,
      accessLevelsConfig: {
        mode: 'defaults',
        customLevels: [{ level: 'Controlled access', description: 'Restricts access to certain areas' }],
        selectedDefaults: [],
      },
    },
    newAccessLevel: { level: '', description: '' },
    setNewAccessLevel: jest.fn(),
    onModeChange: jest.fn(),
    onAddCustomType: jest.fn(),
    onRemoveCustomType: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props: Partial<AccessLevelsFieldProps> = {}) => {
    return render(<InitialAccessLevelField {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderComponent();
      //expect(screen.getByLabelText('researchOutput.accessLevels.labels.defineAccessLevels')).toBeInTheDocument();
      expect(screen.getByText('researchOutput.accessLevels.legends.default')).toBeInTheDocument();

    });

    it('should render with correct initial structure', () => {
      renderComponent();
      //expect(screen.getByLabelText('researchOutput.accessLevels.labels.defineAccessLevels')).toBeInTheDocument();
      expect(screen.getByText('researchOutput.accessLevels.legends.default')).toBeInTheDocument();
    });

    it.skip('should render all access level options in the dropdown', async () => {
      renderComponent();
      const selectButton = screen.getByTestId('select-button');
      await userEvent.click(selectButton);

      // Check that both options are rendered
      expect(screen.getByRole('option', { name: 'Use defaults' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Customize output list' })).toBeInTheDocument();
    });

    it('should handle customLevel.level being undefined or empty', () => {
      const customLevels = [
        { level: undefined, description: 'No level' },
        { level: '', description: 'Empty level' },
      ];
      renderComponent({
        field: {
          ...defaultProps.field,
          accessLevelsConfig: {
            mode: 'mine',
            customLevels,
            selectedDefaults: [],
          },
        },
      });

      // All custom types should render with fallback '' for type
      customLevels.forEach((_, index) => {
        const span = document.getElementById(`custom-level-${index}`);
        expect(span).toBeInTheDocument();
        expect(span).toHaveTextContent('');
      });

    });

    it('should pass axe accessibility test', async () => {
      const { container } = render(
        <InitialAccessLevelField {...defaultProps} />
      );
      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    describe('Defaults Mode', () => {
      it('should display default access levels when mode is "defaults"', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'defaults',
              customLevels: [],
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText('Controlled access')).toBeInTheDocument();
        expect(screen.getByText('Unrestricted access')).toBeInTheDocument();
        expect(screen.getByText('Other')).toBeInTheDocument();
      });

      it('should not display custom access level section in defaults mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'defaults',
              customLevels: [],
              selectedDefaults: [],
            },
          },
        });
        expect(screen.queryByText('researchOutput.accessLevels.legends.myAccessLevels')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('researchOutput.accessLevels.labels.enterAccessLevel')).not.toBeInTheDocument();
      });
    });

    describe('Mine Mode', () => {
      const mineField = {
        ...defaultProps.field,
        accessLevelsConfig: {
          mode: 'mine' as const,
          customLevels: [
            { level: 'Custom Level 1', description: 'Description for Custom Level 1' },
            { level: 'Custom Level 2', description: 'Description for Custom Level 2' }
          ],
          selectedDefaults: [],
        },
      };

      it('should display custom access level section when mode is "mine"', () => {
        renderComponent({ field: mineField });
        expect(screen.getByText('researchOutput.accessLevels.legends.myAccessLevels')).toBeInTheDocument();
        expect(screen.getByLabelText('researchOutput.accessLevels.labels.enterAccessLevel')).toBeInTheDocument();
      });

      it('should display custom access levels when they exist', () => {
        renderComponent({ field: mineField });
        expect(screen.getByText('Custom Level 1')).toBeInTheDocument();
        expect(screen.getByText('Custom Level 2')).toBeInTheDocument();
      });

      it('should display remove buttons for custom access levels', () => {
        renderComponent({ field: mineField });
        const removeButtons = screen.getAllByText('x');
        expect(removeButtons).toHaveLength(2);
      });

      it('should not display custom levels list when no custom levels exist', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText('researchOutput.accessLevels.legends.myAccessLevels')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it.skip('should call onModeChange when access level mode is changed', async () => {
        const onModeChange = jest.fn();
        renderComponent({ onModeChange });
        // Click the visible dropdown button
        const selectButton = screen.getByTestId('select-button');
        await userEvent.click(selectButton);

        // Find and click the "Customize output list" option
        const mineOption = screen.getByRole('option', { name: 'Customize output list' });
        await userEvent.click(mineOption);

        expect(onModeChange).toHaveBeenCalledWith('mine');
      });

      it('should call setNewAccessLevel when input value changes in mine mode', () => {
        const setNewAccessLevel = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          setNewAccessLevel,
        });
        const input = screen.getByLabelText('researchOutput.accessLevels.labels.enterAccessLevel');
        fireEvent.change(input, { target: { value: 'New Access Level' } });
        expect(setNewAccessLevel).toHaveBeenCalledWith({ level: 'New Access Level', description: '' });
      });

      it('should call setNewAccessLevel when description input value changes in mine mode', () => {
        const setNewAccessLevel = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          setNewAccessLevel,
        });
        const descInput = screen.getByLabelText('researchOutput.accessLevels.labels.accessLevelDescription');
        fireEvent.change(descInput, { target: { value: 'New Description' } });
        expect(setNewAccessLevel).toHaveBeenCalledWith({ level: '', description: 'New Description' });
      });

      it('should call onAddCustomType when Enter key is pressed in description input', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { level: '', description: 'New Description' },
          onAddCustomType,
        });
        const descInput = screen.getByLabelText('researchOutput.accessLevels.labels.accessLevelDescription');
        fireEvent.keyDown(descInput, { key: 'Enter' });
        expect(onAddCustomType).toHaveBeenCalled();
      });

      it('should call onAddCustomType when add button is clicked in mine mode', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { level: 'New Level', description: 'Description for New Level' },
          onAddCustomType,
        });
        const addButton = screen.getByText('researchOutput.accessLevels.buttons.addAccessLevel');
        fireEvent.click(addButton);
        expect(onAddCustomType).toHaveBeenCalled();
      });

      it('should call onAddCustomType when Enter key is pressed in mine mode', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { level: 'New Level', description: 'Description for New Level' },
          onAddCustomType,
        });
        const input = screen.getByLabelText('researchOutput.accessLevels.labels.enterAccessLevel');
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(onAddCustomType).toHaveBeenCalled();
      });

      it('should disable add button when newAccessLevel is empty or whitespace in mine mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { level: ' ', description: '' },
        });
        const addButton = screen.getByText('researchOutput.accessLevels.buttons.addAccessLevel');
        expect(addButton).toBeDisabled();
      });

      it('should enable add button when newAccessLevel has content in mine mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { level: 'Valid Access Level', description: 'Description for Valid Access Level' },
        });
        const addButton = screen.getByText('researchOutput.accessLevels.buttons.addAccessLevel');
        expect(addButton).not.toBeDisabled();
      });

      it('should call onRemoveCustomType when remove button is clicked', () => {
        const onRemoveCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [
                { level: 'Test Level', description: 'Description for Custom Level 1' },
                { level: 'Custom Level 2', description: 'Description for Custom Level 2' }
              ],
              selectedDefaults: [],
            },
          },
          onRemoveCustomType,
        });
        const removeButtons = screen.getAllByText('x');
        fireEvent.click(removeButtons[0]);
        expect(onRemoveCustomType).toHaveBeenCalledWith('Test Level');
      });
    });

    describe('Props Validation', () => {
      it.skip('should handle missing accessLevelsConfig gracefully', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: undefined,
          },
        });
        // Check the visible value in the custom dropdown
        const selectButton = screen.getByTestId('select-button');
        expect(selectButton).toHaveTextContent('Use defaults');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty custom levels array in mine mode', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: [],
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText('researchOutput.accessLevels.legends.myAccessLevels')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });

      it('should handle multiple custom levels correctly in mine mode', () => {
        const multipleCustomLevels = [
          { level: 'Level A', description: 'Description for Level A' },
          { level: 'Level B', description: 'Description for Level B' },
          { level: 'Level C', description: 'Description for Level C' }
        ];
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: multipleCustomLevels,
              selectedDefaults: [],
            },
          },
        });
        multipleCustomLevels.forEach(level => {
          expect(screen.getByText(level.level)).toBeInTheDocument();
        });
        expect(screen.getAllByText('x')).toHaveLength(3);
      });

      it('should render correctly with special characters in custom access level names', () => {
        const specialLevel = [{ level: 'Controlled (v2.0 - Enhanced)', description: 'Description for Controlled (v2.0 - Enhanced)' }];
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customLevels: specialLevel,
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText(specialLevel[0].level)).toBeInTheDocument();
        expect(screen.getByText('x')).toBeInTheDocument();
      });

      it('should display all 3 default access levels', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'defaults',
              customLevels: [],
              selectedDefaults: [],
            },
          },
        });
        const expectedLevels = [
          'Controlled access',
          'Unrestricted access',
          'Other'
        ];
        expectedLevels.forEach(level => {
          expect(screen.getByText(level)).toBeInTheDocument();
        });
      });
    });
  });
});
