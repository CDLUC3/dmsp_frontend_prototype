"use client";

import React from "react";
import Link from "next/link";
import { ContentContainer, LayoutContainer } from "@/components/Container";

// Import our custom Form components
import {
  FormInput,
  FormTextArea,
  FormSelect,
  CheckboxGroupComponent,
  RadioGroupComponent,
  DateComponent,
  NumberComponent,
  RangeComponent,
  MultiSelect,
  TypeAheadSearch,
} from "@/components/Form";

// Import React Aria components for checkbox and radio examples
import { Checkbox, Radio, ListBoxItem } from "react-aria-components";

// Import React Aria components for comparison

import "../../shared/styleguide.scss";

export default function FormElementsPage() {
  // State for interactive examples
  const [selectedRadio, setSelectedRadio] = React.useState("planning");
  const [selectedCheckboxes, setSelectedCheckboxes] = React.useState<string[]>(["email"]);
  const [selectedCountry, setSelectedCountry] = React.useState<string>("us");
  const [textAreaValue, setTextAreaValue] = React.useState<string>("This is sample text in the textarea...");
  const [richTextValue, setRichTextValue] = React.useState<string>(
    "<p>This is <strong>rich text</strong> with <em>formatting</em>.</p>",
  );
  const [numberValue, setNumberValue] = React.useState<number>(100);
  const [dateValue, setDateValue] = React.useState<string | null>(null);
  const [rangeStart, setRangeStart] = React.useState<string>("Minimum Value");
  const [rangeEnd, setRangeEnd] = React.useState<string>("Maximum Value");

  // Data for FormSelect
  const countries = [
    { id: "us", name: "United States" },
    { id: "uk", name: "United Kingdom" },
    { id: "ca", name: "Canada" },
    { id: "au", name: "Australia" },
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
          <span aria-current="page">Form Elements</span>
        </nav>

        <h1>Form Elements</h1>
        <p className="lead">
          Form components built on React Aria with our custom abstractions for consistent styling and behavior.
        </p>

        {/* Table of Contents */}
        <section id="table-of-contents">
          <h2>Contents</h2>
          <div className="toc-grid">
            <div className="toc-section">
              <h3>Text Inputs</h3>
              <ul>
                <li>
                  <a href="#text-input">Text Input</a>
                </li>
                <li>
                  <a href="#textarea">Text Area</a>
                </li>
                <li>
                  <a href="#number-input">Number Input</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Selection</h3>
              <ul>
                <li>
                  <a href="#select">Select Dropdown</a>
                </li>
                <li>
                  <a href="#multiselect">Multi-Select</a>
                </li>
                <li>
                  <a href="#typeahead">Type-ahead Search</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Choice Controls</h3>
              <ul>
                <li>
                  <a href="#checkboxes">Checkboxes</a>
                </li>
                <li>
                  <a href="#radio-buttons">Radio Buttons</a>
                </li>
              </ul>
            </div>
            <div className="toc-section">
              <h3>Specialized</h3>
              <ul>
                <li>
                  <a href="#date-picker">Date Picker</a>
                </li>
                <li>
                  <a href="#range-input">Range Input Fields</a>
                </li>
                <li>
                  <a href="#toast-messages">Toast Messages</a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Text Input */}
        <section id="text-input">
          <h2>Text Input</h2>
          <p>Standard text input field with label, validation, and help text support.</p>

          <div className="component-example">
            <h3>Interactive Text Input Example</h3>
            <div className="example-demo">
              <FormInput
                name="example-input"
                label="Full Name"
                placeholder="Enter your full name"
                description="This will be displayed on your profile"
              />
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { FormInput } from '@/components/Form';

<FormInput
  name="fullName"
  label="Full Name"
  placeholder="Enter your full name"
  description="This will be displayed on your profile"
  required
/>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>TextField</code>, <code>Input</code>, and <code>Label</code>{" "}
              components.
            </p>
          </div>
        </section>

        {/* Text Area */}
        <section id="textarea">
          <h2>Text Area</h2>
          <p>Multi-line text input for longer content, with optional rich text editing.</p>

          <div className="component-example">
            <h3>Standard Text Area</h3>
            <div className="example-demo">
              <FormTextArea
                name="example-textarea"
                label="Description"
                placeholder="Enter a detailed description..."
                description="Provide as much detail as possible"
                value={textAreaValue}
                onChange={setTextAreaValue}
                richText={false}
              />
              <p>
                <small>Characters: {textAreaValue.length}</small>
              </p>
            </div>

            <h3>Rich Text Editor (WYSIWYG)</h3>
            <div className="example-demo">
              <FormTextArea
                name="example-richtext"
                label="Rich Text Content"
                description="Use the toolbar to format your text"
                value={richTextValue}
                onChange={setRichTextValue}
                richText={true}
              />
              <details style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
                <summary>View HTML Output</summary>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "0.5rem",
                    marginTop: "0.5rem",
                    fontSize: "0.75rem",
                    overflow: "auto",
                  }}
                >
                  {richTextValue}
                </pre>
              </details>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { FormTextArea } from '@/components/Form';

