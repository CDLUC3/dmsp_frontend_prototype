"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { Button } from "react-aria-components";

// Import specialized button components
import BackButton from "@/components/BackButton";
import AddQuestionButton from "@/components/AddQuestionButton";
import AddSectionButton from "@/components/AddSectionButton";
import ButtonWithImage from "@/components/ButtonWithImage";
import ExpandButton from "@/components/ExpandButton";

import "../../shared/styleguide.scss";

export default function ButtonsPage() {
  // State for interactive examples
  const [expandedState, setExpandedState] = React.useState(false);

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
          <span aria-current="page">Buttons</span>
        </nav>

        <h1>Button Components</h1>
        <p className="lead">
          Button hierarchy, specialized variants, and interactive elements for user actions throughout the application.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <div className="toc-grid">
            <div className="toc-section">
              <h3>Core Button Types</h3>
              <ul>
                <li>
                  <a href="#primary-buttons">Primary Buttons</a>
                </li>
                <li>
                  <a href="#secondary-buttons">Secondary Buttons</a>
                </li>
                <li>
                  <a href="#tertiary-buttons">Tertiary Buttons</a>
                </li>
                <li>
                  <a href="#link-buttons">Link Buttons</a>
                </li>
                <li>
                  <a href="#danger-buttons">Danger Buttons</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Button Sizes & States</h3>
              <ul>
                <li>
                  <a href="#button-sizes">Button Sizes</a>
                </li>
                <li>
                  <a href="#button-states">Button States</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Specialized Components</h3>
              <ul>
                <li>
                  <a href="#back-button">Back Button</a>
                </li>
                <li>
                  <a href="#action-buttons">Action Buttons</a>
                </li>
                <li>
                  <a href="#enhanced-buttons">Enhanced Buttons</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Primary Buttons */}
        <section id="primary-buttons">
          <h2>Primary Buttons</h2>
          <p>The most important actions on a page. Use sparingly - typically one primary button per page or section.</p>

          <div className="component-example">
            <h3>Primary Button Examples</h3>
            <div className="example-demo">
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <Button className="primary">Save Changes</Button>
                <Button
                  className="primary"
                  isDisabled
                >
                  Disabled Primary
                </Button>
                <input
                  type="submit"
                  value="Submit Form"
                />
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { Button } from 'react-aria-components';

// React Aria Button
<Button className="primary">Save Changes</Button>

// HTML submit button (automatically primary)
<input type="submit" value="Submit Form" />

// HTML button
<button className="primary">Primary Action</button>`}</code>
            </pre>

            <h4>When to Use</h4>
            <ul>
              <li>Primary page actions (Save, Submit, Create, Publish)</li>
              <li>Form submissions</li>
              <li>Completing workflows or processes</li>
              <li>Confirming important actions</li>
            </ul>
          </div>
        </section>

        {/* Secondary Buttons */}
        <section id="secondary-buttons">
          <h2>Secondary Buttons</h2>
          <p>Important actions that are not the primary focus. Often used alongside primary buttons.</p>

          <div className="component-example">
            <h3>Secondary Button Examples</h3>
            <div className="example-demo">
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <Button className="secondary">Cancel</Button>
                <Button className="secondary">Edit</Button>
                <Button
                  className="secondary"
                  isDisabled
                >
                  Disabled Secondary
                </Button>
                <a
                  href="#"
                  className="button-secondary"
                >
                  Secondary Link
                </a>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`// React Aria Button
<Button className="secondary">Cancel</Button>

// HTML button
<button className="secondary">Edit</button>

// Link styled as secondary button
<a href="/edit" className="button-secondary">Edit Link</a>`}</code>
            </pre>

            <h4>When to Use</h4>
            <ul>
              <li>Cancel actions</li>
              <li>Secondary navigation</li>
              <li>Alternative actions</li>
              <li>Back/Previous steps</li>
            </ul>
          </div>
        </section>

        {/* Tertiary Buttons */}
        <section id="tertiary-buttons">
          <h2>Tertiary Buttons</h2>
          <p>Lower priority actions, often used for optional or less common actions.</p>

          <div className="component-example">
            <h3>Tertiary Button Examples</h3>
            <div className="example-demo">
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <Button className="tertiary">More Options</Button>
                <Button className="tertiary">Advanced Settings</Button>
                <Button
                  className="tertiary"
                  isDisabled
                >
                  Disabled Tertiary
                </Button>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`// React Aria Button
