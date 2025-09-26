"use client";

import React from "react";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import PageLinkCard, { PageLinkSection } from "@/components/PageLinkCard";

import "./shared/styleguide.scss";

export default function StyleGuidePage() {
  const sections: PageLinkSection[] = [
    {
      title: "Foundations",
      description:
        "Core design principles including colours, typography, spacing, and conventions that form the basis of our design system",
      items: [
        {
          title: "Colours",
          description: "Brand colors, grays, messaging colors, and usage guidelines for creating accessible interfaces",
          href: "/styleguide/foundations/colours",
        },
        {
          title: "Typography",
          description: "Type scale, font weights, line heights, and text styles for clear information hierarchy",
          href: "/styleguide/foundations/typography",
        },
        {
          title: "Spacing",
          description: "Spacing scale, utility classes, and layout principles for consistent visual rhythm",
          href: "/styleguide/foundations/spacing",
        },
        {
          title: "Naming Conventions",
          description: "Code style guidelines, CSS naming patterns, and component structure conventions",
          href: "/styleguide/foundations/naming-conventions",
        },
      ],
    },
    {
      title: "Form Elements",
      description: "Input fields, selections, and form controls built on React Aria with custom styling and validation",
      items: [
        {
          title: "Form Elements",
          description: "Text inputs, selects, checkboxes, radio buttons, date pickers, and specialized form controls",
          href: "/styleguide/components/form-elements",
        },
      ],
    },
    {
      title: "Core UI Components",
      description: "Essential reusable interface elements for building consistent user experiences",
      items: [
        {
          title: "Buttons",
          description: "BackButton, AddQuestionButton, AddSectionButton, ButtonWithImage, and ExpandButton variants",
          href: "/styleguide/components/buttons",
        },
        {
          title: "Cards",
          description: "Card containers with CardHeader, CardBody, and other composable card elements",
          href: "/styleguide/components/cards",
        },
        {
          title: "Modals",
          description: "Modal dialogs, confirmation modals, and overlay components for user interactions",
          href: "/styleguide/components/modals",
        },
        {
          title: "Misc. Navigation",
          description: "Pagination, PageLinkCard, and LinkFilter components for site navigation",
          href: "/styleguide/components/navigation",
        },
        {
          title: "Layout",
          description: "Container and ExpandableContentSection components for content organization",
          href: "/styleguide/components/layout",
        },
      ],
    },
    {
      title: "Data Display",
      description: "Components for presenting and organizing information effectively",
      items: [
        {
          title: "Tables",
          description: "Data tables with sorting, selection, and responsive behavior",
          href: "/styleguide/components/tables",
        },
        {
          title: "Lists",
          description: "Structured lists for displaying related items and content collections",
          href: "/styleguide/components/lists",
        },
        {
          title: "Data Cards",
          description: "Specialized cards for displaying data items and interactive content",
          href: "/styleguide/components/data-cards",
        },
        {
          title: "Tables",
          description: "Data tables with sorting, filtering, and responsive behavior",
          href: "/styleguide/components/tables",
        },
      ],
    },
    {
      title: "Patterns",
      description:
        "Common interface patterns and page templates that combine multiple components into cohesive experiences",
      items: [
        {
          title: "Layout Patterns",
          description: "Page layouts, sidebar patterns, dashboard structures, and container systems",
          href: "/styleguide/patterns/layouts",
        },
        {
          title: "Question Patterns",
          description: "Question editing interfaces, preview patterns, and form building components",
          href: "/styleguide/patterns/question-patterns",
        },
      ],
    },
  ];

  return (
    <LayoutContainer>
      <ContentContainer>
        <h1>Design System & Style Guide</h1>

        <PageLinkCard sections={sections} />

        {/* Accessibility Guidelines */}
        <section id="accessibility-guidelines">
          <h2>Accessibility Guidelines</h2>
          <p>
            Our design system prioritizes inclusive design and WCAG 2.1 AA compliance to ensure all users can access and
            use our applications effectively.
          </p>

          <div
            className="accessibility-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              margin: "2rem 0",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                border: "1px solid var(--blue-200)",
                borderRadius: "8px",
                background: "var(--blue-50)",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--blue-900)" }}>🎯 Focus Management</h3>
              <ul style={{ margin: 0 }}>
                <li>All interactive elements are keyboard accessible</li>
                <li>Focus indicators are clearly visible</li>
                <li>Tab order follows logical content flow</li>
                <li>Focus trapping in modals and drawers</li>
              </ul>
            </div>

            <div
              style={{
                padding: "1.5rem",
                border: "1px solid var(--green-200)",
                borderRadius: "8px",
                background: "var(--green-50)",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--green-900)" }}>🏷️ Semantic HTML</h3>
              <ul style={{ margin: 0 }}>
                <li>Proper heading hierarchy (h1, h2, h3...)</li>
                <li>Meaningful link text and button labels</li>
                <li>Form labels associated with inputs</li>
                <li>Landmark regions for navigation</li>
              </ul>
            </div>

            <div
              style={{
                padding: "1.5rem",
                border: "1px solid var(--purple-200)",
                borderRadius: "8px",
                background: "var(--purple-50)",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--purple-900)" }}>🎨 Visual Design</h3>
              <ul style={{ margin: 0 }}>
                <li>4.5:1 contrast ratio for normal text</li>
                <li>3:1 contrast ratio for large text</li>
                <li>Color is not the only visual indicator</li>
                <li>Text remains readable at 200% zoom</li>
              </ul>
            </div>

            <div
              style={{
                padding: "1.5rem",
                border: "1px solid var(--orange-200)",
                borderRadius: "8px",
                background: "var(--orange-50)",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0", color: "var(--orange-900)" }}>📱 Responsive Design</h3>
              <ul style={{ margin: 0 }}>
                <li>Touch targets minimum 44px × 44px</li>
                <li>Content reflows at different screen sizes</li>
                <li>No horizontal scrolling at 320px width</li>
                <li>Mobile-friendly navigation patterns</li>
              </ul>
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              border: "1px solid var(--gray-300)",
              borderRadius: "8px",
              background: "var(--gray-75)",
              marginTop: "2rem",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0" }}>🛠️ Implementation Notes</h3>
            <ul>
              <li>
                <strong>React Aria:</strong> We use React Aria components which provide accessibility features out of
                the box
              </li>
              <li>
                <strong>Testing:</strong> Test with keyboard navigation and screen readers during development
              </li>
              <li>
                <strong>Documentation:</strong> Each component page includes accessibility considerations
              </li>
              <li>
                <strong>Continuous Improvement:</strong> Regular accessibility audits and user testing inform our
                improvements
              </li>
            </ul>
          </div>
        </section>

        <footer className="styleguide-footer">
          <p>
            This style guide is a living document that evolves with our design system. If you notice inconsistencies or
            have suggestions for improvements, please contribute to keeping it up to date.
          </p>
        </footer>
      </ContentContainer>
    </LayoutContainer>
  );
}