// Standard textarea
<FormTextArea
  name="description"
  label="Description"
  placeholder="Enter a detailed description..."
  value={textValue}
  onChange={setTextValue}
  richText={false}
/>

// Rich text editor
<FormTextArea
  name="content"
  label="Rich Content"
  value={richTextValue}
  onChange={setRichTextValue}
  richText={true}
/>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>TextField</code> and <code>TextArea</code> components, with TinyMCE
              integration for rich text editing.
            </p>
          </div>
        </section>

        {/* Number Input */}
        <section id="number-input">
          <h2>Number Input</h2>
          <p>Numeric input with validation and formatting.</p>

          <div className="component-example">
            <h3>Number Input with +/- Controls</h3>
            <div className="example-demo">
              <NumberComponent
                label="Budget Amount"
                placeholder="0"
                value={numberValue}
                minValue={0}
                maxValue={1000000}
                step={10}
                onChange={setNumberValue}
              />
              <p>
                <small>Current value: {numberValue}</small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { NumberComponent } from '@/components/Form';

<NumberComponent
  label="Budget Amount"
  placeholder="0"
  value={budgetValue}
  minValue={0}
  maxValue={1000000}
  step={10}
  onChange={setBudgetValue}
/>`}</code>
            </pre>
          </div>
        </section>

        {/* Select */}
        <section id="select">
          <h2>Select Dropdown</h2>
          <p>Dropdown selection with search and keyboard navigation.</p>

          <div className="component-example">
            <h3>Searchable Select Dropdown</h3>
            <div className="example-demo">
              <FormSelect
                label="Country"
                placeholder="Select a country"
                description="Choose your country of residence"
                items={countries}
                selectedKey={selectedCountry}
                onChange={(selected) => setSelectedCountry(selected as string)}
              >
                {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
              </FormSelect>
              <p>
                <small>Selected: {countries.find((c) => c.id === selectedCountry)?.name}</small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { FormSelect } from '@/components/Form';

<FormSelect
  label="Country"
  placeholder="Select a country"
  items={countries}
  selectedKey={selectedCountry}
  onChange={(selected) => setSelectedCountry(selected as string)}
>
  {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
</FormSelect>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>Select</code>, <code>ListBox</code>, and <code>Popover</code>{" "}
              components.
            </p>
          </div>
        </section>

        {/* Multi-Select */}
        <section id="multiselect">
          <h2>Multi-Select</h2>
          <p>Select multiple options with tag display and removal.</p>

          <div className="component-example">
            <h3>Multi-Select with Visual Tags</h3>
            <div className="example-demo">
              <MultiSelect
                label="Skills"
                options={[
                  { id: "react", name: "React" },
                  { id: "typescript", name: "TypeScript" },
                  { id: "node", name: "Node.js" },
                  { id: "python", name: "Python" },
                ]}
              />
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { MultiSelect } from '@/components/Form';

<MultiSelect
  name="skills"
  label="Skills"
  placeholder="Select your skills"
  options={[
    { id: "react", name: "React" },
    { id: "typescript", name: "TypeScript" },
    // ...
  ]}
  selectedKeys={selectedSkills}
  onSelectionChange={setSelectedSkills}
/>`}</code>
            </pre>
          </div>
        </section>

        {/* Type-ahead Search */}
        <section id="typeahead">
          <h2>Type-ahead Search</h2>
          <p>Search and select from large datasets with autocomplete.</p>

          <div className="component-example">
            <h3>Autocomplete Search Field</h3>
            <div className="example-demo">
              <TypeAheadSearch
                typeaheadSearchLabel="Institution Search"
                typeaheadHelpText="Start typing to search for your institution"
                labelText="Institution Label"
                labelTextPlaceholder="Enter label..."
                helpText="Help Text"
                helpTextPlaceholder="Enter help text..."
                handleTypeAheadSearchLabelChange={(value) => console.log("Label:", value)}
                handleTypeAheadHelpTextChange={(value) => console.log("Help:", value)}
              />
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { TypeAheadSearch } from '@/components/Form';

