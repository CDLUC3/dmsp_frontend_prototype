"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import TemplateList from "@/components/TemplateList";
import ProjectListItem from "@/components/ProjectListItem";
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import SectionHeaderEdit from "@/components/SectionHeaderEdit";
import QuestionEditCard from "@/components/QuestionEditCard";

import "../../../shared/styleguide.scss";

export default function ListsDataCardsPage() {
  // State for interactive examples
  const [selectedTemplate, setSelectedTemplate] = React.useState<number | null>(null);
  const [expandedProject, setExpandedProject] = React.useState<string | null>(null);

  // Mock data for examples
  const mockTemplates = [
    {
      id: 1,
      title: "NSF Data Management Plan Template",
      description:
        "Comprehensive template for NSF-funded research projects with detailed data management requirements.",
      funder: "National Science Foundation",
      lastRevisedBy: "Dr. Jane Smith",
      lastUpdated: "2024-01-15",
      publishStatus: "Published",
      publishDate: "2024-01-10",
      visibility: "public",
      hasAdditionalGuidance: true,
      defaultExpanded: false,
    },
    {
      id: 2,
      title: "NIH Data Sharing Plan Template",
      description: "Template for NIH-funded research focusing on data sharing and accessibility requirements.",
      funder: "National Institutes of Health",
      lastRevisedBy: "Dr. John Doe",
      lastUpdated: "2024-01-12",
      publishStatus: "Draft",
      visibility: "private",
      hasAdditionalGuidance: false,
      defaultExpanded: false,
    },
    {
      id: 3,
      title: "DOE Energy Research Template",
      description:
        "Specialized template for Department of Energy research projects with energy-specific data requirements.",
      funder: "Department of Energy",
      lastRevisedBy: "Dr. Sarah Johnson",
      lastUpdated: "2024-01-08",
      publishStatus: "Published",
      publishDate: "2024-01-05",
      visibility: "public",
      hasAdditionalGuidance: true,
      defaultExpanded: false,
    },
  ];

  const mockProjects = [
    {
      title: "Climate Change Impact Study",
      link: "/projects/climate-study",
      startDate: "2024-01-01",
      endDate: "2026-12-31",
      funding: "$500,000",
      grantId: "NSF-2024-001",
      defaultExpanded: false,
      members: [
        { name: "Dr. Alice Brown", roles: "Principal Investigator" },
        { name: "Dr. Bob Wilson", roles: "Co-Investigator" },
        { name: "Dr. Carol Davis", roles: "Research Associate" },
      ],
    },
    {
      title: "Machine Learning for Healthcare",
      link: "/projects/ml-healthcare",
      startDate: "2024-02-01",
      endDate: "2025-08-31",
      funding: "$750,000",
      grantId: "NIH-2024-002",
      defaultExpanded: false,
      members: [
        { name: "Dr. David Lee", roles: "Principal Investigator" },
        { name: "Dr. Emma Garcia", roles: "Co-Investigator" },
      ],
    },
  ];

  const mockSections = [
    {
      title: "Data Collection and Management",
      sectionNumber: 1,
      editUrl: "/template/1/section/1/edit",
    },
    {
      title: "Data Sharing and Access",
      sectionNumber: 2,
      editUrl: "/template/1/section/2/edit",
    },
    {
      title: "Data Preservation and Archiving",
      sectionNumber: 3,
      editUrl: "/template/1/section/3/edit",
    },
  ];

  const mockQuestions = [
    {
      id: "1",
      text: "What types of data will be collected in this research project?",
      link: "/template/1/section/1/question/1/edit",
      name: "data-types",
      displayOrder: 1,
    },
    {
      id: "2",
      text: "How will the data be stored and backed up during the research period?",
      link: "/template/1/section/1/question/2/edit",
      name: "data-storage",
      displayOrder: 2,
    },
    {
      id: "3",
      text: "What file formats will be used for the data, and why were these formats chosen?",
      link: "/template/1/section/1/question/3/edit",
      name: "file-formats",
      displayOrder: 3,
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
          <Link href="/styleguide/components/ui-components">UI Components</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Lists & Data Cards</span>
        </nav>

        <h1>Lists & Data Cards</h1>
        <p className="lead">
          Specialized list and card components for displaying structured data, managing content hierarchies, and
          organizing dashboard information.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <div className="toc-grid">
            <div className="toc-section">
              <h3>List Components</h3>
              <ul>
                <li>
                  <a href="#template-list">Template List</a>
                </li>
                <li>
                  <a href="#project-list-item">Project List Item</a>
                </li>
                <li>
                  <a href="#template-select-list">Template Select List</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Management Components</h3>
              <ul>
                <li>
                  <a href="#section-header-edit">Section Header Edit</a>
                </li>
                <li>
                  <a href="#question-edit-card">Question Edit Card</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Use Cases</h3>
              <ul>
                <li>
                  <a href="#dashboard-layouts">Dashboard Layouts</a>
                </li>
                <li>
                  <a href="#content-management">Content Management</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Template List */}
        <section id="template-list">
          <h2>Template List</h2>
          <p>
            Container component for displaying lists of templates with pagination, filtering, and selection
            capabilities.
          </p>

          <div className="component-example">
            <h3>Template List with Selection</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0" }}>Available Templates</h4>
                <TemplateList
                  templates={mockTemplates}
                  onSelect={async (versionedTemplateId) => {
                    setSelectedTemplate(versionedTemplateId);
                    console.log("Selected template:", versionedTemplateId);
                  }}
                />

                {selectedTemplate && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: "var(--green-50)",
                      borderRadius: "4px",
                      border: "1px solid var(--green-200)",
                    }}
                  >
                    <strong>Selected Template ID:</strong> {selectedTemplate}
                  </div>
                )}
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import TemplateList from '@/components/TemplateList';

