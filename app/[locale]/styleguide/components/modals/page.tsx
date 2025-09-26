"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";

// Import modal components
import ConfirmModal from "@/components/Modal/ConfirmModal";
import { ModalOverlayComponent } from "@/components/ModalOverlayComponent";

import "../../shared/styleguide.scss";

export default function ModalsPage() {
  // State for modal examples
  const [_showConfirmModal, _setShowConfirmModal] = React.useState(false);
  const [showOverlayModal, setShowOverlayModal] = React.useState(false);

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
          <span aria-current="page">Modals</span>
        </nav>

        <h1>Modal Components</h1>
        <p className="lead">
          Dialog overlays for user interactions, confirmations, and focused content display that requires attention.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <div className="toc-grid">
            <div className="toc-section">
              <h3>Available Modals</h3>
              <ul>
                <li>
                  <a href="#confirm-modal">Confirm Modal</a>
                </li>
                <li>
                  <a href="#modal-overlay">Modal Overlay</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Implementation</h3>
              <ul>
                <li>
                  <a href="#modal-guidelines">Usage Guidelines</a>
                </li>
                <li>
                  <a href="#implementation">Implementation</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Confirm Modal */}
        <section id="confirm-modal">
          <h2>Confirm Modal</h2>
          <p>Pre-built confirmation modal for email-related actions with localized text.</p>

          <div className="component-example">
            <h3>Email Confirmation Modal</h3>
            <div className="example-demo">
              <ConfirmModal
                title="Remove User Access"
                email="user@example.com"
                onConfirm={(email) => {
                  console.log("Confirmed removal for:", email);
                }}
              />
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import ConfirmModal from '@/components/Modal/ConfirmModal';

<ConfirmModal
  title="Remove User Access"
  email="user@example.com"
  onConfirm={(email) => {
    handleRemoveUser(email);
  }}
/>`}</code>
            </pre>

            <h4>Features</h4>
            <ul>
              <li>Built-in trigger button with localized &quot;Remove&quot; text</li>
              <li>Email-specific confirmation message</li>
              <li>Localized cancel and confirm buttons</li>
              <li>Automatic modal state management</li>
            </ul>

            <h4>Use Cases</h4>
            <ul>
              <li>Removing users from projects</li>
              <li>Revoking email access</li>
              <li>Template access management</li>
            </ul>
          </div>
        </section>

        {/* Modal Overlay */}
        <section id="modal-overlay">
          <h2>Modal Overlay Component</h2>
          <p>Flexible overlay component for custom modal implementations and specialized use cases.</p>

          <div className="component-example">
            <h3>Custom Overlay Modal</h3>
            <div className="example-demo">
              <button
                onClick={() => setShowOverlayModal(true)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--green-500)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Open Custom Overlay
              </button>

              {showOverlayModal && (
                <ModalOverlayComponent
                  isOpen={showOverlayModal}
                  heading="Custom Modal Example"
                  content="This modal uses the ModalOverlayComponent for complete control over the modal's appearance and behavior. It's useful when you need custom styling, specialized interaction patterns, or integration with other overlay systems."
                  btnSecondaryText="Cancel"
                  btnPrimaryText="Confirm"
                  onPressAction={(e, close) => {
                    console.log("Custom action confirmed");
                    close();
                  }}
                />
              )}
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { ModalOverlayComponent } from '@/components/ModalOverlayComponent';

<ModalOverlayComponent
  isOpen={isOpen}
  heading="Modal Title"
  content="Modal content text"
  btnSecondaryText="Cancel"
  btnPrimaryText="Confirm"
  onPressAction={(e, close) => {
    // Handle action
    close();
  }}
/>`}</code>
            </pre>

            <h4>Use Cases</h4>
            <ul>
              <li>Image galleries or lightboxes</li>
              <li>Multi-step wizards or forms</li>
              <li>Custom confirmation dialogs</li>
              <li>Specialized content viewers</li>
            </ul>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section id="modal-guidelines">
          <h2>Usage Guidelines</h2>

          <div className="guidelines-grid">
            <div className="guideline-item">
              <h3>When to Use Modals</h3>
              <ul>
                <li>Critical actions requiring confirmation</li>
                <li>Forms that shouldn&apos;t be interrupted</li>
                <li>Detailed information display</li>
                <li>Error messages or alerts</li>
              </ul>
            </div>
            <div className="guideline-item">
              <h3>Accessibility</h3>
              <ul>
                <li>Focus management (trap focus within modal)</li>
                <li>Keyboard navigation (ESC to close)</li>
                <li>Screen reader announcements</li>
                <li>Proper ARIA labels and roles</li>
              </ul>
            </div>
            <div className="guideline-item">
              <h3>UX Best Practices</h3>
              <ul>
                <li>Clear close mechanisms</li>
                <li>Appropriate sizing for content</li>
                <li>Backdrop click to close (when appropriate)</li>
                <li>Loading states for async operations</li>
              </ul>
            </div>
            <div className="guideline-item">
              <h3>Performance</h3>
              <ul>
                <li>Lazy load modal content when possible</li>
                <li>Unmount modals when closed</li>
                <li>Avoid nesting modals</li>
                <li>Consider mobile viewport constraints</li>
              </ul>
            </div>
          </div>

          <h3>Modal Hierarchy</h3>
          <ol>
            <li>
              <strong>Basic Modal:</strong> General content display
            </li>
            <li>
              <strong>Confirm Modal:</strong> Action confirmations
            </li>
            <li>
              <strong>Modal Overlay:</strong> Custom implementations
            </li>
          </ol>

          <h3>Keyboard Interactions</h3>
          <ul>
            <li>
              <kbd>Escape</kbd> - Close modal
            </li>
            <li>
              <kbd>Tab</kbd> - Navigate within modal (focus trap)
            </li>
            <li>
              <kbd>Enter</kbd> - Activate focused button
            </li>
            <li>
              <kbd>Space</kbd> - Activate focused button
            </li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
