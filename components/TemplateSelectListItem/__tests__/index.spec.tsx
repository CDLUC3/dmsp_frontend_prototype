import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import TemplateSelectListItem from '../index';
import {
  useAddTemplateMutation,
  usePublicVersionedTemplatesQuery,
  useUserAffiliationTemplatesQuery
} from '@/generated/graphql';
import { useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useAddTemplateMutation: jest.fn(),
  usePublicVersionedTemplatesQuery: jest.fn(),
  useUserAffiliationTemplatesQuery: jest.fn()
}));

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the debounce function
jest.mock('@/hooks/useFormatDate', () => ({
  useFormatDate: (fn: () => string) => fn,
}));


const mockPublicTemplates = {
  publicVersionedTemplates: [
    {
      description: "",
      errors: null,
      id: 1,
      modifiedById: 1,
      name: "Public template 1",
      owner: null,
      template: {
        id: 1,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 2,
      modifiedById: 2,
      name: "Public template 2",
      owner: null,
      template: {
        id: 2,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    }
  ]
}

const mockTemplates = {
  userAffiliationTemplates: [
    {
      description: "",
      errors: null,
      id: 3,
      modifiedById: 3,
      name: "Public template 3",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 3,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 4,
      modifiedById: 4,
      name: "Public template 4",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 4,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 5,
      modifiedById: 5,
      name: "Odd template 5",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 5,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    },
    {
      description: "",
      errors: null,
      id: 6,
      modifiedById: 6,
      name: "Public template 6",
      owner: {
        name: 'Institution',
        displayName: 'National Institution',
        searchName: 'NI'
      },
      template: {
        id: 6,
        __typename: "Template",
      },
      visibility: "PUBLIC"
    }
  ]
}

const mockOnSelect = jest.fn();

const props = {
  onSelect: mockOnSelect,
  item: {
    id: 10,
    template: {
      id: 20,
    },
    funder: 'NSF',
    title: 'NSF Dolphin Research',
    description: 'Researching dolphins in Fiji',
    lastRevisedBy: 10,
    lastUpdated: '10-25-2025',
    hasAdditionalGuidance: true
  },
}
// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useAddTemplateMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  mockHook(usePublicVersionedTemplatesQuery).mockReturnValue({ data: mockPublicTemplates, loading: false, error: undefined });
  mockHook(useUserAffiliationTemplatesQuery).mockReturnValue({ data: mockTemplates, loading: false, error: undefined });
};


describe('TemplateSelectListItem', () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    setupMocks();
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    window.scrollTo = jest.fn();
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('should render the main content', async () => {
    await act(async () => {
      render(
        <TemplateSelectListItem item={props.item} onSelect={props.onSelect} />
      );
    });

    const role = screen.getByRole('listitem');
    const description = screen.getByText(/Researching dolphins in Fiji/i);
    const selectButton = screen.getByRole('button', { name: /select/i });
    expect(role).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(selectButton).toBeInTheDocument();
    expect(screen.getByText('Last revised by: 10')).toBeInTheDocument();
    expect(screen.getByText('Last updated: 10-25-2025')).toBeInTheDocument();
    expect(screen.getByText('Your research organization has additional guidance')).toBeInTheDocument();
  });

  it('should call onSelect method when user clicks the onSelect button', async () => {
    await act(async () => {
      render(
        <TemplateSelectListItem item={props.item} onSelect={props.onSelect} />
      );
    });

    const selectButton = screen.getByRole('button', { name: /select/i });
    await act(async () => {
      fireEvent.click(selectButton);
    });
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should pass accessibility tests', async () => {
    /*Need to wrap the component in a div with role='list' to prevent 
    an accessibility error because the component uses role = 'listitem' */
    const { container } = render(
      <div role="list">
        <TemplateSelectListItem item={props.item} onSelect={props.onSelect} />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