const templates = [
  {
    id: 1,
    title: "Template Title",
    description: "Template description",
    funder: "Funder Name",
    // ... other properties
  }
];

<TemplateList
  templates={templates}
  onSelect={async (versionedTemplateId) => {
    // Handle template selection
    console.log("Selected:", versionedTemplateId);
  }}
  visibleCountKey="templates"
  visibleCount={{ templates: 3 }}
  handleLoadMore={(key) => {
    // Handle load more functionality
  }}
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>
                <strong>Pagination support:</strong> Built-in load more functionality
              </li>
              <li>
                <strong>Search integration:</strong> Works with search and filtering
              </li>
              <li>
                <strong>Selection handling:</strong> Async selection with proper error handling
              </li>
              <li>
                <strong>Responsive design:</strong> Adapts to different screen sizes
              </li>
            </ul>
          </div>
        </section>

        {/* Project List Item */}
        <section id="project-list-item">
          <h2>Project List Item</h2>
          <p>Expandable list item component for displaying project information with collapsible details.</p>

          <div className="component-example">
            <h3>Project List with Expandable Details</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0" }}>Active Projects</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {mockProjects.map((project, index) => (
                    <ProjectListItem
                      key={index}
                      item={project}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import ProjectListItem from '@/components/ProjectListItem';

const project = {
  title: "Project Title",
  link: "/projects/project-id",
  startDate: "2024-01-01",
  endDate: "2026-12-31",
  funding: "$500,000",
  grantId: "NSF-2024-001",
  defaultExpanded: false,
  members: [
    { name: "Dr. Jane Smith", roles: "Principal Investigator" }
  ]
};