<TypeAheadSearch
  name="institution"
  label="Institution"
  placeholder="Start typing to search..."
  onSearch={handleSearch}
  onSelect={handleSelect}
/>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>ComboBox</code> and related components.
            </p>
          </div>
        </section>

        {/* Checkboxes */}
        <section id="checkboxes">
          <h2>Checkboxes</h2>
          <p>Multiple choice selection with individual or group validation.</p>

          <div className="component-example">
            <h3>Interactive Checkbox Group</h3>
            <div className="example-demo">
              <CheckboxGroupComponent
                name="example-checkboxes"
                checkboxGroupLabel="Preferred Contact Methods"
                checkboxGroupDescription="Select all methods you'd like us to use"
                value={selectedCheckboxes}
                onChange={setSelectedCheckboxes}
              >
                <div key="email">
                  <Checkbox
                    value="email"
                    aria-label="checkbox"
                  >
                    <div className="checkbox">
                      <svg
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                      >
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <div>
                      <span>Email</span>
                    </div>
                  </Checkbox>
                </div>
                <div key="phone">
                  <Checkbox
                    value="phone"
                    aria-label="checkbox"
                  >
                    <div className="checkbox">
                      <svg
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                      >
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <div>
                      <span>Phone</span>
                    </div>
                  </Checkbox>
                </div>
                <div key="sms">
                  <Checkbox
                    value="sms"
                    aria-label="checkbox"
                  >
                    <div className="checkbox">
                      <svg
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                      >
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <div>
                      <span>SMS</span>
                    </div>
                  </Checkbox>
                </div>
                <div key="mail">
                  <Checkbox
                    value="mail"
                    aria-label="checkbox"
                  >
                    <div className="checkbox">
                      <svg
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                      >
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <div>
                      <span>Postal Mail</span>
                    </div>
                  </Checkbox>
                </div>
              </CheckboxGroupComponent>
              <p>
                <small>Selected: {selectedCheckboxes.join(", ") || "None"}</small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { CheckboxGroupComponent } from '@/components/Form';

<CheckboxGroupComponent
  name="contactMethods"
  checkboxGroupLabel="Preferred Contact Methods"
  value={selectedMethods}
  onChange={setSelectedMethods}
>
  {checkboxData.map((checkbox, index) => (
    <div key={index}>
      <Checkbox value={checkbox.value} aria-label="checkbox">
        <div className="checkbox">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <polyline points="1 9 7 14 15 4" />
          </svg>
        </div>
        <div>
          <span>{checkbox.label}</span>
        </div>
      </Checkbox>
    </div>
  ))}
</CheckboxGroupComponent>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>CheckboxGroup</code> and <code>Checkbox</code> components.
            </p>
          </div>
        </section>

        {/* Radio Buttons */}
        <section id="radio-buttons">
          <h2>Radio Buttons</h2>
          <p>Single choice selection from a group of options.</p>

          <div className="component-example">
            <h3>Interactive Radio Button Group</h3>
            <div className="example-demo">
              <RadioGroupComponent
                name="example-radio"
                radioGroupLabel="Project Status"
                value={selectedRadio}
                onChange={setSelectedRadio}
              >
                <div key="planning">
                  <Radio value="planning">Planning</Radio>
                </div>
                <div key="active">
                  <Radio value="active">Active</Radio>
                </div>
                <div key="completed">
                  <Radio value="completed">Completed</Radio>
                </div>
                <div key="on-hold">
                  <Radio value="on-hold">On Hold</Radio>
                </div>
              </RadioGroupComponent>
              <p>
                <small>Selected: {selectedRadio}</small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { RadioGroupComponent } from '@/components/Form';

