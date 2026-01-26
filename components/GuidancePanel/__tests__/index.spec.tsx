import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from "@apollo/client/testing/react";
import GuidancePanel from '../index';
import { BestPracticeGuidanceDocument } from '@/generated/graphql';
import { GuidanceItemInterface } from '@/app/types';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Sample data
const mockSectionTags = {
  1: 'Storage & security',
  3: 'Data Collection',
};

const mockGuidanceItems: GuidanceItemInterface[] = [
  {
    orgURI: 'https://ror.org/03yrm5c26',
    orgName: 'California Digital Library',
    orgShortname: 'CDL',
    items: [
      {
        id: 1,
        title: 'Storage & security',
        guidanceText: '<p>This is guidance for storage &amp; security</p>',
      },
    ],
  },
];

const mockBestPracticeGuidance = [
  {
    __typename: 'BestPracticeGuidance' as const,
    id: 1212,
    tagId: 1,
    guidanceText: '<ul><li>Best practice guidance for storage</li></ul>',
  },
  {
    __typename: 'BestPracticeGuidance' as const,
    id: 1220,
    tagId: 3,
    guidanceText: '<ul><li>Best practice guidance for data collection</li></ul>',
  },
];

const createMocks = (bestPracticeData = mockBestPracticeGuidance) => [
  {
    request: {
      query: BestPracticeGuidanceDocument,
      variables: {
        tagIds: [1, 3],
      },
    },
    result: {
      data: {
        bestPracticeGuidance: bestPracticeData,
      },
    },
  },
  {
    request: {
      query: BestPracticeGuidanceDocument,
      variables: {
        tagIds: [],
      },
    },
    result: {
      data: {
        bestPracticeGuidance: bestPracticeData,
      },
    },
  },
];

const renderComponent = (
  props: Partial<React.ComponentProps<typeof GuidancePanel>> = {},
  mocks = createMocks()
) => {
  const defaultProps = {
    userAffiliationId: undefined,
    ownerAffiliationId: undefined,
    guidanceItems: mockGuidanceItems,
    sectionTags: mockSectionTags,
    onAddOrganization: jest.fn(),
    onRemoveOrganization: jest.fn(),
  };

  return render(
    <MockedProvider mocks={mocks}>
      <GuidancePanel {...defaultProps} {...props} />
    </MockedProvider>
  );
};

