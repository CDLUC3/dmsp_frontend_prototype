'use client';

import "./styleguide.scss";

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
} from "react-aria-components";
import {
  Example,
  BrandColor,
} from "./sg-components.tsx";


function Page() {
  return (
    <>
      <h1>Living Styleguide</h1>

      <div id="sgLayout">
        <div id="sgNav">
          <a href="#_intro">Introduction</a>
          <a href="#_brand">Branding & Colours</a>
          <a href="#_typography">Typography</a>
          <a href="#_layout">Layout</a>
          <a href="#_forms">Forms</a>
          <a href="#_fields">Form Fields</a>
          <a href="#_widgets">Custom Widget</a>
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
                Use <code>TitleCase</code> for componen tags, ie.<br/>
                <code>{"<SomeElement />"}</code>
              </li>
              <li>
                Use <code>camelCase</code> for element ID's, ie.<br/>
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
                property on it's own line, so that it's faster to find specific
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
                This is the highlight around input fields and other “selectable”
                elements. It's a visual indicator of where the current focus is.
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
        </div>
      </div>

    </>
  )
}

export default Page;