<RadioGroupComponent
  name="projectStatus"
  radioGroupLabel="Project Status"
  value={status}
  onChange={setStatus}
>
  {radioButtonData.map((radioButton, index) => (
    <div key={index}>
      <Radio value={radioButton.value}>{radioButton.label}</Radio>
    </div>
  ))}
</RadioGroupComponent>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>RadioGroup</code> and <code>Radio</code> components.
            </p>
          </div>
        </section>

        {/* Date Picker */}
        <section id="date-picker">
          <h2>Date Picker</h2>
          <p>Calendar-based date selection with keyboard navigation and validation.</p>

          <div className="component-example">
            <h3>Calendar Date Picker</h3>
            <div className="example-demo">
              <DateComponent
                name="example-date"
                label="Project Start Date"
                value={dateValue}
                onChange={setDateValue}
              />
              <p>
                <small>Selected date: {dateValue ? dateValue.toString() : "None"}</small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { DateComponent } from '@/components/Form';

<DateComponent
  name="startDate"
  label="Project Start Date"
  description="Select when your project will begin"
  value={startDate}
  onChange={setStartDate}
/>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using React Aria&apos;s <code>DatePicker</code>, <code>Calendar</code>, and related components.
            </p>
          </div>
        </section>

        {/* Range Input Fields */}
        <section id="range-input">
          <h2>Range Input Fields</h2>
          <p>Paired text inputs for defining start and end values or ranges.</p>

          <div className="component-example">
            <h3>Paired Range Input Fields</h3>
            <div className="example-demo">
              <RangeComponent
                startLabel={rangeStart}
                endLabel={rangeEnd}
                handleRangeLabelChange={(field, value) => {
                  if (field === "start") setRangeStart(value);
                  if (field === "end") setRangeEnd(value);
                }}
              />
              <p>
                <small>
                  Range: &quot;{rangeStart}&quot; to &quot;{rangeEnd}&quot;
                </small>
              </p>
            </div>

            <h4>Usage</h4>
            <pre>
              <code>{`import { RangeComponent } from '@/components/Form';

<RangeComponent
  startLabel={startValue}
  endLabel={endValue}
  handleRangeLabelChange={(field, value) => {
    if (field === 'start') setStartValue(value);
    if (field === 'end') setEndValue(value);
  }}
/>`}</code>
            </pre>

            <h4>React Aria Base</h4>
            <p>
              Built using our <code>FormInput</code> components in a paired layout for range definitions.
            </p>
          </div>
        </section>

        {/* Toast Messages */}
        <section id="toast-messages">
          <div className="component-example">
            <h3 className="sg-section-heading">Toast Messages</h3>
            <p>
              Toast messages provide temporary feedback to users about actions they&apos;ve taken. Built with React Aria
              for accessibility and proper focus management.
            </p>

            <div className="example-demo">
              <h4 className="sg-sub-heading">Toast Types</h4>
              <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
                <div
                  className="toast toast-info"
                  style={{ position: "relative", transform: "none" }}
                >
                  <div>Information: Your changes have been saved as a draft.</div>
                  <button aria-label="Close toast">×</button>
                </div>

                <div
                  className="toast toast-success"
                  style={{ position: "relative", transform: "none" }}
                >
                  <div>Success: Project published successfully!</div>
                  <button aria-label="Close toast">×</button>
                </div>

                <div
                  className="toast toast-error"
                  style={{ position: "relative", transform: "none" }}
                >
                  <div>Error: Unable to save changes. Please try again.</div>
                  <button aria-label="Close toast">×</button>
                </div>
              </div>

              <h4 className="sg-sub-heading">Usage</h4>
              <pre>
                <code>{`import { useToast } from '@/context/ToastContext';

function MyComponent() {
  const toast = useToast();

  const handleSave = () => {
    // Perform save action
    toast.add("Changes saved successfully!", { 
      type: "success",
      timeout: 5000 
    });
  };

  const handleError = () => {
    toast.add("Something went wrong", { 
      type: "error",
      timeout: 8000 
    });
  };

  return (
    <div>
      <Button onPress={handleSave}>Save</Button>
      <Button onPress={handleError}>Trigger Error</Button>
    </div>
  );
}`}</code>
              </pre>

              <h4 className="sg-sub-heading">Toast Options</h4>
              <table className="props-table">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>type</code>
                    </td>
                    <td>
                      <code>&quot;info&quot; | &quot;success&quot; | &quot;error&quot; | &quot;warn&quot;</code>
                    </td>
                    <td>
                      <code>&quot;info&quot;</code>
                    </td>
                    <td>Visual style and semantic meaning</td>
                  </tr>
                  <tr>
                    <td>
                      <code>timeout</code>
                    </td>
                    <td>
                      <code>number</code>
                    </td>
                    <td>
                      <code>5000</code>
                    </td>
                    <td>Auto-dismiss time in milliseconds</td>
                  </tr>
                  <tr>
                    <td>
                      <code>priority</code>
                    </td>
                    <td>
                      <code>number</code>
                    </td>
                    <td>
                      <code>0</code>
                    </td>
                    <td>Display order priority</td>
                  </tr>
                </tbody>
              </table>

              <h4 className="sg-sub-heading">Best Practices</h4>
              <ul>
                <li>
                  <strong>Keep messages concise:</strong> Users should quickly understand what happened
                </li>
                <li>
                  <strong>Use appropriate types:</strong> Success for completed actions, error for failures, info for
                  general feedback
                </li>
                <li>
                  <strong>Provide context:</strong> Include relevant details about what succeeded or failed
                </li>
                <li>
                  <strong>Consider timing:</strong> Error messages may need longer timeouts than success messages
                </li>
                <li>
                  <strong>Avoid overuse:</strong> Don&apos;t show toasts for every minor interaction
                </li>
              </ul>

              <h4 className="sg-sub-heading">Accessibility Features</h4>
              <ul>
                <li>
                  <strong>ARIA roles:</strong> <code>alert</code> for errors, <code>status</code> for other types
                </li>
                <li>
                  <strong>Live regions:</strong> <code>aria-live=&quot;assertive&quot;</code> for errors,{" "}
                  <code>aria-live=&quot;polite&quot;</code> for others
                </li>
                <li>
                  <strong>Keyboard accessible:</strong> Close button can be focused and activated with keyboard
                </li>
                <li>
                  <strong>Screen reader friendly:</strong> Content is announced when toasts appear
                </li>
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
                All form components are built on React Aria for robust keyboard navigation, screen reader support, and
                ARIA compliance.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Consistent API</h3>
              <p>
                Our custom components provide a unified interface while leveraging React Aria&apos;s powerful primitives
                underneath.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Validation Ready</h3>
              <p>
                Built-in support for validation states, error messages, and help text to guide users through form
                completion.
              </p>
            </div>
            <div className="guideline-item">
              <h3>Responsive Design</h3>
              <p>
                Form elements adapt to different screen sizes and input methods (touch, mouse, keyboard) automatically.
              </p>
            </div>
          </div>

          <h3>Common Props</h3>
          <p>Most form components share these common properties:</p>
          <ul>
            <li>
              <code>name</code> - Form field name for submission
            </li>
            <li>
              <code>label</code> - Accessible label text
            </li>
            <li>
              <code>description</code> - Help text displayed below the field
            </li>
            <li>
              <code>required</code> - Marks field as required with validation
            </li>
            <li>
              <code>disabled</code> - Disables interaction with the field
            </li>
            <li>
              <code>value</code> & <code>onChange</code> - Controlled component pattern
            </li>
          </ul>
        </section>
      </ContentContainer>
    </LayoutContainer>
  );
}
