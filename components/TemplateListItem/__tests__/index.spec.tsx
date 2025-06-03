import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TemplateItemProps } from '@/app/types';
import TemplateListItem from '../index';

expect.extend(toHaveNoViolations);

const mockItem: TemplateItemProps = {
  title: 'Test Template',
  link: '/test-link',
  defaultExpanded: false,
  funder: 'Test Funder',
  lastUpdated: '2023-01-01',
  publishStatus: 'Published',
  content: <div><p>This is the expanded content.</p><span>Additional details here.</span></div>,
};

describe('TemplateListItem Component', () => {
  it('should render the title of the list item as a link when link is provided', () => {
    render(<TemplateListItem item={mockItem} />);
    const titleLink = screen.getByRole('heading', { level: 3 });
    expect(titleLink).toHaveTextContent('Test Template');

    expect(within(titleLink).getByRole('link', { name: /linkUpdate Test Template/i })).toHaveAttribute('href', '/test-link');
  });

  it('should render the funder, last updated, and publish status', () => {
    render(<TemplateListItem item={mockItem} />);

    expect(screen.getByText(/Test Funder/i)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Published/i)).toBeInTheDocument();
  });

  it('should toggle expanded content visibility when the button is clicked', () => {
    render(<TemplateListItem item={mockItem} />);

    const toggleButton = screen.getByRole('button', { name: /expand details for test template/i });
    expect(screen.queryByText('This is the expanded content.')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('This is the expanded content.')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.queryByText('This is the expanded content.')).not.toBeInTheDocument();
  });

  it('should render the correct aria attributes for accessibility', () => {
    render(<TemplateListItem item={mockItem} />);

    const toggleButton = screen.getByRole('button', { name: /expand details for test template/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(<div role="list"><TemplateListItem item={mockItem} /></div>);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
