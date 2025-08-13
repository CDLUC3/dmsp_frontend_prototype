import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import Pagination from '../index';
expect.extend(toHaveNoViolations);
// Mock translations
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the CSS module
jest.mock('./pagination.module.scss', () => ({
  pagination: 'pagination',
  current: 'current',
  ellipsis: 'ellipsis'
}));

describe('Pagination Component', () => {
  const mockHandlePageClick = jest.fn();

  beforeEach(() => {
    mockHandlePageClick.mockClear();
  });

  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    hasPreviousPage: false,
    hasNextPage: true,
    handlePageClick: mockHandlePageClick
  };

  describe('Basic Rendering', () => {
    it('should render pagination navigation', () => {
      render(<Pagination {...defaultProps} />);

      const nav = screen.getByRole('navigation', { name: /pagination/i });
      expect(nav).toBeInTheDocument();
    });

    it('should render previous and next buttons', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByRole('button', { name: "labels.previousPage" })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: "labels.nextPage" })).toBeInTheDocument();
    });

    it('should render page numbers as links', () => {
      render(<Pagination {...defaultProps} />);
      const page1 = screen.getAllByRole('link', { name: /page 1/i });
      expect(page1).toHaveLength(2);
    });
  });

  describe('Button States', () => {
    it('should disable previous button when hasPreviousPage is false', () => {
      render(<Pagination {...defaultProps} hasPreviousPage={false} />);

      const prevButton = screen.getByRole('button', { name: "labels.previousPage" });
      expect(prevButton).toBeDisabled();
    });

    it('should enable previous button when hasPreviousPage is true', () => {
      render(<Pagination {...defaultProps} currentPage={2} hasPreviousPage={true} />);

      const prevButton = screen.getByRole('button', { name: "labels.previousPage" });
      expect(prevButton).not.toBeDisabled();
    });

    it('should disable next button when hasNextPage is false', () => {
      render(<Pagination {...defaultProps} currentPage={10} hasNextPage={false} />);

      const nextButton = screen.getByRole('button', { name: "labels.nextPage" });
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when hasNextPage is true', () => {
      render(<Pagination {...defaultProps} hasNextPage={true} />);

      const nextButton = screen.getByRole('button', { name: "labels.nextPage" });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('Current Page Highlighting', () => {
    it('should apply current class to active page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const currentPageLink = screen.getByRole('link', { name: /page 3/i });
      expect(currentPageLink).toHaveClass('current');
    });

    it('should not apply current class to non-active pages', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);

      const otherPageLink = screen.getAllByRole('link', { name: /page 1/i });
      expect(otherPageLink[0]).not.toHaveClass('current');
    });
  });

  describe('Click Handlers', () => {
    it('should call handlePageClick with previous page when previous button is clicked', () => {
      render(<Pagination {...defaultProps} currentPage={5} hasPreviousPage={true} />);

      const prevButton = screen.getByRole('button', { name: "labels.previousPage" });
      fireEvent.click(prevButton);

      expect(mockHandlePageClick).toHaveBeenCalledWith(4);
    });

    it('should call handlePageClick with next page when next button is clicked', () => {
      render(<Pagination {...defaultProps} currentPage={5} hasNextPage={true} />);

      const nextButton = screen.getByRole('button', { name: "labels.nextPage" });
      fireEvent.click(nextButton);

      expect(mockHandlePageClick).toHaveBeenCalledWith(6);
    });

    it('should call handlePageClick with correct page number when page link is clicked', () => {
      render(<Pagination {...defaultProps} />);

      const pageLink = screen.getByRole('link', { name: /page 2/i });
      fireEvent.click(pageLink);

      expect(mockHandlePageClick).toHaveBeenCalledWith(2);
    });

    it('should not navigate when page link is clicked (preventDefault behavior)', () => {
      render(<Pagination {...defaultProps} />);

      const pageLink = screen.getByRole('link', { name: /page 2/i });

      // The link should have href="#" but clicking it should not cause navigation
      expect(pageLink).toHaveAttribute('href', '#');

      // After clicking, the handlePageClick should be called instead of navigating
      fireEvent.click(pageLink);
      expect(mockHandlePageClick).toHaveBeenCalledWith(2);

      // The URL should not have changed (no navigation occurred)
      expect(window.location.hash).toBe('');
    });
  });

  describe('Page Range Logic', () => {
    it('should show ellipsis when there are many pages', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />);

      const ellipsis = screen.getAllByText('…');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should show all pages when total pages is small', () => {
      render(<Pagination {...defaultProps} currentPage={2} totalPages={5} />);

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByRole('link', { name: `Page ${i}` })).toBeInTheDocument();
      }
    });

    it('should always shows first and last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} />);

      const page1 = screen.getByRole('link', { name: "Page 1" });
      const page20 = screen.getByRole('link', { name: "Page 20" });
      expect(page1).toBeInTheDocument();
      expect(page20).toBeInTheDocument();
    });

    it('should show pages around current page', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} />);

      // Should show pages around current page (delta = 2)
      expect(screen.getByRole('link', { name: /page 8/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /page 9/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /page 10/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /page 11/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /page 12/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page correctly', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={1} hasPreviousPage={false} hasNextPage={false} />);

      expect(screen.getByRole('button', { name: "labels.previousPage" })).toBeDisabled();
      expect(screen.getByRole('button', { name: "labels.nextPage" })).toBeDisabled();
      expect(screen.getByRole('link', { name: /page 1/i })).toBeInTheDocument();
    });

    it('should handle first page correctly', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={10} />);

      expect(screen.getByRole('button', { name: "labels.previousPage" })).toBeDisabled();
      expect(screen.getByRole('button', { name: "labels.nextPage" })).not.toBeDisabled();
    });

    it('should handle last page correctly', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={10} hasPreviousPage={true} hasNextPage={false} />);

      expect(screen.getByRole('button', { name: "labels.previousPage" })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: "labels.nextPage" })).toBeDisabled();
    });

    it('should handle null hasPreviousPage and hasNextPage', () => {
      render(<Pagination {...defaultProps} hasPreviousPage={null} hasNextPage={null} />);

      expect(screen.getByRole('button', { name: "labels.previousPage" })).toBeDisabled();
      expect(screen.getByRole('button', { name: "labels.nextPage" })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Pagination {...defaultProps} />);

      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: "labels.previousPage" })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: "labels.nextPage" })).toBeInTheDocument();
    });

    it('should have proper aria-setsize and aria-posinset attributes', () => {
      render(<Pagination {...defaultProps} totalPages={5} />);

      const listItems = screen.getAllByRole('listitem');
      const pageItems = listItems.filter(item => !item.hasAttribute('aria-hidden'));

      pageItems.forEach((item) => {
        expect(item).toHaveAttribute('aria-setsize', '5');
        expect(item).toHaveAttribute('aria-posinset');
      });
    });

    it('should hide ellipsis from screen readers', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} />);

      const ellipsisElements = screen.getAllByText('…');
      ellipsisElements.forEach(ellipsis => {
        expect(ellipsis.closest('li')).toHaveAttribute('aria-hidden', 'true');
      });
    });


    it('should pass axe accessibility test', async () => {
      const { container } = render(<Pagination {...defaultProps} currentPage={10} totalPages={20} />);

      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });
});