<Button className="tertiary">More Options</Button>

// HTML button
<button className="tertiary">Advanced Settings</button>`}</code>
            </pre>

            <h4>When to Use</h4>
            <ul>
              <li>Optional actions</li>
              <li>Advanced or expert features</li>
              <li>Secondary navigation within components</li>
              <li>Utility actions (refresh, reset, etc.)</li>
            </ul>
          </div>
        </section>

        {/* Link Buttons */}
        <section id="link-buttons">
          <h2>Link Buttons</h2>
          <p>Actions that appear as underlined text links, for minimal visual weight.</p>

          <div className="component-example">
            <h3>Link Button Examples</h3>
            <div className="example-demo">
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
                <Button className="link">View Details</Button>
                <Button className="link">Skip this step</Button>
                <Button
                  className="link"
                  isDisabled
                >
                  Disabled Link
                </Button>
                <a
                  href="#"
                  className="button-link"
                >
                  Link Button
                </a>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`// React Aria Button
<Button className="link">View Details</Button>

// HTML button
<button className="link">Skip this step</button>

// Link styled as button
<a href="/details" className="button-link">View Details</a>`}</code>
            </pre>

            <h4>When to Use</h4>
            <ul>
              <li>Optional or skip actions</li>
              <li>Inline actions within text</li>
              <li>Secondary actions with minimal visual weight</li>
              <li>Navigation that feels like an action</li>
            </ul>
          </div>
        </section>

        {/* Danger Buttons */}
        <section id="danger-buttons">
          <h2>Danger Buttons</h2>
          <p>Destructive actions that require user attention. Use with confirmation dialogs.</p>

          <div className="component-example">
            <h3>Danger Button Examples</h3>
            <div className="example-demo">
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <Button className="danger">Delete Project</Button>
                <Button className="danger">Remove User</Button>
                <Button
                  className="danger"
                  isDisabled
                >
                  Disabled Danger
                </Button>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`// React Aria Button
<Button className="danger">Delete Project</Button>

// HTML button
<button className="danger">Remove User</button>`}</code>
            </pre>

            <h4>When to Use</h4>
            <ul>
              <li>Delete actions</li>
              <li>Remove/revoke actions</li>
              <li>Irreversible changes</li>
              <li>Actions that could cause data loss</li>
            </ul>

            <h4>Best Practices</h4>
            <ul>
              <li>Always pair with confirmation dialogs</li>
              <li>Use clear, specific labels (&quot;Delete Project&quot; not &quot;Delete&quot;)</li>
              <li>Consider undo functionality where possible</li>
            </ul>
          </div>
        </section>

        {/* Button Sizes */}
        <section id="button-sizes">
          <h2>Button Sizes</h2>
          <p>Different button sizes for various contexts and visual hierarchy.</p>

          <div className="component-example">
            <h3>Size Variants</h3>
            <div className="example-demo">
              <div
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}
              >
                <Button className="primary">Default Size</Button>
                <Button className="primary small">Small Primary</Button>
              </div>
              <div
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}
              >
                <Button className="secondary">Default Secondary</Button>
                <Button className="secondary small">Small Secondary</Button>
              </div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <Button className="tertiary">Default Tertiary</Button>
                <Button className="tertiary small">Small Tertiary</Button>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`// Small button variant
<Button className="primary small">Small Primary</Button>
<Button className="secondary small">Small Secondary</Button>

