"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";

// Import header components
import PageHeaderWithTitleChange from "@/components/PageHeaderWithTitleChange";
import Header from "@/components/Header";
import SubHeader from "@/components/SubHeader";

import {
  SGComponentExample,
  SGComponentExampleHeader,
  SGComponentExampleContent,
  SGComponentExampleDemo,
  SGCodeBlock,
  SGTocGrid,
  SGTocSection,
  SGGuidelinesGrid,
  SGGuidelineItem,
} from "../../shared/components";
import "../../shared/styleguide.scss";

export default function HeadersPage() {
  // State for interactive examples
  const [pageTitle, setPageTitle] = React.useState("Research Project Dashboard");

  return (
    <LayoutContainer>
      <ContentContainer>
        <nav
          className="breadcrumbs"
          aria-label="Breadcrumb"
        >
          <Link href="/styleguide">Style Guide</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/styleguide/components">Components</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Headers</span>
        </nav>

        <h1>Header Components</h1>
        <p className="lead">Page-level header components for titles, navigation, and page structure organization.</p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <SGTocGrid>
            <SGTocSection title="Page Headers">
              <ul>
                <li>
                  <a href="#page-header-with-title-change">Page Header with Title Change</a>
                </li>
                <li>
                  <a href="#header">Header</a>
                </li>
              </ul>
            </SGTocSection>
            <SGTocSection title="Section Headers">
              <ul>
                <li>
                  <a href="#sub-header">Sub Header</a>
                </li>
                <li>
                  <a href="#header-patterns">Header Patterns</a>
                </li>
              </ul>
            </SGTocSection>
          </SGTocGrid>
        </section>

        {/* Page Header with Title Change */}
        <section id="page-header-with-title-change">
          <h2>Page Header with Title Change</h2>
          <p>Dynamic page header component that allows inline editing of page titles with proper state management.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Interactive Title Editing Header" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <PageHeaderWithTitleChange
                    title={pageTitle}
                    onTitleChange={setPageTitle}
                    subtitle="Manage your research data and documentation"
                    breadcrumbs={[
                      { label: "Dashboard", href: "/dashboard" },
                      { label: "Projects", href: "/projects" },
                      { label: "Current Project", href: "#", current: true },
                    ]}
                  />
                </div>
                <p style={{ marginTop: "1rem" }}>
                  <small>
                    Current title: <strong>{pageTitle}</strong>
                  </small>
                </p>
              </SGComponentExampleDemo>

              <h4>Usage</h4>
              <SGCodeBlock>{`import PageHeaderWithTitleChange from '@/components/PageHeaderWithTitleChange';

const [title, setTitle] = useState("Page Title");

<PageHeaderWithTitleChange
  title={title}
  onTitleChange={setTitle}
  subtitle="Optional page description"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Section", href: "/section" },
    { label: "Current Page", href: "#", current: true }
  ]}
/>`}</SGCodeBlock>

              <h4>Features</h4>
              <ul>
                <li>Inline title editing with click-to-edit functionality</li>
                <li>Breadcrumb navigation integration</li>
                <li>Optional subtitle support</li>
                <li>Keyboard navigation (Enter to save, Escape to cancel)</li>
                <li>Automatic title validation and state management</li>
                <li>Responsive design for mobile and desktop</li>
              </ul>

              <h4>Use Cases</h4>
              <ul>
                <li>Project management pages</li>
                <li>Document editing interfaces</li>
                <li>User-customizable dashboards</li>
                <li>Content management systems</li>
              </ul>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Header */}
        <section id="header">
          <h2>Header</h2>
          <p>Standard page header component for consistent page titles and navigation structure.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Standard Page Header" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <Header
                  title="Data Management Plans"
                  subtitle="Create and manage your research data management plans"
                  actions={
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--blue-500)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        New Plan
                      </button>
                      <button
                        style={{
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          color: "var(--blue-500)",
                          border: "1px solid var(--blue-500)",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Import
                      </button>
                    </div>
                  }
                />
              </div>
              </SGComponentExampleDemo>

              <h4>Usage</h4>
              <SGCodeBlock>{`import Header from '@/components/Header';

<Header
  title="Page Title"
  subtitle="Optional page description or context"
  actions={
    <div>
      <button>Primary Action</button>
      <button>Secondary Action</button>
    </div>
  }
/>`}</SGCodeBlock>

            <h4>Features</h4>
            <ul>
              <li>Clean, consistent header layout</li>
              <li>Optional subtitle for additional context</li>
              <li>Flexible actions area for buttons and controls</li>
              <li>Responsive design with proper spacing</li>
              <li>Typography integration with design system</li>
            </ul>

              <h4>Variants</h4>
              <div style={{ marginTop: "1rem" }}>
                {/* Minimal Header */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "white",
                    marginBottom: "1rem",
                  }}
                >
                  <Header title="Simple Header" />
                </div>

                {/* Header with Actions Only */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <Header
                    title="Header with Actions"
                    actions={
                      <button
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--green-500)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Save Changes
                      </button>
                    }
                  />
                </div>
              </div>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Sub Header */}
        <section id="sub-header">
          <h2>Sub Header</h2>
          <p>Secondary header component for section titles and sub-navigation within pages.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Section Sub Headers" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Basic Sub Header */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <SubHeader
                    title="Project Settings"
                    description="Configure project preferences and team access"
                  />
                </div>

                {/* Sub Header with Actions */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <SubHeader
                    title="Team Members"
                    description="Manage project collaborators and permissions"
                    actions={
                      <button
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--blue-500)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Add Member
                      </button>
                    }
                  />
                </div>

                {/* Compact Sub Header */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <SubHeader
                    title="Quick Actions"
                    compact={true}
                  />
                </div>
              </div>
              </SGComponentExampleDemo>

              <h4>Usage</h4>
              <SGCodeBlock>{`import SubHeader from '@/components/SubHeader';

// Basic sub header
<SubHeader
  title="Section Title"
  description="Optional section description"
/>

// Sub header with actions
<SubHeader
  title="Section Title"
  description="Section description"
  actions={
    <button>Section Action</button>
  }
/>

// Compact variant
<SubHeader
  title="Section Title"
  compact={true}
/>`}</SGCodeBlock>

            <h4>Use Cases</h4>
            <ul>
              <li>Form section headers</li>
              <li>Content area titles</li>
              <li>Settings page sections</li>
              <li>Dashboard widget headers</li>
              <li>Tab content headers</li>
            </ul>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Header Patterns */}
        <section id="header-patterns">
          <h2>Header Patterns</h2>
          <p>Common patterns for organizing headers and creating clear page hierarchy.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Hierarchical Header Structure" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {/* Main Page Header */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderBottom: "none",
                    borderRadius: "4px 4px 0 0",
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <Header
                    title="Research Data Management"
                    subtitle="Comprehensive data management for your research projects"
                    actions={
                      <button
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--blue-500)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        New Project
                      </button>
                    }
                  />
                </div>

                {/* Sub Header */}
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderTop: "1px solid var(--gray-200)",
                    borderRadius: "0 0 4px 4px",
                    overflow: "hidden",
                    background: "var(--gray-25)",
                  }}
                >
                  <SubHeader
                    title="Active Projects"
                    description="Projects currently in progress"
                    actions={
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <select
                          style={{
                            padding: "0.25rem 0.5rem",
                            border: "1px solid var(--gray-300)",
                            borderRadius: "4px",
                            fontSize: "0.875rem",
                          }}
                        >
                          <option>All Projects</option>
                          <option>Active</option>
                          <option>Completed</option>
                        </select>
                      </div>
                    }
                  />
                </div>
              </div>
              </SGComponentExampleDemo>

              <h4>Pattern Guidelines</h4>
              <SGGuidelinesGrid>
                <SGGuidelineItem title="Hierarchy">
                  <p>Use Header for main page titles and SubHeader for section organization within pages.</p>
                </SGGuidelineItem>
                <SGGuidelineItem title="Actions Placement">
                  <p>Place primary actions in the main Header, secondary actions in SubHeaders.</p>
                </SGGuidelineItem>
                <SGGuidelineItem title="Content Flow">
                  <p>Headers should guide users through the page structure and available actions.</p>
                </SGGuidelineItem>
                <SGGuidelineItem title="Responsive Behavior">
                  <p>Headers adapt to mobile screens by stacking elements and adjusting action layouts.</p>
                </SGGuidelineItem>
              </SGGuidelinesGrid>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Implementation Guidelines */}
        <section id="implementation">
          <h2>Implementation Guidelines</h2>

          <h3>Header Component Selection</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
            <thead>
              <tr style={{ background: "var(--gray-75)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Component</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Use Case</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Features</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>PageHeaderWithTitleChange</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Editable page titles, project pages</td>
                <td style={{ padding: "0.75rem" }}>Inline editing, breadcrumbs, validation</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>Header</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Standard page headers, static titles</td>
                <td style={{ padding: "0.75rem" }}>Title, subtitle, actions area</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>SubHeader</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Section headers, content organization</td>
                <td style={{ padding: "0.75rem" }}>Compact design, section actions</td>
              </tr>
            </tbody>
          </table>

          <h3>Best Practices</h3>
          <ul>
            <li>
              <strong>Semantic HTML:</strong> Use proper heading levels (h1, h2, h3) for accessibility
            </li>
            <li>
              <strong>Action Hierarchy:</strong> Primary actions in main headers, secondary in sub headers
            </li>
            <li>
              <strong>Consistent Spacing:</strong> Maintain consistent spacing between header levels
            </li>
            <li>
              <strong>Mobile Optimization:</strong> Ensure headers work well on small screens
            </li>
            <li>
              <strong>Loading States:</strong> Show appropriate loading states for dynamic headers
            </li>
          </ul>

          <h3>Accessibility Requirements</h3>
          <ul>
            <li>Proper heading hierarchy and ARIA labels</li>
            <li>Keyboard navigation for interactive elements</li>
            <li>Focus management for editable titles</li>
            <li>Screen reader announcements for title changes</li>
            <li>High contrast support for all header elements</li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
