"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";

// Import navigation components
import Pagination from "@/components/Pagination";
import PageLinkCard from "@/components/PageLinkCard";
import LinkFilter from "@/components/LinkFilter";

import "../../shared/styleguide.scss";

export default function NavigationPage() {
  // State for navigation examples
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedFilter, setSelectedFilter] = React.useState("all");

  // Sample data for examples
  const sampleLinkSection = {
    title: "Quick Links",
    description: "Common navigation destinations",
    items: [
      {
        title: "Getting Started",
        description: "Learn the basics of using our platform and setting up your first project",
        href: "/getting-started",
      },
      {
        title: "User Management",
        description: "Manage users, roles, and permissions within your organization",
        href: "/user-management",
      },
      {
        title: "Data Templates",
        description: "Create and customize templates for consistent data collection",
        href: "/templates",
      },
    ],
  };

  const filterOptions = [
    { id: "all", label: "All Items" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "draft", label: "Draft" },
  ];

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
          <span aria-current="page">Navigation</span>
        </nav>

        <h1>Navigation Components</h1>
        <p className="lead">
          Components for site navigation, content organization, and user wayfinding throughout the application.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <div className="toc-grid">
            <div className="toc-section">
              <h3>Page Navigation</h3>
              <ul>
                <li>
                  <a href="#pagination">Pagination</a>
                </li>
                <li>
                  <a href="#page-link-card">Page Link Card</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Content Filtering</h3>
              <ul>
                <li>
                  <a href="#link-filter">Link Filter</a>
                </li>
                <li>
                  <a href="#navigation-patterns">Navigation Patterns</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pagination */}
        <section id="pagination">
          <h2>Pagination</h2>
          <p>Navigate through multiple pages of content with clear page indicators and controls.</p>

          <div className="component-example">
            <h3>Interactive Pagination Example</h3>
            <div className="example-demo">
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                hasPreviousPage={currentPage > 1}
                hasNextPage={currentPage < 10}
                handlePageClick={setCurrentPage}
              />
              <p style={{ marginTop: "1rem" }}>
                <small>Current page: {currentPage} of 10</small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import Pagination from '@/components/Pagination';

const [currentPage, setCurrentPage] = useState(1);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  hasPreviousPage={currentPage > 1}
  hasNextPage={currentPage < totalPages}
  handlePageClick={setCurrentPage}
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>Previous/Next navigation</li>
              <li>Direct page number access</li>
              <li>Ellipsis for large page ranges</li>
              <li>Keyboard navigation support</li>
              <li>Responsive design for mobile devices</li>
            </ul>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s navigation primitives with proper ARIA labels and keyboard interactions.
            </p>
          </div>
        </section>

        {/* Page Link Card */}
        <section id="page-link-card">
          <h2>Page Link Card</h2>
          <p>Card-based navigation links for organizing and presenting navigation options with descriptions.</p>

          <div className="component-example">
            <h3>Page Link Card Examples</h3>
            <div className="example-demo">
              <PageLinkCard sections={[sampleLinkSection]} />
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { PageLinkCard } from '@/components/PageLinkCard';

const sections = [
  {
    title: "Quick Links",
    description: "Common navigation destinations", 
    items: [
      {
        title: "Getting Started",
        description: "Learn the basics of using our platform",
        href: "/getting-started"
      },
      {
        title: "User Management", 
        description: "Manage users and permissions",
        href: "/user-management"
      }
    ]
  }
];

<PageLinkCard sections={sections} />`}</code>
            </pre>

            <h4>Use Cases</h4>
            <ul>
              <li>Dashboard navigation</li>
              <li>Section overviews</li>
              <li>Feature discovery</li>
              <li>Onboarding flows</li>
              <li>Help and documentation navigation</li>
            </ul>

            <h4>Layout Patterns</h4>
            <pre>
              <code>{`// PageLinkCard handles its own grid layout
const sections = [
  {
    title: "Navigation Section",
    description: "Links to important areas",
    items: linkCards // Array of {title, description, href}
  }
];