// Default size (no additional class needed)
<Button className="primary">Default Size</Button>`}</code>
            </pre>

            <h4>When to Use Small Buttons</h4>
            <ul>
              <li>Dense interfaces with limited space</li>
              <li>Inline actions within content</li>
              <li>Secondary actions in toolbars</li>
              <li>Mobile interfaces where space is premium</li>
            </ul>
          </div>
        </section>

        {/* Button States */}
        <section id="button-states">
          <h2>Button States</h2>
          <p>Visual feedback for different interaction states.</p>

          <div className="component-example">
            <h3>Interactive States</h3>
            <div className="example-demo">
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}
              >
                <div>
                  <h4>Normal States</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Button className="primary">Primary</Button>
                    <Button className="secondary">Secondary</Button>
                    <Button className="tertiary">Tertiary</Button>
                  </div>
                </div>
                <div>
                  <h4>Disabled States</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Button
                      className="primary"
                      isDisabled
                    >
                      Primary Disabled
                    </Button>
                    <Button
                      className="secondary"
                      isDisabled
                    >
                      Secondary Disabled
                    </Button>
                    <Button
                      className="tertiary"
                      isDisabled
                    >
                      Tertiary Disabled
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <h4>State Guidelines</h4>
            <ul>
              <li>
                <strong>Normal:</strong> Default interactive state
              </li>
              <li>
                <strong>Hover:</strong> Visual feedback on mouse over
              </li>
              <li>
                <strong>Active/Pressed:</strong> Visual feedback during click
              </li>
              <li>
                <strong>Focus:</strong> Keyboard navigation indicator
              </li>
              <li>
                <strong>Disabled:</strong> Non-interactive state for unavailable actions
              </li>
            </ul>
          </div>
        </section>

        {/* Button Combinations */}
        <section id="button-combinations">
          <h2>Button Combinations</h2>
          <p>Common patterns for combining buttons in interfaces.</p>

          <div className="component-example">
            <h3>Common Button Patterns</h3>
            <div className="example-demo">
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Form Actions */}
                <div>
                  <h4>Form Actions</h4>
                  <div className="button-container">
                    <Button className="primary">Save Changes</Button>
                    <Button className="secondary">Cancel</Button>
                  </div>
                </div>

                {/* Modal Actions */}
                <div>
                  <h4>Modal Actions</h4>
                  <div className="button-container">
                    <Button className="danger">Delete</Button>
                    <Button className="secondary">Cancel</Button>
                  </div>
                </div>

                {/* Progressive Actions */}
                <div>
                  <h4>Progressive Actions</h4>
                  <div className="button-container">
                    <Button className="secondary">Previous</Button>
                    <Button className="primary">Next</Button>
                    <Button className="link">Skip</Button>
                  </div>
                </div>
              </div>
            </div>

            <h4>Pattern Guidelines</h4>
            <ul>
              <li>
                <strong>Primary + Secondary:</strong> Most common pattern for forms and modals
              </li>
              <li>
                <strong>Danger + Secondary:</strong> For destructive actions with cancel option
              </li>
              <li>
                <strong>Multiple Actions:</strong> Use button hierarchy to guide user attention
              </li>
              <li>
                <strong>Spacing:</strong> Use <code>.button-container</code> class for consistent spacing
              </li>
            </ul>
          </div>
        </section>

        {/* Back Button */}
        <section id="back-button">
          <h2>Back Button</h2>
          <p>Specialized navigation button for returning to previous pages or sections.</p>

          <div className="component-example">
            <h3>Interactive Back Button</h3>
            <div className="example-demo">
              <BackButton />
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import BackButton from '@/components/BackButton';

<BackButton />`}</code>
            </pre>
          </div>
        </section>

        {/* Action Buttons */}
        <section id="action-buttons">
          <h2>Action Buttons</h2>
          <p>Specialized buttons for specific application actions.</p>

          <div className="component-example">
            <h3>Content Action Buttons</h3>
            <div className="example-demo">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <AddQuestionButton
                  href="#"
                  onClick={() => console.log("Add question clicked")}
                />
                <AddSectionButton
                  href="#"
                  onClick={() => console.log("Add section clicked")}
                />
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import AddQuestionButton from '@/components/AddQuestionButton';
import AddSectionButton from '@/components/AddSectionButton';

