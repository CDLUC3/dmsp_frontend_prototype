"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { Table, TableHeader, TableBody, Column, Row, Cell, Button } from "react-aria-components";

import "../../shared/styleguide.scss";

export default function TablesPage() {
  // Sample data for table examples
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: undefined,
    direction: undefined,
  });

  const sampleData = [
    {
      id: 1,
      name: "Research Data Management",
      template: "NSF Template",
      questions: 12,
      status: "Active",
      lastModified: "2024-01-15",
    },
    {
      id: 2,
      name: "Ethics and Compliance",
      template: "NIH Template",
      questions: 8,
      status: "Draft",
      lastModified: "2024-01-10",
    },
    {
      id: 3,
      name: "Data Sharing Plan",
      template: "EU Template",
      questions: 15,
      status: "Active",
      lastModified: "2024-01-05",
    },
    {
      id: 4,
      name: "Budget Justification",
      template: "Custom",
      questions: 6,
      status: "Archived",
      lastModified: "2023-12-20",
    },
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
          <span aria-current="page">Tables</span>
        </nav>

        <h1>Tables</h1>
        <p className="lead">
          Data tables built with React Aria for displaying structured information with sorting, selection, and
          responsive behavior.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <div className="toc-grid">
            <div className="toc-section">
              <h3>Basic Tables</h3>
              <ul>
                <li>
                  <a href="#basic-table">Basic Table</a>
                </li>
                <li>
                  <a href="#sortable-table">Sortable Table</a>
                </li>
                <li>
                  <a href="#interactive-table">Interactive Table</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Table Features</h3>
              <ul>
                <li>
                  <a href="#table-styling">Styling & Layout</a>
                </li>
                <li>
                  <a href="#responsive-tables">Responsive Behavior</a>
                </li>
                <li>
                  <a href="#table-patterns">Usage Patterns</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Basic Table */}
        <section id="basic-table">
          <div className="component-example">
            <h3 className="sg-section-heading">Basic Table</h3>
            <div className="example-demo full-width">
              <Table aria-label="DMP Sections">
                <TableHeader>
                  <Column isRowHeader>Section Name</Column>
                  <Column>Template</Column>
                  <Column>Questions</Column>
                  <Column>Status</Column>
                  <Column>Last Modified</Column>
                </TableHeader>
                <TableBody>
                  {sampleData.map((item) => (
                    <Row key={item.id}>
                      <Cell>{item.name}</Cell>
                      <Cell>{item.template}</Cell>
                      <Cell>{item.questions}</Cell>
                      <Cell>
                        <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                      </Cell>
                      <Cell>{item.lastModified}</Cell>
                    </Row>
                  ))}
                </TableBody>
              </Table>
            </div>

            <h4 className="sg-sub-heading">Usage</h4>
            <pre>
              <code>{`import { Table, TableHeader, TableBody, Column, Row, Cell } from 'react-aria-components';

<Table aria-label="Data table">
  <TableHeader>
    <Column isRowHeader>Name</Column>
    <Column>Value</Column>
    <Column>Status</Column>
  </TableHeader>
  <TableBody>
    <Row>
      <Cell>Item 1</Cell>
      <Cell>Value 1</Cell>
      <Cell>Active</Cell>
    </Row>
  </TableBody>
</Table>`}</code>
            </pre>
          </div>
        </section>

        {/* Sortable Table */}
        <section id="sortable-table">
          <div className="component-example">
            <h3 className="sg-section-heading">Sortable Table</h3>
            <div className="example-demo full-width">
              <Table
                aria-label="Sortable DMP Sections"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
              >
                <TableHeader>
                  <Column
                    id="name"
                    isRowHeader
                    allowsSorting
                  >
                    Section Name
                  </Column>
                  <Column
                    id="template"
                    allowsSorting
                  >
                    Template
                  </Column>
                  <Column
                    id="questions"
                    allowsSorting
                  >
                    Questions
                  </Column>
                  <Column
                    id="status"
                    allowsSorting
                  >
                    Status
                  </Column>
                  <Column
                    id="lastModified"
                    allowsSorting
                  >
                    Last Modified
                  </Column>
                </TableHeader>
                <TableBody>
                  {sampleData.map((item) => (
                    <Row key={item.id}>
                      <Cell>{item.name}</Cell>
                      <Cell>{item.template}</Cell>
                      <Cell>{item.questions}</Cell>
                      <Cell>
                        <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                      </Cell>
                      <Cell>{item.lastModified}</Cell>
                    </Row>
                  ))}
                </TableBody>
              </Table>
            </div>

            <h4 className="sg-sub-heading">Usage</h4>
            <pre>
              <code>{`const [sortDescriptor, setSortDescriptor] = useState({
  column: undefined,
  direction: undefined,
});

<Table 
  sortDescriptor={sortDescriptor}
  onSortChange={setSortDescriptor}
>
  <TableHeader>
    <Column id="name" allowsSorting>Name</Column>
    <Column id="value" allowsSorting>Value</Column>
  </TableHeader>
  <TableBody>
    {/* Table rows */}
  </TableBody>
</Table>`}</code>
            </pre>

            <h4 className="sg-sub-heading">Sorting Features</h4>
            <ul>
              <li>
                <strong>Click column headers</strong> to sort ascending/descending
              </li>
              <li>
                <strong>Visual indicators</strong> show current sort direction
              </li>
              <li>
                <strong>Keyboard navigation</strong> with arrow keys and Enter
              </li>
              <li>
                <strong>Accessible</strong> with proper ARIA attributes
              </li>
            </ul>
          </div>
        </section>

        {/* Interactive Table */}
        <section id="interactive-table">
          <div className="component-example">
            <h3 className="sg-section-heading">Interactive Table with Actions</h3>
            <div className="example-demo full-width">
              <Table aria-label="DMP Sections with Actions">
                <TableHeader>
                  <Column isRowHeader>Section Name</Column>
                  <Column>Template</Column>
                  <Column>Questions</Column>
                  <Column>Status</Column>
                  <Column>Actions</Column>
                </TableHeader>
                <TableBody>
                  {sampleData.map((item) => (
                    <Row key={item.id}>
                      <Cell>{item.name}</Cell>
                      <Cell>{item.template}</Cell>
                      <Cell>{item.questions}</Cell>
                      <Cell>
                        <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                      </Cell>
                      <Cell>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Button className="secondary small">Edit</Button>
                          <Button className="tertiary small">Delete</Button>
                        </div>
                      </Cell>
                    </Row>
                  ))}
                </TableBody>
              </Table>
            </div>

            <h4 className="sg-sub-heading">Interactive Features</h4>
            <ul>
              <li>
                <strong>Action buttons</strong> in table cells
              </li>
              <li>
                <strong>Status badges</strong> with semantic colors
              </li>
              <li>
                <strong>Consistent button sizing</strong> with small variants
              </li>
              <li>
                <strong>Proper focus management</strong> for accessibility
              </li>
            </ul>
          </div>
        </section>

        {/* Table Styling */}
        <section id="table-styling">
          <div className="component-example">
            <h3 className="sg-section-heading">Styling & Layout</h3>
            <div className="example-demo">
              <h4 className="sg-sub-heading">Status Badge Styles</h4>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
                <span className="status-badge status-active">Active</span>
                <span className="status-badge status-draft">Draft</span>
                <span className="status-badge status-archived">Archived</span>
              </div>

              <h4 className="sg-sub-heading">CSS Classes</h4>
              <pre>
                <code>{`.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-active {
  background: var(--green-100);
  color: var(--green-800);
  border: 1px solid var(--green-200);
}

.status-draft {
  background: var(--yellow-100);
  color: var(--yellow-800);
  border: 1px solid var(--yellow-200);
}

.status-archived {
  background: var(--gray-100);
  color: var(--gray-600);
  border: 1px solid var(--gray-200);
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Responsive Tables */}
        <section id="responsive-tables">
          <div className="component-example">
            <h3 className="sg-section-heading">Responsive Behavior</h3>
            <div className="example-demo">
              <h4 className="sg-sub-heading">Mobile Considerations</h4>
              <ul>
                <li>
                  <strong>Horizontal scrolling:</strong> Tables scroll horizontally on small screens
                </li>
                <li>
                  <strong>Essential columns:</strong> Keep most important columns visible first
                </li>
                <li>
                  <strong>Action consolidation:</strong> Consider dropdown menus for multiple actions
                </li>
                <li>
                  <strong>Touch targets:</strong> Ensure buttons and links are touch-friendly
                </li>
              </ul>

              <h4 className="sg-sub-heading">Best Practices</h4>
              <ul>
                <li>
                  Use <code>isRowHeader</code> on the primary identifier column
                </li>
                <li>
                  Provide meaningful <code>aria-label</code> for screen readers
                </li>
                <li>Keep action buttons consistent in size and spacing</li>
                <li>Use semantic colors for status indicators</li>
                <li>Consider pagination for large datasets</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Patterns */}
        <section id="table-patterns">
          <div className="component-example">
            <h3 className="sg-section-heading">Common Usage Patterns</h3>
            <div className="example-demo">
              <h4 className="sg-sub-heading">When to Use Tables</h4>
              <ul>
                <li>
                  <strong>Data comparison:</strong> When users need to compare values across rows
                </li>
                <li>
                  <strong>Structured data:</strong> For displaying tabular information with multiple attributes
                </li>
                <li>
                  <strong>Bulk actions:</strong> When users need to perform actions on multiple items
                </li>
                <li>
                  <strong>Sorting/filtering:</strong> When data needs to be organized or searched
                </li>
              </ul>

              <h4 className="sg-sub-heading">Alternatives to Consider</h4>
              <ul>
                <li>
                  <strong>Cards:</strong> For content-rich items with fewer comparable attributes
                </li>
                <li>
                  <strong>Lists:</strong> For simple, single-attribute collections
                </li>
                <li>
                  <strong>Data visualization:</strong> For trends and patterns in large datasets
                </li>
              </ul>

              <h4 className="sg-sub-heading">Implementation Checklist</h4>
              <ul>
                <li>✅ Proper semantic HTML structure with React Aria</li>
                <li>✅ Accessible column headers and row identifiers</li>
                <li>✅ Keyboard navigation support</li>
                <li>✅ Responsive design for mobile devices</li>
                <li>✅ Clear visual hierarchy and spacing</li>
                <li>✅ Consistent action button placement</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Implementation Guidelines */}
        <section id="implementation">
          <h2>Implementation Guidelines</h2>

          <div className="guidelines-grid">
            <div className="guideline-item">
              <h3>Accessibility First</h3>
              <p>
                Always use React Aria Table components for proper keyboard navigation, screen reader support, and ARIA
                attributes.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Performance</h3>
              <p>For large datasets, implement virtual scrolling or pagination to maintain good performance.</p>
            </div>
            <div className="guideline-item">
              <h3>Consistency</h3>
              <p>Use consistent button sizes, status colors, and spacing throughout all table implementations.</p>
            </div>
            <div className="guideline-item">
              <h3>Mobile Experience</h3>
              <p>Test tables on mobile devices and consider alternative layouts for complex data on small screens.</p>
            </div>
          </div>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
