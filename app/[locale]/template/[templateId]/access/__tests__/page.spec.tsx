import React from 'react';
import {fireEvent, render, screen, waitFor} from '@/utils/test-utils';
import {axe, toHaveNoViolations} from 'jest-axe';
import TemplateAccessPage from '../page';
import {useParams} from 'next/navigation';
import {
  useAddTemplateCollaboratorMutation,
  useRemoveTemplateCollaboratorMutation,
  useTemplateCollaboratorsQuery
} from '@/generated/graphql';
import mockData from '../__mocks__/mockData.json';
import {mockScrollIntoView, mockScrollTo} from "@/__mocks__/common";

expect.extend(toHaveNoViolations);

//logECS
jest.mock('@/utils/clientLogger', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Mock the GraphQL hooks
jest.mock('@/generated/graphql', () => ({
  useTemplateCollaboratorsQuery: jest.fn(),
  useAddTemplateCollaboratorMutation: jest.fn(),
  useRemoveTemplateCollaboratorMutation: jest.fn()
}));

// Simple mock - we don't care about testing PageHeader here
jest.mock('@/components/PageHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-page-header" />
}));

describe('TemplateAccessPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    // Mock the GraphQL query hook to return mock data
    (useTemplateCollaboratorsQuery as jest.Mock).mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
    });

    (useAddTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { addTemplateCollaborator: { errors: [] } } }),
      { loading: false, error: undefined },
    ]);

    (useRemoveTemplateCollaboratorMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { removeTemplateCollaborator: true } }),
      { loading: false, error: undefined },
    ]);
  });

  it('renders the main content', () => {
    render(<TemplateAccessPage />);
    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(screen.getByText('headings.h3OrgAccess')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.orgAccessPara1')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.orgAccessPara2')).toBeInTheDocument();
    expect(screen.getByText('headings.externalPeople')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.externalPara1')).toBeInTheDocument();
    expect(screen.getByText('headings.share')).toBeInTheDocument();
    expect(screen.getByText('paragraphs.sharePara1')).toBeInTheDocument();
    expect(screen.getByText('labels.email')).toBeInTheDocument();
    expect(screen.getByText('buttons.invite')).toBeInTheDocument();
    // Collaborators
    expect(screen.getByText((content) => content.trim() === "Harry Potter")).toBeInTheDocument();
    expect(screen.getByText('testUser1@example.com')).toBeInTheDocument();
    const removeButton = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButton.length).toBe(2);
    expect(screen.getByText((content) => content.trim() === "Minerva McGonagall")).toBeInTheDocument();
    expect(screen.getByText('testUser2@example.com')).toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<TemplateAccessPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should handle form submission', async () => {
    render(<TemplateAccessPage />);
    const emailInput = screen.getByLabelText('labels.email');
    const inviteButton = screen.getByText('buttons.invite');

    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(useAddTemplateCollaboratorMutation).toHaveBeenCalled();
    });
  });

  it('should handle access revocation', async () => {
    render(<TemplateAccessPage />);
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });

    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(useRemoveTemplateCollaboratorMutation).toHaveBeenCalled();
    });
  });
});