<AddQuestionButton href="#" onClick={handleAddQuestion} />
<AddSectionButton href="#" onClick={handleAddSection} />`}</code>
            </pre>
          </div>
        </section>

        {/* Enhanced Buttons */}
        <section id="enhanced-buttons">
          <h2>Enhanced Buttons</h2>
          <p>Buttons with additional visual elements or interactive behavior.</p>

          <div className="component-example">
            <h3>Enhanced Button Examples</h3>
            <div className="example-demo">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <ButtonWithImage
                  url="#"
                  buttonText="Connect with ORCID"
                  imageUrl="/images/orcid.svg"
                />
                <ExpandButton
                  expanded={expandedState}
                  setExpanded={setExpandedState}
                  expandLabel="Show Details"
                  collapseLabel="Hide Details"
                />
                <p>
                  <small>Expanded state: {expandedState ? "Open" : "Closed"}</small>
                </p>
              </div>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import ButtonWithImage from '@/components/ButtonWithImage';
import ExpandButton from '@/components/ExpandButton';

<ButtonWithImage
  url="/connect"
  buttonText="Connect with ORCID"
  imageUrl="/images/orcid.svg"
/>

<ExpandButton
  expanded={isExpanded}
  setExpanded={setIsExpanded}
  expandLabel="Show Details"
  collapseLabel="Hide Details"
/>`}</code>
            </pre>
          </div>
        </section>

        {/* Implementation Guidelines */}
        <section id="implementation">
          <h2>Implementation Guidelines</h2>

          <div className="guidelines-grid">
            <div className="guideline-item">
              <h3>Button Hierarchy</h3>
              <p>
                Use primary for main actions, secondary for alternatives, tertiary for optional actions, and link
                buttons for minimal weight actions.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Consistent Labels</h3>
              <p>
                Use clear, action-oriented labels. Be specific (&quot;Delete Project&quot; not &quot;Delete&quot;) and
                consistent across the application.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Accessibility</h3>
              <p>
                All buttons support keyboard navigation, screen readers, and proper focus management with React Aria.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Visual Feedback</h3>
              <p>Buttons provide clear hover, focus, active, and disabled states for excellent user experience.</p>
            </div>
          </div>

          <h3>CSS Classes Reference</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
            <thead>
              <tr style={{ background: "var(--gray-75)", borderBottom: "1px solid var(--gray-200)" }}>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Class</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Purpose</th>
                <th style={{ padding: "0.75rem", textAlign: "left" }}>Usage</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>.primary</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Primary actions</td>
                <td style={{ padding: "0.75rem" }}>Main page actions, form submissions</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>.secondary</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Secondary actions</td>
                <td style={{ padding: "0.75rem" }}>Cancel, alternative actions</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>.tertiary</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Lower priority actions</td>
                <td style={{ padding: "0.75rem" }}>Optional, advanced features</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>.link</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Minimal weight actions</td>
                <td style={{ padding: "0.75rem" }}>Skip, inline actions</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>.danger</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Destructive actions</td>
                <td style={{ padding: "0.75rem" }}>Delete, remove, destructive changes</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--gray-200)" }}>
                <td style={{ padding: "0.75rem" }}>
                  <code>.small</code>
                </td>
                <td style={{ padding: "0.75rem" }}>Size modifier</td>
                <td style={{ padding: "0.75rem" }}>Combine with any button type</td>
              </tr>
            </tbody>
          </table>

          <h3>Best Practices</h3>
          <ul>
            <li>
              <strong>One Primary per Section:</strong> Limit primary buttons to guide user focus
            </li>
            <li>
              <strong>Clear Labels:</strong> Use specific, action-oriented text
            </li>
            <li>
              <strong>Consistent Placement:</strong> Follow established patterns for button positioning
            </li>
            <li>
              <strong>Confirm Destructive Actions:</strong> Always confirm danger buttons with modals
            </li>
            <li>
              <strong>Loading States:</strong> Show appropriate feedback during async operations
            </li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
