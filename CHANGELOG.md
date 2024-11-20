### Added
- Added ability to add 'Other' affiliation in the User Profile page [#170]
- Added new components [#111]
  - Clickable interface for Template List
  - Clickable interface for Template Edit
  - Clickable interface for Template Section Edit/New
  - Clickable interface for Template Question Edit/New
  - Clickable interface that starts "Publish Template" flow
  - Added component for TemplateListItem
  - Added component for Section Header Edit
  - Added component for Question Card Edit
  - Added component for "Add question" button
  - Added component for "Add section" button
- Added new User Profile page [#124]
  - Created a separate UpdateEmailAddress component
  - Created EmailAddressRow component
  - Created shared Form components, FormInput and FormSelect
  - Created temporary RightSidebar component
  - Updated TypeAheadWithOther component to work with parent components
  - Added some shared css for shared form components in a new style file called _form.scss
  - Added corresponding unit tests
- Added spacing guidelines to the styleguide
- Cleaned up the styleguide and added additional text to explain the spacing guidelines
- Created SCSS helpers/mixins to generate alot of our font sizes,colours and spacing

### Added
=======
- Made some updates related to authentication [#142]
- Updated middleware to redirect to /login if both access token and refresh token is missing
- Updated refreshAuthTokens method to throw errors that will be caught gqlErrorHandler
- Updated gqlErrorHandler to redirect to /login when refreshAuthTokens returns an error
- Updated template history page to use handleApolloErrors, and updated handleApolloErrors to have a router param
- Updated client-graphql-test page to pass router to handleApolloErrors
- Added confirm-email server-side component, and email-confirmed and verification-failed client components for email alias verification [#125]
- Checkbox & Checkbox group component [#75]
- Radio component [#75]
- Select component [#75]
- Basic Cards [#75]
- Section header component [#75]
- Question card component [#75]
- Tabs component [#75]
- Template Overview - blocked out page for component builder assistance [#75]
- Template Edit Section  - blocked out page for component builder assistance [#75]
- Template Edit Question - blocked out page for component builder assistance [#75]
- Set up a directory for the account pages, and added the Connections page [#128]
- Added new shared LeftSidebar, TooltipWithDialog, and ButtonWithImage components. Updated styleguide with the new TooltipWithDialog and ButtonWithImage components. [#128]
- Fixed type bugs in the template history page which was breaking the build.
- Added csrf token to header for /login and /signup page and error handling to refresh csrf and auth tokens [#116]
- Added cypress for functional tests. Added a functional test to check for HTTP-only auth cookies [#116]
- Added the Template History page [#86]
- Added more documentation to README.md [#91]
- Added existing header and footer from production to app [#89]
- Added two new TypeAhead/Autosuggest components, one with and one without the "Other" option [#10]
- Added the use of graphql-codegen to generate types for graphql requests [#10]
- Added Material Symbols and a custom `DmpIcon` component that will render a specific icon using it's short-code. [#80]
- Added custom SVG icon set to be used by `DmpIcon` [#80]
- Added the initial version of our custom ReMirror text editor [#74].

### Updates
- Button styles [#75]
- Text input styles [#75]
- Made updates to change 'name' to 'displayName' for affiliations, in response to backend changes [#137]
- Updated endpoints for 'signin' and 'signup' to be 'apollo-signin' and 'apollo-signup' [#99]

### Fixed
- Fixed Logout button/link not working in header [#103]
- Fixed an issue with docker-compose not starting the app [#93]

## v0.0.1

### Added
- Added logout api and link [#65]
- Added loading state and velocity controls to the login and signup forms [#66]
- Added placeholders for /signup and /login pages and added a new api endpoint for setting the access token in a cookie [#19]
- Added .editorconfig file to help maintain consistent coding styles [#37]
- Added Styleguide Page, as well as custom components and css that are only to
  be used on the Styleguide. [#51]
- Added some default CSS variables that we can hook into when we start doing the
  theming, many of these variables are also used by the newly added `react-aria`
  components. [#51]

### Updates
- Updated endpoints for 'signin' and 'signup' to be 'apollo-signin' and 'apollo-signup' [#99]
- Updates for auth pages to accomodate backend changes [#63]
- Updated lib/graphql/client.ts with adding an errorLink to the client instance, and intercepting specific error types or codes to handle them differently if we want.[#29]
- Updated lib/graphql/server/queries/dmpDataQueries.ts to 1) Map the error code to a user friendly message using a hash like utils/userFriendlyErrorMessage, log the error to the new utils/logger.ts, and throw an error that will be caught by the "try-catch" in the client- or server-side component. logger.ts can be used directly in client- and server-components as well.[#29]
- Updated dmps/[...slug]/page.tsx to throw the returned error in the 'try-catch'[#29]
- Installed pino and @elastic/ecs-pino-format to output formatted logs[#29]
- Added app/not-found.tsx to handle 404 errors[#29]
- Added app/error.tsx to handle server-side errors. Client components will most likely display returned errors in the page using useState().[#29]
- Moved `globals.scss` to the `styles` directory. The goal here is to have
  global style in their own directory. [#51]
- Extracted some common styles for Typography, Elements, and Page into their own
  css modules, which we import in globals. [#51]
- Updated `layout.tsx` to use the code formatting for classes and id's as
  outline in the styleguide. [#51]
- Updated some CSS classes to remove verbose naming. [#51]

### Fixed
- Fixed an issue with docker-compose not starting the app [#93]