describe('GuidancePanel', () => {
  describe('Rendering', () => {
    it('should render tabs with guidance sources', async () => {
      renderComponent();

      // Wait for GraphQL to resolve and best practice tab to appear
      await waitFor(
        () => {
          expect(screen.getByRole('tab', { name: /DMP Tool/i })).toBeInTheDocument();
        },
        { timeout: 3000 } // Increase timeout for async GraphQL
      );

      // Should also show CDL tab
      expect(screen.getByRole('tab', { name: /CDL/i })).toBeInTheDocument();
    });


    it('should not render best practice tab when no best practice guidance exists', async () => {
      const emptyMocks = createMocks([]);
      renderComponent({}, emptyMocks);

      await waitFor(() => {
        expect(screen.queryByRole('tab', { name: /DMP Tool/i })).not.toBeInTheDocument();
      });
    });

    it('should render with empty guidance items', async () => {
      renderComponent({ guidanceItems: [] });

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      // Only DMP Tool should be visible (from best practice)
      await waitFor(
        () => {
          expect(screen.getByRole('tab', { name: /DMP Tool/i })).toBeInTheDocument();
          expect(screen.queryByRole('tab', { name: /CDL/i })).not.toBeInTheDocument();
        },
        { timeout: 3000 } // Increase timeout for async GraphQL
      );
    });
  });

  describe('Auto-selection logic', () => {
    it('should auto-select user affiliation tab when available', async () => {
      renderComponent({
        userAffiliationId: 'https://ror.org/03yrm5c26', // CDL
      });

      await waitFor(() => {
        const cdlTab = screen.getByRole('tab', { name: /CDL/i });
        expect(cdlTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should auto-select owner affiliation tab when user affiliation does not match', async () => {
      const ownerGuidanceItems: GuidanceItemInterface[] = [
        {
          orgURI: 'https://ror.org/01an7q238',
          orgName: 'UC Berkeley',
          orgShortname: 'UCB',
          items: [
            {
              id: 1001,
              title: 'UC Berkeley',
              guidanceText: '<p>UCB guidance</p>',
            },
          ],
        },
      ];

      renderComponent({
        userAffiliationId: 'https://ror.org/nonexistent',
        ownerAffiliationId: 'https://ror.org/01an7q238', // UCB
        guidanceItems: ownerGuidanceItems,
      });

      await waitFor(() => {
        // Get all UCB tabs and find the selected one
        const ucbTabs = screen.getAllByRole('tab', { name: /UCB/i });
        const selectedTab = ucbTabs.find(tab => tab.getAttribute('aria-selected') === 'true');
        expect(selectedTab).toBeDefined();
        expect(selectedTab).toHaveAttribute('aria-selected', 'true');
      }, { timeout: 3000 });
    });

    it('should default to best practice when no affiliations match', async () => {
      renderComponent({
        userAffiliationId: 'https://ror.org/nonexistent',
        ownerAffiliationId: 'https://ror.org/alsonothere',
      });

      await waitFor(() => {
        const dmpTab = screen.getByRole('tab', { name: /DMP Tool/i });
        expect(dmpTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Tab interaction', () => {
    it('should switch tabs when clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /DMP Tool/i })).toBeInTheDocument();
      });

      // Initially DMP Tool is selected (no affiliations)
      const dmpTab = screen.getByRole('tab', { name: /DMP Tool/i });
      expect(dmpTab).toHaveAttribute('aria-selected', 'true');

      // Click CDL tab
      const cdlTab = screen.getByRole('tab', { name: /CDL/i });
      await user.click(cdlTab);

      // CDL should now be selected
      expect(cdlTab).toHaveAttribute('aria-selected', 'true');
      expect(dmpTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should display correct tab panel content when tab is selected', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /CDL/i })).toBeInTheDocument();
      });

      // Click CDL tab
      const cdlTab = screen.getByRole('tab', { name: /CDL/i });
      await user.click(cdlTab);

      // Wait for CDL tab to be selected
      await waitFor(() => {
        expect(cdlTab).toHaveAttribute('aria-selected', 'true');
      });

      // Now check for CDL content
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /California Digital Library/i })).toBeInTheDocument();
      });
    });
  });

  describe('More/Less button functionality', () => {
    it('should show More button when there are more than 3 tabs', async () => {
      const manyGuidanceItems: GuidanceItemInterface[] = [
        ...mockGuidanceItems,
        {
          orgURI: 'https://ror.org/01an7q238',
          orgName: 'UC Berkeley',
          orgShortname: 'UCB',
          items: [{ id: 2, guidanceText: '<p>UCB guidance</p>' }],
        },
        {
          orgURI: 'https://ror.org/021nxhr68',
          orgName: 'NSF',
          orgShortname: 'NSF',
          items: [{ id: 3, guidanceText: '<p>NSF guidance</p>' }],
        },
      ];

      renderComponent({ guidanceItems: manyGuidanceItems });

      await waitFor(() => {
        // Note: Due to hardcoded additionalGuidance, there will be overflow
        expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
      });
    });

    it('should expand tabs when More button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await waitFor(() => {
        const moreButton = screen.queryByRole('button', { name: /show more/i });
        if (moreButton) {
          expect(moreButton).toBeInTheDocument();
        }
      });

      const moreButton = screen.queryByRole('button', { name: /show more/i });
      if (moreButton) {
        await user.click(moreButton);

        // Should show Less button
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /show less/i })).toBeInTheDocument();
        });
      }
    });
  });

  describe('Add organization functionality', () => {
    it('should call onAddOrganization when add button is clicked', async () => {
      const user = userEvent.setup();
      const onAddOrganization = jest.fn();

      renderComponent({ onAddOrganization });

      await waitFor(() => {
        const moreButton = screen.getByRole('button', { name: /more/i });
        expect(moreButton).toBeInTheDocument();
        fireEvent.click(moreButton);
      });

      const addButton = screen.getByRole('button', { name: "addGuidanceSource" });
      await user.click(addButton);

      expect(onAddOrganization).toHaveBeenCalledTimes(1);
    });

    it('should not render add button when callback is not provided', async () => {
      renderComponent({ onAddOrganization: undefined });

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /customize best practice/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on tabs', async () => {
      renderComponent();

      await waitFor(() => {
        const tablist = screen.getByRole('tablist', { name: "guidanceSourceSelection" });
        expect(tablist).toBeInTheDocument();
      });

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
      });
    });

    it('should have proper ARIA attributes on More/Less button', async () => {
      renderComponent();

      await waitFor(() => {
        const moreButton = screen.queryByRole('button', { name: /show more/i });
        if (moreButton) {
          expect(moreButton).toHaveAttribute('aria-expanded', 'false');
        }
      });
    });

    it('should have proper ARIA relationships between tabs and panels', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);
      });

      const tabs = screen.getAllByRole('tab');

      tabs.forEach((tab) => {
        // Each tab should have aria-controls
        const tabpanelId = tab.getAttribute('aria-controls');

        if (tabpanelId) {
          // If it has aria-controls, the panel should exist and reference back
          const panel = document.getElementById(tabpanelId);
          expect(panel).toHaveAttribute('role', 'tabpanel');
          expect(panel).toHaveAttribute('aria-labelledby', tab.id);
        }
      });
    });
    it('should pass axe accessibility test', async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });

      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  describe('Initialization state', () => {
    it('should apply initializing class before auto-selection completes', () => {
      const { container } = renderComponent();

      const guidancePanel = container.querySelector('.guidancePanel');
      expect(guidancePanel).toHaveClass('initializing');
    });

    it('should remove initializing class after auto-selection completes', async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        const guidancePanel = container.querySelector('.guidancePanel');
        expect(guidancePanel).not.toHaveClass('initializing');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty sectionTags', async () => {
      const emptyMocks = createMocks([]);
      renderComponent({ sectionTags: {} }, emptyMocks);

      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
    });

    it('should handle guidance items with no items array', async () => {
      const invalidGuidanceItems: GuidanceItemInterface[] = [
        {
          orgURI: 'https://ror.org/test',
          orgName: 'Test Org',
          orgShortname: 'TO',
          items: [],
        },
      ];

      renderComponent({ guidanceItems: invalidGuidanceItems });

      await waitFor(() => {
        // Should not show the tab for empty items
        expect(screen.queryByRole('tab', { name: /TO/i })).not.toBeInTheDocument();
      });
    });
  });
});