import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ExpandableContentSection from '../index';

expect.extend(toHaveNoViolations);

// Mock useTranslations from next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

describe('ExpandableContentSection', () => {
  const defaultProps = {
    id: 'test-section',
    heading: 'Test Heading'
  };

  const shortContent = (
    <div>
      <p>Short content that should not be truncated.</p>
    </div>
  );

  const longContent = (
    <div>
      <p>This is a very long paragraph that should be truncated when the character limit is reached. It contains enough text to exceed most reasonable character limits.</p>
      <p>This is a second paragraph that adds even more content to ensure truncation occurs.</p>
    </div>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render with required props', () => {
      render(
        <ExpandableContentSection {...defaultProps}>
          {shortContent}
        </ExpandableContentSection>
      );

      expect(screen.getByText('Test Heading')).toBeInTheDocument();
      expect(screen.getByText('Short content that should not be truncated.')).toBeInTheDocument();
    });
  });

  describe('Content truncation', () => {
    it('should not show expand/collapse when content is short', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={200}>
          {shortContent}
        </ExpandableContentSection>
      );

      expect(screen.queryByText('Expand')).not.toBeInTheDocument();
      expect(screen.queryByText('Collapse')).not.toBeInTheDocument();
    });

    it('should show expand link when content exceeds character limit', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
      expect(screen.queryByText('links.collapse')).not.toBeInTheDocument();
    });

    it('should truncate content at word boundaries', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={30}>
          <p>This is a very long sentence that should be truncated at word boundaries.</p>
        </ExpandableContentSection>
      );

      const truncatedText = screen.getByText(/This is a very long sentence.../);
      expect(truncatedText).toBeInTheDocument();
      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });

    it('should handle content without spaces correctly', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={20}>
          <p>ThisIsAVeryLongWordWithoutSpacesThatNeedsToBeHandled</p>
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse functionality', () => {
    it('should expand content when expand link is clicked', async () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      const expandLink = screen.getByText('links.expand');
      fireEvent.click(expandLink);

      await waitFor(() => {
        expect(screen.getByText('links.collapse')).toBeInTheDocument();
      });

      expect(screen.getByText('This is a second paragraph that adds even more content to ensure truncation occurs.')).toBeInTheDocument();
    });

    it('should collapse content when collapse link is clicked', async () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      // First expand
      const expandLink = screen.getByText('links.expand');
      fireEvent.click(expandLink);

      await waitFor(() => {
        expect(screen.getByText('links.collapse')).toBeInTheDocument();
      });

      // Then collapse
      const collapseLink = screen.getByText('links.collapse');
      fireEvent.click(collapseLink);

      await waitFor(() => {
        expect(screen.getByText('links.expand')).toBeInTheDocument();
      });

      expect(screen.queryByText('This is a second paragraph that adds even more content to ensure truncation occurs.')).not.toBeInTheDocument();
    });

    it('should prevent default link behavior', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      const expandLink = screen.getByText('links.expand');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

      fireEvent(expandLink, clickEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Custom labels', () => {
    it('should use custom expand and collapse labels', () => {
      render(
        <ExpandableContentSection
          {...defaultProps}
          summaryCharLimit={50}
          expandLabel="Show More"
          collapseLabel="Show Less"
        >
          {longContent}
        </ExpandableContentSection>
      );

      expect(screen.getByText('Show More')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Show More'));

      expect(screen.getByText('Show Less')).toBeInTheDocument();
    });

    it('should fall back to default labels when custom labels not provided', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      const expandLink = screen.getByText('links.expand');

      expect(expandLink).toHaveAttribute('aria-expanded', 'false');
      expect(expandLink).toHaveAttribute('aria-controls', 'test-section-content');
      expect(expandLink).toHaveAttribute('href', '#test-section-content');
    });

    it('should update ARIA attributes when expanded', async () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      const expandLink = screen.getByText('links.expand');
      fireEvent.click(expandLink);

      await waitFor(() => {
        const collapseLink = screen.getByText('links.collapse');
        expect(collapseLink).toHaveAttribute('aria-expanded', 'true');
        expect(collapseLink).toHaveAttribute('aria-controls', 'test-section-content');
      });
    });

    it('should have proper heading structure', () => {
      render(
        <ExpandableContentSection {...defaultProps}>
          {shortContent}
        </ExpandableContentSection>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Heading');
      expect(heading).toHaveAttribute('id', 'test-section-heading');
    });

    it('should have live region for screen readers', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      const liveRegion = screen.getByText('messaging.sectionIsCollapsed');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveClass('hidden-accessibly');
    });

    it('should update live region when expanded', async () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      const expandLink = screen.getByText('links.expand');
      fireEvent.click(expandLink);

      await waitFor(() => {
        expect(screen.getByText('messaging.sectionIsExpanded')).toBeInTheDocument();
      });
    });

    it('should pass axe accessibility test', async () => {
      const { container } = render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          {longContent}
        </ExpandableContentSection>
      );

      await act(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
  });

  describe('Content type handling', () => {
    it('should handle string content', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={10}>
          <p>Simple string content</p>
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });

    it('should handle number content', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={2}>
          <p>{123456}</p>
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });

    it('should handle mixed content types', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          <div>
            <p>Text content</p>
            <span>More text</span>
            <div>Even more content that should trigger truncation</div>
          </div>
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty content', () => {
      render(
        <ExpandableContentSection {...defaultProps}>
          <p></p>
        </ExpandableContentSection>
      );

      expect(screen.queryByText('links.expand')).not.toBeInTheDocument();
    });

    it('should handle content when shorter than specified summaryCharLimit', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          <p>This is short.</p>
        </ExpandableContentSection>
      );

      expect(screen.queryByText('links.expand')).not.toBeInTheDocument();
    });

    it('should handle content with only whitespace', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={50}>
          <p>   </p>
        </ExpandableContentSection>
      );

      expect(screen.queryByText('links.expand')).not.toBeInTheDocument();
    });

    it('should handle summaryCharLimit of 0', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={0}>
          <p>Any content</p>
        </ExpandableContentSection>
      );

      expect(screen.getByText('links.expand')).toBeInTheDocument();
    });

    it('should handle very large summaryCharLimit', () => {
      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={10000}>
          {longContent}
        </ExpandableContentSection>
      );

      expect(screen.queryByText('links.expand')).not.toBeInTheDocument();
    });

    it('should handle boolean values', () => {
      // Boolean values are objects but don't have 'props', so they hit the final return ''
      const content = (
        <div>
          <p>Text before</p>
          {true && <span>This should show</span>}
          {false && <span>This should not show</span>}
          <p>Text after</p>
        </div>
      );

      render(
        <ExpandableContentSection {...defaultProps} summaryCharLimit={100}>
          {content}
        </ExpandableContentSection>
      );

      // The boolean false will hit the final return '', but true will be handled by React
      expect(screen.getByText('Text before')).toBeInTheDocument();
      expect(screen.getByText('This should show')).toBeInTheDocument();
      expect(screen.getByText('Text after')).toBeInTheDocument();
    });
  });
});