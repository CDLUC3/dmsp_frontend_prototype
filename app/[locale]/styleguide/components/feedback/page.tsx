"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import Spinner from "@/components/Spinner";

import "../../shared/styleguide.scss";
import {
  SGComponentExample,
  SGComponentExampleHeader,
  SGComponentExampleContent,
  SGComponentExampleDemo,
  SGCodeBlock,
  SGPropsTable,
  SGTocGrid,
  SGTocSection,
  SGGuidelinesGrid,
  SGGuidelineItem,
} from "../../shared/components";

export default function SpinnerPage() {
  // State for interactive examples
  const [showSpinner, setShowSpinner] = React.useState(false);
  const [showInlineSpinner, setShowInlineSpinner] = React.useState(false);

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
          <span aria-current="page">Feedback & Loading</span>
        </nav>

        <h1>Feedback & Loading Components</h1>
        <p className="lead">
          Loading indicator component for showing asynchronous operations and system processing states.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <SGTocGrid>
            <SGTocSection title="Basic Usage">
              <ul>
                <li>
                  <a href="#basic-spinner">Basic Spinner</a>
                </li>
                <li>
                  <a href="#inline-spinner">Inline Spinner</a>
                </li>
              </ul>
            </SGTocSection>
            <SGTocSection title="Use Cases">
              <ul>
                <li>
                  <a href="#form-loading">Form Loading States</a>
                </li>
                <li>
                  <a href="#search-loading">Search Loading</a>
                </li>
                <li>
                  <a href="#page-loading">Page Loading</a>
                </li>
              </ul>
            </SGTocSection>
          </SGTocGrid>
        </section>

        {/* Basic Spinner */}
        <section id="basic-spinner">
          <h2>Basic Spinner</h2>
          <p>Standard loading spinner with customizable visibility and styling.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Interactive Spinner Example" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                  <button
                    onClick={() => setShowSpinner(!showSpinner)}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "var(--blue-500)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {showSpinner ? "Hide" : "Show"} Spinner
                  </button>

                  <div
                    style={{
                      minHeight: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid var(--gray-300)",
                      borderRadius: "4px",
                      background: "var(--gray-50)",
                      width: "100%",
                    }}
                  >
                    <Spinner
                      isActive={showSpinner}
                      className=""
                      id="demo-spinner"
                    />
                    {!showSpinner && (
                      <p style={{ color: "var(--gray-600)", margin: 0 }}>Click the button above to show the spinner</p>
                    )}
                  </div>
                </div>
              </SGComponentExampleDemo>

              <h4>Usage</h4>
              <SGCodeBlock>{`import Spinner from '@/components/Spinner';

const [isLoading, setIsLoading] = useState(false);

<Spinner 
  isActive={isLoading}
  className=""
  id="my-spinner"
/>`}</SGCodeBlock>

              <h4>Props</h4>
              <SGPropsTable>
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>isActive</code>
                    </td>
                    <td>boolean</td>
                    <td>-</td>
                    <td>Controls spinner visibility</td>
                  </tr>
                  <tr>
                    <td>
                      <code>className</code>
                    </td>
                    <td>string</td>
                    <td>&quot;&quot;</td>
                    <td>Additional CSS classes</td>
                  </tr>
                  <tr>
                    <td>
                      <code>id</code>
                    </td>
                    <td>string</td>
                    <td>&quot;spinner&quot;</td>
                    <td>Unique identifier for the spinner</td>
                  </tr>
                </tbody>
              </SGPropsTable>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Inline Spinner */}
        <section id="inline-spinner">
          <h2>Inline Spinner</h2>
          <p>Small spinner for inline loading states, commonly used in buttons and form fields.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Inline Loading Examples" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Button with spinner */}
                  <div>
                    <h4>Button with Spinner</h4>
                    <button
                      onClick={() => setShowInlineSpinner(!showInlineSpinner)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "var(--green-500)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Spinner
                        isActive={showInlineSpinner}
                        className="small"
                        id="button-spinner"
                      />
                      {showInlineSpinner ? "Saving..." : "Save Changes"}
                    </button>
                  </div>

                  {/* Search field with spinner */}
                  <div>
                    <h4>Search Field with Spinner</h4>
                    <div style={{ position: "relative", maxWidth: "300px" }}>
                      <input
                        type="text"
                        placeholder="Search for templates..."
                        style={{
                          width: "100%",
                          padding: "0.75rem 2.5rem 0.75rem 0.75rem",
                          border: "1px solid var(--gray-300)",
                          borderRadius: "4px",
                          fontSize: "1rem",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        <Spinner
                          isActive={showInlineSpinner}
                          className="small"
                          id="search-spinner"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SGComponentExampleDemo>

              <h4>Usage</h4>
              <SGCodeBlock>{`// Button with loading state
<button disabled={isLoading}>
  <Spinner isActive={isLoading} className="small" />
  {isLoading ? "Saving..." : "Save"}
</button>

// Inline search field
<div style={{ position: "relative" }}>
  <input type="text" placeholder="Search..." />
  <Spinner 
    isActive={isSearching} 
    className="small" 
      id="search-spinner"
    />
 </div>`}</SGCodeBlock>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Form Loading States */}
        <section id="form-loading">
          <h2>Form Loading States</h2>
          <p>Using spinners in form contexts to indicate processing states.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Form Submission Loading" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    padding: "1.5rem",
                    maxWidth: "400px",
                  }}
                >
                  <h4 style={{ margin: "0 0 1rem 0" }}>Create New Project</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.25rem" }}>Project Name</label>
                      <input
                        type="text"
                        placeholder="Enter project name"
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid var(--gray-300)",
                          borderRadius: "4px",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        style={{
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          color: "var(--gray-600)",
                          border: "1px solid var(--gray-300)",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowSpinner(!showSpinner)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--blue-500)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Spinner
                          isActive={showSpinner}
                          className="small"
                          id="form-spinner"
                        />
                        {showSpinner ? "Creating..." : "Create Project"}
                      </button>
                    </div>
                  </div>
                </div>
              </SGComponentExampleDemo>

              <h4>Best Practices</h4>
              <ul>
                <li>
                  <strong>Disable form elements:</strong> Prevent user interaction during loading states
                </li>
                <li>
                  <strong>Clear feedback:</strong> Use descriptive text alongside the spinner
                </li>
                <li>
                  <strong>Consistent placement:</strong> Position spinners near the action being performed
                </li>
                <li>
                  <strong>Appropriate sizing:</strong> Use smaller spinners for inline contexts
                </li>
              </ul>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Search Loading */}
        <section id="search-loading">
          <h2>Search Loading States</h2>
          <p>Spinners for search operations and autocomplete functionality.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Search with Loading Indicator" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div style={{ maxWidth: "400px" }}>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search templates..."
                      style={{
                        width: "100%",
                        padding: "0.75rem 3rem 0.75rem 0.75rem",
                        border: "1px solid var(--gray-300)",
                        borderRadius: "4px",
                        fontSize: "1rem",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Spinner
                        isActive={showInlineSpinner}
                        className="small"
                        id="search-loading"
                      />
                      <button
                        onClick={() => setShowInlineSpinner(!showInlineSpinner)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.25rem",
                        }}
                        aria-label="Toggle search loading"
                      >
                        🔍
                      </button>
                    </div>
                  </div>

                  {showInlineSpinner && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        background: "var(--gray-50)",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        color: "var(--gray-600)",
                      }}
                    >
                      Searching for templates...
                    </div>
                  )}
                </div>
              </SGComponentExampleDemo>

              <h4>Implementation Notes</h4>
              <ul>
                <li>
                  <strong>Positioning:</strong> Place spinner inside the input field for better UX
                </li>
                <li>
                  <strong>Debouncing:</strong> Implement search debouncing to avoid excessive API calls
                </li>
                <li>
                  <strong>Clear states:</strong> Hide spinner when search completes or is cancelled
                </li>
              </ul>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Page Loading */}
        <section id="page-loading">
          <h2>Page Loading States</h2>
          <p>Full-page or section loading indicators for initial page loads and data fetching.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Page Loading Example" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div
                  style={{
                    border: "1px solid var(--gray-300)",
                    borderRadius: "4px",
                    padding: "2rem",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--gray-25)",
                  }}
                >
                  <Spinner
                    isActive={showSpinner}
                    className=""
                    id="page-spinner"
                  />
                  {showSpinner && (
                    <p
                      style={{
                        margin: "1rem 0 0 0",
                        color: "var(--gray-600)",
                        textAlign: "center",
                      }}
                    >
                      Loading your projects...
                    </p>
                  )}
                  {!showSpinner && (
                    <button
                      onClick={() => setShowSpinner(true)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "var(--blue-500)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Simulate Page Load
                    </button>
                  )}
                </div>
              </SGComponentExampleDemo>

              <h4>Usage Patterns</h4>
              <ul>
                <li>
                  <strong>Initial load:</strong> Show spinner while fetching page data
                </li>
                <li>
                  <strong>Section loading:</strong> Use for loading specific content areas
                </li>
                <li>
                  <strong>Overlay loading:</strong> Combine with backdrop for modal-like loading
                </li>
                <li>
                  <strong>Skeleton screens:</strong> Consider skeleton loading for better perceived performance
                </li>
              </ul>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>

        {/* Implementation Guidelines */}
        <section id="implementation">
          <h2>Implementation Guidelines</h2>

          <SGGuidelinesGrid>
            <SGGuidelineItem title="Accessibility">
              <p>
                Spinners include proper ARIA attributes and are hidden from screen readers when inactive to avoid
                confusion.
              </p>
            </SGGuidelineItem>
            <SGGuidelineItem title="Performance">
              <p>Use spinners judiciously - avoid showing them for operations that complete very quickly.</p>
            </SGGuidelineItem>
            <SGGuidelineItem title="User Experience">
              <p>Provide clear context about what is loading and consider timeout handling for long operations.</p>
            </SGGuidelineItem>
            <SGGuidelineItem title="Visual Design">
              <p>
                Spinners use consistent styling and can be customized with additional CSS classes for specific contexts.
              </p>
            </SGGuidelineItem>
          </SGGuidelinesGrid>

          <h3>CSS Classes</h3>
          <SGPropsTable>
            <thead>
              <tr>
                <th>Class</th>
                <th>Purpose</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>.spinner</code>
                </td>
                <td>Base spinner styling</td>
                <td>Applied automatically</td>
              </tr>
              <tr>
                <td>
                  <code>.small</code>
                </td>
                <td>Smaller spinner variant</td>
                <td>For inline contexts, buttons</td>
              </tr>
              <tr>
                <td>
                  <code>.large</code>
                </td>
                <td>Larger spinner variant</td>
                <td>For page-level loading</td>
              </tr>
            </tbody>
          </SGPropsTable>

          <h3>Best Practices</h3>
          <ul>
            <li>
              <strong>Timing:</strong> Show spinners for operations longer than 200ms
            </li>
            <li>
              <strong>Context:</strong> Always provide context about what is loading
            </li>
            <li>
              <strong>Placement:</strong> Position spinners near the action being performed
            </li>
            <li>
              <strong>Consistency:</strong> Use the same spinner component throughout the application
            </li>
            <li>
              <strong>Fallbacks:</strong> Consider skeleton screens for complex loading states
            </li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
