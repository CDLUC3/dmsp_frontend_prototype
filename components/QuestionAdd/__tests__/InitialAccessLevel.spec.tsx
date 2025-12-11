import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import InitialAccessLevelField from '../InitialAccessLevel';
import { AccessLevelsFieldProps } from '@/app/types';

expect.extend(toHaveNoViolations);

describe('InitialAccessLevelField', () => {
  const mockDefaultAccessLevels = [
    { label: 'Controlled access', value: 'controlled', description: 'Restricts access to certain areas' },
    { label: 'Unrestricted access', value: 'open', description: 'Allows access to all areas' },
    { label: 'Other', value: 'other', description: 'Other type of access' },
  ];

  const defaultProps: AccessLevelsFieldProps & { defaultAccessLevels: typeof mockDefaultAccessLevels } = {
    field: {
      id: 'accessLevels',
      label: 'Access Levels',
      enabled: true,
      accessLevelsConfig: {
        mode: 'defaults',
        customLevels: [{ label: 'Controlled access', value: 'controlled', description: 'Restricts access to certain areas' }],
        selectedDefaults: [],
      },
    },
    defaultAccessLevels: mockDefaultAccessLevels,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  type RenderComponentProps = Partial<AccessLevelsFieldProps> & {
    defaultAccessLevels?: typeof mockDefaultAccessLevels
  };

  const renderComponent = (props: RenderComponentProps = {}) => {
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
          },
        });
        expect(screen.queryByText('researchOutput.accessLevels.legends.myAccessLevels')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('researchOutput.accessLevels.labels.enterAccessLevel')).not.toBeInTheDocument();
      });
    });

    describe('Props Validation', () => {
      it('should handle empty defaultAccessLevels array', () => {
        renderComponent({
          defaultAccessLevels: [],
        });
        // Should render the fieldset but with no list items
        expect(screen.getByText('researchOutput.accessLevels.legends.default')).toBeInTheDocument();
        const listItems = screen.queryAllByRole('listitem');
        expect(listItems).toHaveLength(0);
      });

      it('should render all provided defaultAccessLevels', () => {
        const customAccessLevels = [
          { label: 'Public', value: 'public', description: 'Public access' },
          { label: 'Private', value: 'private', description: 'Private access' },
        ];
        renderComponent({
          defaultAccessLevels: customAccessLevels,
        });

        expect(screen.getByText('Public')).toBeInTheDocument();
        expect(screen.getByText('Private')).toBeInTheDocument();
        expect(screen.queryByText('Controlled access')).not.toBeInTheDocument();
      });

      it('should render info buttons for each access level', () => {
        renderComponent();

        const infoButtons = screen.getAllByLabelText('labels.clickForMoreInfo');
        expect(infoButtons).toHaveLength(mockDefaultAccessLevels.length);
      });

      it('should use value as key when available, fallback to index', () => {
        const accessLevelsWithoutValue = [
          { label: 'Test', value: '', description: 'Test' },
        ];
        renderComponent({
          defaultAccessLevels: accessLevelsWithoutValue,
        });

        expect(screen.getByText('Test')).toBeInTheDocument();
      });
    });

    describe('Edge Cases', () => {
      it('should display all 3 default access levels', () => {
        renderComponent({
          field: {
            ...defaultProps.field,
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