<ProjectListItem item={project} />`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>
                <strong>Expandable content:</strong> Click to show/hide project details
              </li>
              <li>
                <strong>Rich metadata:</strong> Dates, funding, collaborators, and grant information
              </li>
              <li>
                <strong>Navigation links:</strong> Direct links to project pages
              </li>
              <li>
                <strong>Accessibility:</strong> Proper ARIA labels and keyboard navigation
              </li>
            </ul>
          </div>
        </section>

        {/* Template Select List */}
        <section id="template-select-list">
          <h2>Template Select List Item</h2>
          <p>Individual template item component with selection capabilities and rich metadata display.</p>

          <div className="component-example">
            <h3>Template Selection Items</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0" }}>Template Selection</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {mockTemplates.map((template, index) => (
                    <TemplateSelectListItem
                      key={index}
                      item={template}
                      onSelect={async (versionedTemplateId) => {
                        setSelectedTemplate(versionedTemplateId);
                        console.log("Selected template:", versionedTemplateId);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import TemplateSelectListItem from '@/components/TemplateSelectListItem';

const template = {
  id: 1,
  title: "Template Title",
  description: "Template description",
  funder: "Funder Name",
  lastRevisedBy: "Dr. Jane Smith",
  lastUpdated: "2024-01-15",
  publishStatus: "Published",
  visibility: "public",
  hasAdditionalGuidance: true
};

<TemplateSelectListItem
  item={template}
  onSelect={async (versionedTemplateId) => {
    // Handle selection
  }}
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>
                <strong>Rich metadata:</strong> Funder, revision info, publish status, visibility
              </li>
              <li>
                <strong>Guidance indicators:</strong> Visual indicators for additional guidance
              </li>
              <li>
                <strong>Selection states:</strong> Clear selection and action buttons
              </li>
              <li>
                <strong>Status display:</strong> Publication status and visibility information
              </li>
            </ul>
          </div>
        </section>

        {/* Section Header Edit */}
        <section id="section-header-edit">
          <h2>Section Header Edit</h2>
          <p>Editable section header component with reordering capabilities for template management.</p>

          <div className="component-example">
            <h3>Section Management Interface</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0" }}>Template Sections</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {mockSections.map((section, index) => (
                    <SectionHeaderEdit
                      key={index}
                      title={section.title}
                      sectionNumber={section.sectionNumber}
                      editUrl={section.editUrl}
                      onMoveUp={index > 0 ? () => console.log("Move up") : undefined}
                      onMoveDown={index < mockSections.length - 1 ? () => console.log("Move down") : undefined}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import SectionHeaderEdit from '@/components/SectionHeaderEdit';

<SectionHeaderEdit
  title="Data Collection and Management"
  sectionNumber={1}
  editUrl="/template/1/section/1/edit"
  onMoveUp={() => {
    // Handle move up
  }}
  onMoveDown={() => {
    // Handle move down
  }}
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>
                <strong>Section numbering:</strong> Automatic section numbering display
              </li>
              <li>
                <strong>Edit links:</strong> Direct links to section editing pages
              </li>
              <li>
                <strong>Reordering controls:</strong> Move up/down buttons with proper state management
              </li>
              <li>
                <strong>Accessibility:</strong> Proper ARIA labels for reordering actions
              </li>
            </ul>
          </div>
        </section>

        {/* Question Edit Card */}
        <section id="question-edit-card">
          <h2>Question Edit Card</h2>
          <p>Editable question card component with reordering capabilities for template question management.</p>

          <div className="component-example">
            <h3>Question Management Interface</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0" }}>Section Questions</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {mockQuestions.map((question, index) => (
                    <QuestionEditCard
                      key={question.id}
                      id={question.id}
                      text={question.text}
                      link={question.link}
                      name={question.name}
                      displayOrder={question.displayOrder}
                      handleDisplayOrderChange={(questionId, newOrder) => {
                        console.log("Change order:", questionId, newOrder);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import QuestionEditCard from '@/components/QuestionEditCard';

<QuestionEditCard
  id="1"
  text="What types of data will be collected?"
  link="/template/1/section/1/question/1/edit"
  name="data-types"
  displayOrder={1}
  handleDisplayOrderChange={(questionId, newOrder) => {
    // Handle order change
  }}
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>
                <strong>Question display:</strong> Clean display of question text with HTML stripping
              </li>
              <li>
                <strong>Edit links:</strong> Direct links to question editing pages
              </li>
              <li>
                <strong>Reordering controls:</strong> Move up/down buttons for question ordering
              </li>
              <li>
                <strong>Accessibility:</strong> Proper ARIA labels and keyboard navigation
              </li>
            </ul>
          </div>
        </section>

        {/* Dashboard Layouts */}
        <section id="dashboard-layouts">
          <h2>Dashboard Layouts</h2>
          <p>Common patterns for organizing lists and data cards in dashboard interfaces.</p>

          <div className="component-example">
            <h3>Template Dashboard Layout</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Template Management</h4>
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
                    Create New Template
                  </button>
                </div>

                <TemplateList
                  templates={mockTemplates}
                  onSelect={async (versionedTemplateId) => {
                    setSelectedTemplate(versionedTemplateId);
                  }}
                />
              </div>
            </div>

            <h4>Dashboard Layout Patterns</h4>
            <ul>
              <li>
                <strong>Header with actions:</strong> Page title with primary action buttons
              </li>
              <li>
                <strong>Filtered lists:</strong> Search and filter capabilities for large datasets
              </li>
              <li>
                <strong>Pagination:</strong> Load more functionality for performance
              </li>
              <li>
                <strong>Status indicators:</strong> Visual status and metadata display
              </li>
            </ul>
          </div>
        </section>

        {/* Content Management */}
        <section id="content-management">
          <h2>Content Management</h2>
          <p>Specialized interfaces for managing template content, sections, and questions.</p>

          <div className="component-example">
            <h3>Template Content Management</h3>
            <div className="example-demo">
              <div
                style={{
                  border: "1px solid var(--gray-300)",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  background: "var(--white)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Template Structure</h4>
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
                    Add Section
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {mockSections.map((section, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      style={{ border: "1px solid var(--gray-200)", borderRadius: "4px", padding: "1rem" }}
                    >
                      <SectionHeaderEdit
                        title={section.title}
                        sectionNumber={section.sectionNumber}
                        editUrl={section.editUrl}
                        onMoveUp={sectionIndex > 0 ? () => console.log("Move up") : undefined}
                        onMoveDown={sectionIndex < mockSections.length - 1 ? () => console.log("Move down") : undefined}
                      />

                      <div style={{ marginTop: "1rem", paddingLeft: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <h5 style={{ margin: 0, fontSize: "0.875rem", color: "var(--gray-600)" }}>Questions</h5>
                          <button
                            style={{
                              padding: "0.25rem 0.5rem",
                              background: "var(--blue-500)",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                            }}
                          >
                            Add Question
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {mockQuestions.slice(0, 2).map((question, questionIndex) => (
                            <QuestionEditCard
                              key={question.id}
                              id={question.id}
                              text={question.text}
                              link={question.link}
                              name={question.name}
                              displayOrder={question.displayOrder}
                              handleDisplayOrderChange={(questionId, newOrder) => {
                                console.log("Change order:", questionId, newOrder);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <h4>Content Management Features</h4>
            <ul>
              <li>
                <strong>Hierarchical organization:</strong> Sections containing questions with proper nesting
              </li>
              <li>
                <strong>Drag and drop:</strong> Visual reordering of sections and questions
              </li>
              <li>
                <strong>Bulk operations:</strong> Select multiple items for batch operations
              </li>
              <li>
                <strong>Preview modes:</strong> Switch between edit and preview modes
              </li>
            </ul>
          </div>
        </section>

        {/* Implementation Guidelines */}
        <section id="implementation">
          <h2>Implementation Guidelines</h2>

          <div className="guidelines-grid">
            <div className="guideline-item">
              <h3>Performance</h3>
              <p>
                Use pagination and virtualization for large lists. Implement proper loading states and error handling.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Accessibility</h3>
              <p>All components include proper ARIA labels, keyboard navigation, and screen reader support.</p>
            </div>
            <div className="guideline-item">
              <h3>State Management</h3>
              <p>Handle selection states, expansion states, and reordering operations with proper state management.</p>
            </div>
            <div className="guideline-item">
              <h3>Responsive Design</h3>
              <p>Components adapt to different screen sizes with appropriate touch targets and layout adjustments.</p>
            </div>
          </div>

          <h3>Best Practices</h3>
          <ul>
            <li>
              <strong>Consistent spacing:</strong> Use consistent margins and padding throughout lists
            </li>
            <li>
              <strong>Loading states:</strong> Show appropriate loading indicators for async operations
            </li>
            <li>
              <strong>Error handling:</strong> Provide graceful error states and recovery options
            </li>
            <li>
              <strong>Selection feedback:</strong> Clear visual feedback for selected items
            </li>
            <li>
              <strong>Keyboard navigation:</strong> Full keyboard support for all interactive elements
            </li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>
              <strong>Template selection:</strong> Choose from available DMP templates
            </li>
            <li>
              <strong>Project management:</strong> View and manage research projects
            </li>
            <li>
              <strong>Content editing:</strong> Manage template sections and questions
            </li>
            <li>
              <strong>Dashboard views:</strong> Organize and display various data types
            </li>
            <li>
              <strong>Search results:</strong> Display filtered and searchable content
            </li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
