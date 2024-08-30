'use client';

import React, { useState } from 'react';
import {
  Button,
  Label,
  TextField,
  Input,
  FieldError,
  Link,
  Form,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  DialogTrigger,
  OverlayArrow,
  Dialog,
  Switch,
  Table,
  TableHeader,
  TableBody,
  Column,
  Row,
  Cell,
} from "react-aria-components";
import "./styleguide.scss";

import { DmpEditor } from "/components/Editor";
import { DmpIcon } from "/components/Icons";

import {
  Example,
  BrandColor,
} from "./sg-components";

import TypeAheadInput from '@/components/TypeAheadInput';
import TypeAheadWithOther from '@/components/TypeAheadWithOther';
import { AffiliationsDocument } from '@/generated/graphql';

function Page() {
  const [otherField, setOtherField] = useState(false);

    // NOTE: This text is just for testing the richtext editors
  const html = String.raw;
  const richtextDefault = html`
<p>In the project, various analytical methods will be used for characterization of compounds. For the (re)synthesis of guanidine-modified monomers and metal complexes nuclear magnetic resonance spectroscopy (NMR), infrared spectroscopy (IR), mass spectrometry (MS), X-Ray diffraction (XRD), and electron paramagnetic resonance spectroscopy (EPR) will be used as analytical methods if applicable. Guanidine-modified microgels and metal-loaded microgels will be analyzed if applicable with NMR, IR, dynamic light scattering (DLS), scanning transmission electron microscopy (STEM), Raman, EPR, and inductively coupled plasma optical emission spectroscopy (ICP-OES). NMR, ICP-OES and gas chromatography (GC) will be used as analytical methods for catalytic reactions.</p>
<p>For all analytical methods the data type, format, and estimated volume of a single data file are summarized in the following table. Data that will be measured by cooperation partners are marked with an asterisk (*). Already existing data of the analytical methods will be reused in the stated formats.</p>
<table style="border-collapse: collapse; width: 100%; height: 371px;" border="1"><colgroup><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"><col style="width: 20%;"></colgroup>
<tbody>
<tr style="height: 39px;">
<td><strong>Analytical method</strong></td>
<td><strong>Data type</strong></td>
<td><strong>Data format</strong></td>
<td><strong>Estimated volume for a single data file</strong></td>
<td><strong>Preferred software for data evaluation</strong></td>
</tr>
<tr>
<td>NMR</td>
<td>Measurement raw data in xy file format</td>
<td>Raw data: .fid<br>Final data: .jcamp</td>
<td>1-30 MB<br>1-5 MB</td>
<td>Chemotion ELN (or Mestre Nova)</td>
</tr>
<tr style="height: 39px;">
<td>IR</td>
<td>Measurement raw data in xy file format</td>
<td>Raw data: .dx<br>Final data: .dx</td>
<td>&lt;50 KB</td>
<td>Chemotion ELN</td>
</tr>
<tr style="height: 39px;">
<td>MS</td>
<td>Measurement raw data in xy file format</td>
<td>Raw data: .xy<br>Final data: .pdf</td>
<td>10 MB<br>&lt;100 KB</td>
<td>---</td>
</tr>
<tr style="height: 21px;">
<td>XRD</td>
<td>final integrated and refined XRD data</td>
<td>.cif<br>.res<br>.docx</td>
<td><br>&lt;50 KB<br>&lt;100 KB</td>
<td>&nbsp;</td>
</tr>
<tr style="height: 39px;">
<td>EPR</td>
<td>Measurement raw data in xy file format</td>
<td>.txt</td>
<td>&lt;100 KB</td>
<td>&nbsp;</td>
</tr>
<tr style="height: 21px;">
<td>DLS *</td>
<td>Data measured by cooperation partners</td>
<td>.asc</td>
<td>&lt;50 KB</td>
<td>---</td>
</tr>
<tr style="height: 21px;">
<td>STEM *</td>
<td>Data measured by cooperation partners</td>
<td>.tif</td>
<td>5 MB</td>
<td>---</td>
</tr>
<tr style="height: 21px;">
<td>Raman *</td>
<td>Data measured by cooperation partners</td>
<td>???</td>
<td>???</td>
<td>---</td>
</tr>
<tr style="height: 21px;">
<td>ICP-OES *</td>
<td>Summarized evaluation of the data measured by cooperation partners</td>
<td>.xlsx</td>
<td>&lt;50 KB</td>
<td>---</td>
</tr>
<tr style="height: 39px;">
<td>GC</td>
<td>Measurement raw data in xy file format</td>
<td>Raw data: .txt<br>Final data: .pdf</td>
<td>&lt;1 MB<br>&lt;100 KB</td>
<td>---</td>
</tr>
</tbody>
</table>
<p>(Raw) data generated within the working group Herres-Pawlis at the Institute of Inorganic Chemistry, RWTH Aachen University will be saved at least in a non-proprietary file format for reuse by scientists within the project, by collaboration partners, and by others after publication of the (raw) data.</p>
<ol>
  <li style="font-weight: bold;"><strong>Information Needed for Future Interpretation:</strong></li>
  </ol>
  <p>The following information will be required in order to guarantee that the data can be read and interpreted in the future:</p>
  <ul>
  <li><em><strong>Data Provenance</strong></em>: Information about who created or contributed to the data, including contact details.</li>
  <li><em><strong>Title and Description</strong></em>: a detailed description of the data, including the research context and objectives.</li>
  <li><strong><em>Creation Date:</em></strong> When the data was collected or created.</li>
  <li><em>Conditions <strong>of Access:</strong></em> Any restrictions on access, including licensing and consent.</li>
  <li><em><strong>Methodology:</strong></em> Detailed information on how the data was collected, processed, and analyzed.</li>
  <li><em><strong>Variable Definitions</strong></em>: Definitions and descriptions of all variables and data fields.</li>
  <li><em><strong>Units of Measurement</strong></em>: Specifications of units for all quantitative data.</li>
  <li><em><strong>Assumptions</strong></em>: Any assumptions made during data collection and processing.<br>Formats and File Types: Details of the file formats and types used.</li>
  <li><em><strong>Metadata Standards</strong></em>: Standards used for metadata to ensure consistency and interoperability.</li>
  </ul>
  <p>2. <strong>Capturing and creating Documentation and Metadata:</strong></p>
  <p><strong>Data Collection Phase:</strong></p>
  <ul>
  <li><em><strong>Documentation Forms</strong></em>: during data collection, metadata can be captured using standardized documentation forms.</li>
  <li><em><strong>Electronic Data Capture Systems:</strong></em> Implement electronic data capture (EDC) systems with built-in metadata fields.</li>
  </ul>
  <p><strong>Post-Collection Phase</strong>:</p>
  <ul>
  <li><em><strong>Metadata Repositories: </strong></em>Store metadata in centralized repository with controlled access.</li>
  <li><em><strong>Version Control Systems:</strong></em> Version control systems can be used to keep track of metadata updates and changes.</li>
  </ul>
  <p><strong>3. Metadata Standards:&nbsp;</strong></p>
  <ul>
  <li>Dublin Core Metadata Element Set (DCMES):</li>
  <li><em><strong>Reason:</strong></em> Widely used and accepted standard for basic metadata, ensuring broad compatibility and interoperability.</li>
  <li><em><strong>Elements: </strong></em>Includes elements like Title, Creator, Subject, Description, Publisher, Contributor, Date, Type, Format, Identifier, Source, Language, Relation, Coverage, and Rights.</li>
  </ul>
  <p><strong>Data Documentation Initiative (DDI):</strong></p>
  <ul>
  <li><em><strong>Reason:</strong></em> Specifically designed for the social, behavioral, economic, and health sciences.</li>
  <li><em><strong>Elements:</strong></em> Provides detailed metadata for surveys, including study-level, file-level, and variable-level metadata.</li>
  </ul>
  <p><strong>4. Types of Documentation Accompanying the Data:</strong></p>
  <p><strong>Basic Details:</strong></p>
  <ul>
  <li><em><strong>Creator/Contributor Information:</strong></em> Names, roles, and contact details of data creators and contributors.</li>
  <li><em><strong>Title:</strong></em> A clear and descriptive title for the dataset.</li>
  <li><em><strong>Date of Creation:</strong></em> The date when the dataset was created.</li>
  <li><em><strong>Access Conditions: </strong></em>Licensing information, consent details, and any access restrictions.</li>
  </ul>
  <p><strong>Methodological Documentation:</strong></p>
  <ul>
  <li><em><strong>Research Methodology: </strong></em>Detailed explanation of the research design, data collection methods, and analytical techniques.</li>
  <li><strong><em>Procedural Information</em>:</strong> Step-by-step procedures followed during data collection and processing.</li>
  <li><em><strong>Analytical Methods:</strong></em> Description of analytical methods and software used.</li>
  </ul>
  <p><strong>Variable Documentation:</strong></p>
  <ul>
  <li><strong>Variable Definitions:</strong> Clear definitions and descriptions of each variable in the dataset.</li>
  <li><strong>Units of Measurement:</strong> Specifications of units for all quantitative data.</li>
  <li><strong>Vocabularies and Ontologies:</strong> Controlled vocabularies and ontologies used for data annotation.</li>
  </ul>
  <p><strong>Data File Information:</strong></p>
  <ul>
  <li><strong>File Formats and Types:</strong> Details of file formats (e.g., CSV, JSON, XML) and their structures.</li>
  <li><strong>Data Structure:</strong> Description of the organization of data within files (e.g., rows, columns, headers).</li>
  </ul>
  <p>5. <strong>Capturing and Recording Information:</strong></p>
  <ul>
  <li><em><strong>Metadata Templates:</strong></em> Use standardized templates to ensure consistent metadata capture.</li>
  <li><em><strong>Electronic Documentation: </strong></em>Store documentation in electronic formats (e.g., PDF, DOCX) alongside data files.</li>
  <li><em><strong>Metadata Fields in Data Files:</strong></em> Include metadata fields directly within data files where appropriate (e.g., CSV headers, JSON metadata sections).</li>
  <li><em><strong>Centralized Repositories:</strong></em> Maintain a centralized metadata repository for easy access and management.</li>
  </ul>
  <p>&nbsp;</p>
  `;

  const [editorContent, setEditorContent] = useState(richtextDefault);

  return (
    <>
      <h1>Living Styleguide</h1>

      <div id="sgLayout">
        <div id="sgNav">
          <a href="#_intro">Introduction</a>
          <a href="#_brand">Branding & Colours</a>
          <a href="#_typography">Typography</a>
          <a href="#_icons">Icons</a>
          <a href="#_layout">Layout</a>
          <a href="#_forms">Forms</a>
          <a href="#_fields">Form Fields</a>
          <a href="#_table">Table</a>
          <a href="#_widgets">Custom Widget</a>
          <a href="#_richtext">RichText Editor</a>
        </div>

        <div id="sgContent">
          <div id="_intro">
            <h2>Introduction</h2>
            <p>TBD... (Why, Living Styleguide?, Updates, How-to-use)</p>
          </div>

          <div id="_brand">
            <h2>Colours</h2>
            <p>Main Brand Colours</p>
            <div className="brand-color-list">
              <BrandColor varname="--brand-primary" />
              <BrandColor varname="--brand-secondary" />
              <BrandColor varname="--brand-tertiary" />
              <BrandColor varname="--brand-error" />
            </div>

            <p>Grayscale pallette</p>
            <div className="layout-horizontal">
              <div className="brand-color-list">
                <BrandColor varname="--gray-50" />
                <BrandColor varname="--gray-100" />
                <BrandColor varname="--gray-200" />
                <BrandColor varname="--gray-300" />
                <BrandColor varname="--gray-400" />
                <BrandColor varname="--gray-500" />
                <BrandColor varname="--gray-600" />
              </div>
            </div>
          </div>

          <div id="_typography">
            <h2>Font</h2>
            <p>
              TBD (Fonts, Weights, Headings, Paragraphs, Links, Lists,
              line-spacing rules etc…)
            </p>

            <h2>Maximum article/paragraph width</h2>
            <p>According to typographic convensions, readers struggle to read
              wide paragraphs. This becomes especially troublesome with verbose
              content and paragraphs with multiple lines.</p>

            <p>For this reason, we recommend any page content that include large
              paragraphs of text, to have a maximum width of <code>35em</code>.
            </p>

            <h2>Emphasis, Bold and Links</h2>
            <p>This is a descriptive paragraph with <em>emphasized text</em>,
              some <strong>bold text</strong>, a <a href="#">anchor</a>,
              and a <Link>Link to somewhere</Link>
            </p>
          </div>

          <div id="_icons">
            <h2>Icons</h2>
            <Example>
              <div className="sg-icons">
                <DmpIcon icon="search" />
                <DmpIcon icon="home" />
                <DmpIcon icon="settings" />
                <DmpIcon icon="favorite" />
              </div>
            </Example>
            <p>
              A list of available icons can be found on the
              &nbsp;<a href="https://fonts.google.com/icons" target="_blank">Google Web Fonts</a> website.
            </p>
            <p>
              The styling of the icons, including the fill line weight can be
              changed as specified
              &nbsp;<a href="https://developers.google.com/fonts/docs/material_symbols" target="_blank">
                Material Symbols Guide
              </a>.
            </p>
            <p>
              You can find the icon setings in <code>styles/_icons.scss</code>.
            </p>
          </div>

          <div id="_layout">
            <h2>Component Spacing</h2>
            <p>
              We use three different spacings for various components. When
              developing components, or working without layout, make sure to use
              these variables so that spacing is consistent throughout the
              application.
            </p>

            <dl>
              <dt><code>--brand-space1</code></dt>
              <dd>
                Used primarily for padding inside buttons and other input
                fields.
              </dd>

              <dt><code>--brand-space2</code></dt>
              <dd>
                This is the main spacing used between different components on
                the page.
              </dd>

              <dt><code>--brand-space3</code></dt>
              <dd>Description and Use Case TBD...</dd>
            </dl>

            <h2>Typographic Spacing</h2>
            <p>Different variables for enforcing consistent line heights and
              legible typography.</p>

            <dl>
              <dt><code>--brand-line-height0</code></dt>
              <dd>
                This is the standard line hight to use for general text and
                input fields.
              </dd>

              <dt><code>--brand-line-height1</code></dt>
              <dd>
                For longer form guidance text where some individuals may
                struggle with larger paragraphs of text, we use a slightly
                higher line height.

                Also useful for some headings, where we want some extra space
                between the heading and content following it.
              </dd>

              <dt><code>--brand-line-height2</code></dt>
              <dd>
                Mostly used for headings where we want clear separation between
                the heading and content following it.
              </dd>
            </dl>

            <h2>Naming Conventions</h2>
            <ul className="sg-spaced">
              <li>
                Use <code>TitleCase</code> for componen tags, ie.<br />
                <code>{"<SomeElement />"}</code>
              </li>
              <li>
                Use <code>camelCase</code> for element ID&lsquo;s, ie.<br />
                <code>{'<SomeElement id="myElement"/>'}</code>
              </li>
              <li>
                Use <code>kebab-case</code> for css classnames (Using titlecase
                for every word beween hiphens is okay), ie.<br />
                <code>{'<SomeElement className="some-class-Name"/>'}</code>
              </li>
              <li>
                Use <code>snake_case</code> for field names, ie.<br />
                <code>{'<SomeElement name="field_name" />'}</code>
              </li>
              <li>
                When elements have multiple properties, prefer to have each
                property on it&lsquo;s own line, so that it&lsquo;s faster to find specific
                properties, and easier to add &amp; remove. Eg.

                <div><pre><code>
                  {`<SomeElement
  prop1="A"
  prop2="B"
  prop3="C"
  prop4="D"
\\>`}
                </code></pre></div>
              </li>

              <li>
                The same applies to import statements. Though more verbose, allows
                for better legibility and faster changes.

                <div><pre><code>
                  {`import {
  Button,
  Label,
  TextField,
  Input,
  FieldError,
  Form,
} from "react-area-components";
`}
                </code></pre></div>
              </li>

              <li>
                Use a <em>leading underscore</em> for &ldquo;private&ldquo; css variables.
                This is handy when working on larger components that use
                duplicate styles throughout.  We create a private variable to
                reduce duplication and potential typos, especially when working
                with larger components.

                <div><pre><code>
                  {`.grid-view {
  --_gap: var(--grid-list-grid-gap, 1rem);

  display: grid;

  padding: var(--_gap);
  grid-gap: var(--_gap);
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
}
`}
                </code></pre></div>
              </li>
            </ul>

            <h2>Layout</h2>
            <p>TBD ...</p>

          </div>

          <div id="_theme">
            <h2>App Theming</h2>
            <p>The following CSS variables are the primary hooks that set the
              overall theme for the App.</p>
            <p>Any custom components should attempt to use these first, and
              developers should only need to add new theme hooks for specialized
              components that cannot make use of one of these</p>

            <dl>
              <dt><code>--focus-ring-color</code></dt>
              <dd>
                This is the highlight around input fields and other &ldquo;selectable&ldquo;
                elements. It&lsquo;s a visual indicator of where the current focus is.
              </dd>

              <dt><code>--text-color</code></dt>
              <dd>
                This sets the main text color for the element.<br />
                Related hooks include:
                <ul>
                  <li><code>--text-color-hover</code></li>
                  <li><code>--text-color-disabled</code></li>
                  <li><code>--text-color-placeholder</code></li>
                </ul>
              </dd>

              <dt><code>--link-color</code></dt>
              <dd>
                This is the main color for links and anchors.<br />
                Related hooks include:
                <ul>
                  <li><code>--link-color-secondary</code></li>
                  <li><code>--text-color-pressed</code></li>
                </ul>
              </dd>

              <dt><code>--border-color</code></dt>
              <dd>
                The border colour to use for the component. <br />
                Related hooks include:
                <ul>
                  <li><code>--border-color-hover</code></li>
                  <li><code>--border-color-pressed</code></li>
                  <li><code>--border-color-disabled</code></li>
                </ul>
              </dd>

              <dt><code>--field-background</code></dt>
              <dd>
                The background colour for input fields.
              </dd>

              <dt><code>--field-text-color</code></dt>
              <dd>
                The background colour for input fields.
              </dd>

              <dt><code>--overlay-background</code></dt>
              <dd>
                The background colour for any overlays like modals.
              </dd>

            </dl>
          </div>

          <div id="_forms">
            <h2>Buttons</h2>
            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/Button.html">component docs here.</a>
            </p>

            <Example>
              <div className="sg-button-list">
                <Button>Standard</Button>
                <Button data-primary>Primary</Button>
                <Button isDisabled>Disabled</Button>
              </div>
            </Example>

            <h2>Forms</h2>
            <p>
              A form is a group of inputs that allows users to submit data
              to a server, with support for providing field validation
              errors.
            </p>

            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/Form.html">component docs here.</a>
            </p>

            <Example>
              <Form>
                <TextField
                  name="email"
                  type="email"
                  aria-label="Email"
                  isRequired
                />
                <TextField
                  name="example_email"
                  type="email"
                  isRequired
                >
                  <Label>Email</Label>
                  <Input />
                  <p className="help">Descriptive text related to the field</p>
                  <FieldError />
                </TextField>

                <div className="form-actions">
                  <Button type="submit">Submit</Button>
                </div>
              </Form>
            </Example>

          </div>

          <div id="_fields">
            <h2>TextField</h2>
            <p>
              A text field allows a user to enter a plain text value with a
              keyboard.
            </p>

            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/TextField.html">component docs here.</a>
            </p>

            <Example>
              <TextField name="example_text" isRequired>
                <Label>Example Text Field</Label>
                <Input />
                <p className="help">Descriptive text related to the field</p>
              </TextField>
            </Example>

            <h2>Typeahead</h2>
            <p>
              Typeahead, also known as an autosuggest, shows matches to a user query as the user types.
            </p>

            <Example>
              <TypeAheadInput
                label="Example input"
                graphqlQuery={AffiliationsDocument}
                helpText="Help text describing what types of data the user can search for"
              />
            </Example>

            <h2>Typeahead with Other option</h2>
            <p>
              Typeahead with the inclusion of the &ldquo;Other&rdquo; option. You can pass a setOtherField() method to set it to true when the user selects &ldquo;Other&rdquo; option.
            </p>

            <Example>
              <TypeAheadWithOther
                label="Example input"
                graphqlQuery={AffiliationsDocument}
                helpText="Help text describing what types of data the user can search for"
                setOtherField={setOtherField}
              />
              {otherField && (
                <TextField>
                  <Label>Other</Label>
                  <Input
                    placeholder="other"
                  />
                </TextField>
              )}
            </Example>
          </div>

          <div id="_table">
            <h2>Table</h2>
            <p>
              A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys, and optionally supports row selection and sorting.
            </p>

            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/Table.html">component docs here.</a>
            </p>

            <Example>
              <Table>
                <TableHeader>
                  <Column isRowHeader={true}>One</Column>
                  <Column isRowHeader={true}>Two</Column>
                  <Column isRowHeader={true}>Three</Column>
                </TableHeader>
                <TableBody>
                  <Row>
                    <Cell>Item One</Cell>
                    <Cell>Item Two</Cell>
                    <Cell>Item Three</Cell>
                  </Row>
                </TableBody>
              </Table>
            </Example>
          </div>


          <div id="_widgets">
            <h2>Widgets</h2>
            <p>TBD (Custom Components, etc…)</p>

            <h2>Toggle Switch</h2>
            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/Switch.html">component docs here.</a>
            </p>
            <Example>
              <Switch defaultSelected>
                <div className="indicator" /> Toggle
              </Switch>
            </Example>

            <h2>Popover</h2>
            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/Popover.html">component docs here.</a>
            </p>
            <Example>
              <DialogTrigger>
                <Button>Settings</Button>
                <Popover>
                  <OverlayArrow>
                    <svg width={12} height={12} viewBox="0 0 12 12">
                      <path d="M0 0 L6 6 L12 0" />
                    </svg>
                  </OverlayArrow>
                  <Dialog>
                    <div className="flex-col">
                      <Switch defaultSelected>
                        <div className="indicator" /> Wi-Fi
                      </Switch>
                      <Switch defaultSelected>
                        <div className="indicator" /> Bluetooth
                      </Switch>
                      <Switch>
                        <div className="indicator" /> Mute
                      </Switch>
                    </div>
                  </Dialog>
                </Popover>
              </DialogTrigger>
            </Example>

            <h2>Menu</h2>
            <p>
              This is a <em>core component</em>, see
              the <a href="https://react-spectrum.adobe.com/react-aria/Menu.html">component docs here.</a>
            </p>
            <Example>
              <MenuTrigger>
                <Button aria-label="Menu">☰ Menu</Button>
                <Popover>
                  <Menu>
                    <MenuItem onAction={() => alert('open')}>Open</MenuItem>
                    <MenuItem onAction={() => alert('rename')}>Rename…</MenuItem>
                    <MenuItem onAction={() => alert('duplicate')}>Duplicate</MenuItem>
                    <MenuItem onAction={() => alert('share')}>Share…</MenuItem>
                    <MenuItem onAction={() => alert('delete')}>Delete…</MenuItem>
                  </Menu>
                </Popover>
              </MenuTrigger>
            </Example>
          </div>

          <div id="_richtext">
            <h2>ReMirror Editor (Custom)</h2>
            <p>Required properties:</p>
            <dl>
              <dt><code>content</code></dt>
              <dd>The variable that hold the html content for the editor.</dd>

              <dt><code>setContent</code></dt>
              <dd>The effect function that will update the content variable</dd>
            </dl>
            <p>Example Usage:</p>
            <div><pre><code>
              {`<DmpEditor content={editorContent} setContent={setEditorContent} \\>`}
            </code></pre></div>
            <hr />
            <DmpEditor content={editorContent} setContent={setEditorContent} />
          </div>
        </div>
      </div >

    </>
  )
}

export default Page;
