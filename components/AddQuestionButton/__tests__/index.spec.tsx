import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AddQuestionButton from '../index';
expect.extend(toHaveNoViolations);


describe('AddQuestionButton', () => {
  const mockOnClick = jest.fn();
  const mockHref = '/add-question';
  const mockClassName = 'custom-class';

  it('should render the button with default properties', () => {
    render(<AddQuestionButton />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '#');
    expect(screen.getByText('links.addQuestion')).toBeInTheDocument(); // Default localized text
  });

  it('should render the button with custom href and className', () => {
    render(<AddQuestionButton href={mockHref} className={mockClassName} />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', mockHref);
    expect(linkElement).toHaveClass('link');
  });

  it('should call onClick when the button is clicked', () => {
    render(<AddQuestionButton onClick={mockOnClick} />);
    const linkElement = screen.getByRole('link');
    fireEvent.click(linkElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should not throw an error when onClick is not provided', () => {
    render(<AddQuestionButton />);
    const linkElement = screen.getByRole('link');
    expect(() => fireEvent.click(linkElement)).not.toThrow();
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <div role="list">
        <AddQuestionButton />
      </div>
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
