import React from 'react';
import {render, screen} from '@testing-library/react';
import TemplateListPage from '../page';
import {axe, toHaveNoViolations} from 'jest-axe';
import {useRouter} from 'next/navigation';

expect.extend(toHaveNoViolations);

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

interface PageHeaderProps {
  title: string;
  description: string;
  actions: React.ReactNode;
  breadcrumbs: React.ReactNode;
}

interface TemplateListItemProps {
  item: {
    title: string;
    content: React.ReactNode;
  };
}


jest.mock('@/components/PageHeader', () => {
  return {
    __esModule: true,
    default: ({ title, description, actions, breadcrumbs }: PageHeaderProps) => (
      <div data-testid="mock-page-header">
        <h1>{title}</h1>
        <p>{description}</p>
        <div data-testid="header-actions">{actions}</div>
        <div data-testid="breadcrumbs">{breadcrumbs}</div>
      </div>
    ),
  };
});

jest.mock('@/components/TemplateListItem', () => {
  return {
    __esModule: true,
    default: ({ item }: TemplateListItemProps) => (
      <div data-testid="template-list-item" role="listitem">
        <h2>{item.title}</h2>
        <div>{item.content}</div>
      </div>
    ),
  };
});


describe('TemplateListPage', () => {
  beforeEach(() => {
    const mockUseRouter = useRouter as jest.Mock;
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  it('should render the page header with correct title and description', () => {
    render(<TemplateListPage />);

    // Act: Query the h1 element
    const heading = screen.getByRole('heading', { level: 1 });

    // Assert: Check that its text content is correct
    expect(heading).toHaveTextContent('Templates');
    expect(screen.getByText('Manager or create DMSP templates, once published researchers will be able to select your template.')).toBeInTheDocument();
  });

  it('should render the create template link in header actions', () => {
    render(<TemplateListPage />);

    const createLink = screen.getByText('Create Template');
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute('href', '/template/create');
  });

  it('should render the search field with correct label and help text', () => {
    render(<TemplateListPage />);

    expect(screen.getByLabelText('Search by keyword')).toBeInTheDocument();
    expect(screen.getByText('Search by research organization, field station or lab, template description, etc.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('should render the template list with correct number of items', () => {
    render(<TemplateListPage />);

    const templateItems = screen.getAllByTestId('template-list-item');
    expect(templateItems).toHaveLength(3);
  });

  it('should render template items with correct titles', () => {
    render(<TemplateListPage />);

    expect(screen.getByText('Arctic Data Center: NSF Polar Programs')).toBeInTheDocument();
    expect(screen.getByText('NSF Polar Expeditions')).toBeInTheDocument();
    expect(screen.getByText('NSF: McMurdo Station (Antarctic)')).toBeInTheDocument();
  });

  it('should render the template list with correct ARIA role', () => {
    render(<TemplateListPage />);

    const list = screen.getByRole('list', { name: 'Template list' });
    expect(list).toHaveClass('template-list');
  });

  it('should render breadcrumbs with correct links', () => {
    render(<TemplateListPage />);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    const templatesLink = screen.getByRole('link', { name: 'Templates' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(templatesLink).toHaveAttribute('href', '/template');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <TemplateListPage />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
