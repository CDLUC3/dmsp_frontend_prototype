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
        customTypes: [{ type: 'Controlled access', description: 'Restricts access to certain areas' }],
        selectedDefaults: [],
      },
    },
    newAccessLevel: { type: '', description: '' },
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
      expect(screen.getByLabelText('researchOutput.accessLevels.labels.defineAccessLevels')).toBeInTheDocument();
    });

    it('should render with correct initial structure', () => {
      renderComponent();
      expect(screen.getByLabelText('researchOutput.accessLevels.labels.defineAccessLevels')).toBeInTheDocument();
      expect(screen.getByText('researchOutput.accessLevels.legends.default')).toBeInTheDocument();
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
              customTypes: [],
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
              customTypes: [],
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
          customTypes: [
            { type: 'Custom Level 1', description: 'Description for Custom Level 1' },
            { type: 'Custom Level 2', description: 'Description for Custom Level 2' }
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
              customTypes: [],
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText('researchOutput.accessLevels.legends.myAccessLevels')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it('should call onModeChange when access level mode is changed', async () => {
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
              customTypes: [],
              selectedDefaults: [],
            },
          },
          setNewAccessLevel,
        });
        const input = screen.getByLabelText('researchOutput.accessLevels.labels.enterAccessLevel');
        fireEvent.change(input, { target: { value: 'New Access Level' } });
        expect(setNewAccessLevel).toHaveBeenCalledWith({ type: 'New Access Level', description: '' });
      });

      it('should call onAddCustomType when add button is clicked in mine mode', () => {
        const onAddCustomType = jest.fn();
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customTypes: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { type: 'New Level', description: 'Description for New Level' },
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
              customTypes: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { type: 'New Level', description: 'Description for New Level' },
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
              customTypes: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { type: ' ', description: '' },
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
              customTypes: [],
              selectedDefaults: [],
            },
          },
          newAccessLevel: { type: 'Valid Access Level', description: 'Description for Valid Access Level' },
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
              customTypes: [
                { type: 'Test Level', description: 'Description for Custom Level 1' },
                { type: 'Custom Level 2', description: 'Description for Custom Level 2' }
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
      it('should handle missing accessLevelsConfig gracefully', () => {
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
              customTypes: [],
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText('researchOutput.accessLevels.legends.myAccessLevels')).toBeInTheDocument();
        expect(screen.queryByText('x')).not.toBeInTheDocument();
      });

      it('should handle multiple custom levels correctly in mine mode', () => {
        const multipleCustomLevels = [
          { type: 'Level A', description: 'Description for Level A' },
          { type: 'Level B', description: 'Description for Level B' },
          { type: 'Level C', description: 'Description for Level C' }
        ];
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customTypes: multipleCustomLevels,
              selectedDefaults: [],
            },
          },
        });
        multipleCustomLevels.forEach(level => {
          expect(screen.getByText(level.type)).toBeInTheDocument();
        });
        expect(screen.getAllByText('x')).toHaveLength(3);
      });

      it('should render correctly with special characters in custom access level names', () => {
        const specialLevel = [{ type: 'Controlled (v2.0 - Enhanced)', description: 'Description for Controlled (v2.0 - Enhanced)' }];
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'mine',
              customTypes: specialLevel,
              selectedDefaults: [],
            },
          },
        });
        expect(screen.getByText(specialLevel[0].type)).toBeInTheDocument();
        expect(screen.getByText('x')).toBeInTheDocument();
      });

      it('should display all 3 default access levels', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
            accessLevelsConfig: {
              mode: 'defaults',
              customTypes: [],
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
