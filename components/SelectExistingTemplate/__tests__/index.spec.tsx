import React from 'react';
import { render, screen } from '@/utils/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import TemplateSelectTemplatePage from '../index';
import {
  useAddTemplateMutation,
  usePublicVersionedTemplatesQuery,
  useUserAffiliationTemplatesQuery
} from '@/generated/graphql';
import { useRouter } from 'next/navigation';


expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

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


const mockPublicTemplates = [
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

const mockTemplates = [
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
  }
]
// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  mockHook(useAddTemplateMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
  mockHook(usePublicVersionedTemplatesQuery).mockReturnValue([() => mockPublicTemplates, { loading: false, error: undefined }]);
  mockHook(useUserAffiliationTemplatesQuery).mockReturnValue([() => mockTemplates, { loading: false, error: undefined }]);
};


describe('TemplateSelectTemplatePage', () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    setupMocks();
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    window.scrollTo = jest.fn();
  });

  it('renders the main content sections', () => {
    render(<TemplateSelectTemplatePage templateName="test" />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText('Template search')).toBeInTheDocument();

    expect(screen.getByRole('list', { name: 'Your templates' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Public templates' })).toBeInTheDocument();
  });

  it('renders NSF templates', () => {
    render(<TemplateSelectTemplatePage templateName="test" />);
    expect(screen.getByText('Arctic Data Center: NSF Polar Programs')).toBeInTheDocument();
    expect(screen.getByText('NSF Polar Expeditions')).toBeInTheDocument();
  });

  it('renders public templates', () => {
    render(<TemplateSelectTemplatePage templateName="test" />);
    expect(screen.getByText('General Research DMP')).toBeInTheDocument();
    expect(screen.getByText('Humanities Research DMP')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateSelectTemplatePage templateName="test" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