<PageLinkCard sections={sections} />`}</code>
            </pre>
          </div>
        </section>

        {/* Link Filter */}
        <section id="link-filter">
          <h2>Link Filter</h2>
          <p>Filter navigation component for categorizing and organizing content by different criteria.</p>

          <div className="component-example">
            <h3>Interactive Filter Navigation</h3>
            <div className="example-demo">
              <LinkFilter
                items={filterOptions}
                selected={selectedFilter}
                setSelected={setSelectedFilter}
                label="Filter by status"
              />
              <p style={{ marginTop: "1rem" }}>
                <small>
                  Selected filter: <strong>{filterOptions.find((opt) => opt.id === selectedFilter)?.label}</strong>
                </small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import LinkFilter from '@/components/LinkFilter';

const filterOptions = [
  { id: "all", label: "All Items" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" }
];

const [selectedFilter, setSelectedFilter] = useState("all");

<LinkFilter
  items={filterOptions}
  selected={selectedFilter}
  setSelected={setSelectedFilter}
  label="Filter by status"
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>Tab-style navigation interface</li>
              <li>Active state indication</li>
              <li>Keyboard navigation</li>
              <li>Customizable filter options</li>
              <li>Accessible labeling</li>
            </ul>

            <h4>Common Patterns</h4>
            <ul>
              <li>
                <strong>Status Filtering:</strong> Active, Inactive, Pending
              </li>
              <li>
                <strong>Type Filtering:</strong> All, Documents, Images, Videos
              </li>
              <li>
                <strong>Date Filtering:</strong> Recent, This Week, This Month
              </li>
              <li>
                <strong>Category Filtering:</strong> Research, Admin, Templates
              </li>
            </ul>
          </div>
        </section>

        {/* Navigation Patterns */}
        <section id="navigation-patterns">
          <h2>Navigation Patterns</h2>
          <p>Common navigation patterns and their recommended usage.</p>

          <div className="component-example">
            <h3>Combined Navigation Example</h3>
            <div className="example-demo">
              {/* Filter Navigation */}
              <div style={{ marginBottom: "2rem" }}>
                <h4>Filter Navigation</h4>
                <LinkFilter
                  items={filterOptions}
                  selected={selectedFilter}
                  setSelected={setSelectedFilter}
                  label="Content type"
                />
              </div>

              {/* Content Grid */}
              <div style={{ marginBottom: "2rem" }}>
                <h4>Content Cards</h4>
                <PageLinkCard
                  sections={[
                    {
                      title: "Filtered Content",
                      description: "Content matching the selected filter criteria",
                      items: [
                        {
                          title: "Filtered Content 1",
                          description: "First item in the filtered results",
                          href: "#",
                        },
                        {
                          title: "Filtered Content 2",
                          description: "Second item in the filtered results",
                          href: "#",
                        },
                      ],
                    },
                  ]}
                />
              </div>

              {/* Pagination */}
              <div>
                <h4>Page Navigation</h4>
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  hasPreviousPage={currentPage > 1}
                  hasNextPage={currentPage < 5}
                  handlePageClick={setCurrentPage}
                />
              </div>
            </div>

            <h4>Pattern Guidelines</h4>
            <div className="guidelines-grid">
              <div className="guideline-item">
                <h3>Hierarchy</h3>
                <p>Use filters for categorization, cards for content preview, and pagination for large datasets.</p>
              </div>
              <div className="guideline-item">
                <h3>Consistency</h3>
                <p>Maintain consistent navigation patterns across similar pages and sections.</p>
              </div>
              <div className="guideline-item">
                <h3>Context</h3>
                <p>Provide clear context about current location and available navigation options.</p>
              </div>
              <div className="guideline-item">
                <h3>Responsiveness</h3>
                <p>Ensure navigation works well on all device sizes with appropriate touch targets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Guidelines */}
        <section id="implementation">
          <h2>Implementation Guidelines</h2>

          <h3>Navigation Component Selection</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
            <thead>
              <tr style={{ background: "var(--gray-75)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Component</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Use Case</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>Pagination</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Large datasets, search results</td>
                <td style={{ padding: "0.75rem" }}>Tables, lists, search results</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>PageLinkCard</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Section navigation, feature discovery</td>
                <td style={{ padding: "0.75rem" }}>Dashboards, landing pages, menus</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>LinkFilter</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Content categorization, filtering</td>
                <td style={{ padding: "0.75rem" }}>Lists, galleries, content management</td>
              </tr>
            </tbody>
          </table>

          <h3>Accessibility Requirements</h3>
          <ul>
            <li>
              <strong>ARIA Labels:</strong> Provide descriptive labels for navigation regions
            </li>
            <li>
              <strong>Keyboard Navigation:</strong> Support Tab, Enter, and arrow key navigation
            </li>
            <li>
              <strong>Focus Management:</strong> Clear focus indicators and logical tab order
            </li>
            <li>
              <strong>Screen Readers:</strong> Announce current page and navigation state
            </li>
            <li>
              <strong>Skip Links:</strong> Provide skip navigation options for efficiency
            </li>
          </ul>

          <h3>Performance Considerations</h3>
          <ul>
            <li>
              <strong>Lazy Loading:</strong> Load navigation content as needed
            </li>
            <li>
              <strong>Caching:</strong> Cache navigation data for faster subsequent loads
            </li>
            <li>
              <strong>Progressive Enhancement:</strong> Ensure basic navigation works without JavaScript
            </li>
            <li>
              <strong>Mobile Optimization:</strong> Optimize touch targets and scrolling behavior
            </li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
