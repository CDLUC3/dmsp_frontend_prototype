"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { Button } from "react-aria-components";
import Spinner from "@/components/Spinner";

import "../../shared/styleguide.scss";
import {
  SGComponentExample,
  SGComponentExampleHeader,
  SGComponentExampleContent,
  SGComponentExampleDemo,
  SGCodeBlock,
  SGPropsTable,
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

        {/* Basic Spinner */}
        <section id="basic-spinner">
          <h2>Basic Spinner</h2>
          <p>Standard loading spinner with customizable visibility and styling.</p>

          <SGComponentExample>
            <SGComponentExampleHeader title="Interactive Spinner Example" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <div className="spinner-demo-container">
                  <Button
                    onPress={() => setShowSpinner(!showSpinner)}
                    className="primary"
                  >
                    {showSpinner ? "Hide" : "Show"} Spinner
                  </Button>

                  <div className="spinner-demo-area">
                    <Spinner
                      isActive={showSpinner}
                      className=""
                      id="demo-spinner"
                    />
                    {!showSpinner && <p className="spinner-demo-text">Click the button above to show the spinner</p>}
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
            <SGComponentExampleHeader title="Button with Spinner" />
            <SGComponentExampleContent>
              <SGComponentExampleDemo>
                <Button
                  onPress={() => setShowInlineSpinner(!showInlineSpinner)}
                  className="secondary"
                >
                  <Spinner
                    isActive={showInlineSpinner}
                    className="small me-2"
                    id="button-spinner"
                  />
                  {showInlineSpinner ? "Saving..." : "Save Changes"}
                </Button>
              </SGComponentExampleDemo>

              <h4>Usage</h4>
              <SGCodeBlock>{`import { Button } from 'react-aria-components';

// Button with loading state
<Button isDisabled={isLoading} className="secondary">
  <Spinner isActive={isLoading} className="small" />
  {isLoading ? "Saving..." : "Save"}
</Button>`}</SGCodeBlock>
            </SGComponentExampleContent>
          </SGComponentExample>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
