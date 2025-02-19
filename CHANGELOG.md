## v0.0.1

### Added
- Project Create Flow [#299]
- Project Upload [#299]
- Project Funder [#299]
- Project Details [#299]
- Project Funders [#299]
- Project Members [#299]
- Project Research outputs [#299]
- Plan Adjust Funders [#299]
- PLan Adjust Members [#299]
- Plan Adjust Research outputs [#299]
- Projects dashboard [#175]
- Project Overview [#175]
- Plan Overview [#178]
- Plan Section and boilerplate tests [#178]
- Plan Question and boilerplate tests [#178]

### Updated
- Updated `/projects/create-project` and added new shared RadioGroup and CheckboxGroup components [#332]
- Updated `/projects/page.tsx` to use real data and have search capabilities [#4]
- Updated `/template/[templateId]/access` page to hook it up to real data [#223]
- Updated the Edit Question `template/[templateId]/q/[q_slug]/page.tsx` with actual data from backend and added functionality for `options` question types [#188]
- Updated the Add Question`template/[templateId]/q/new/page.tsx` page with actual data from backend and added functionality to accomodate `option` question types. [#188]
- Updated shared FormInput component [#188]
- Updated `/template/create/page.tsx`[#186]
- Removed select-template page, since we are using `SelectExistingTemplate` in place of it [#186]
- Updated existing Templates graphql query with more fields [#186]
- Updated shared `FormInput` component to pass ‘ariaDescribedBy’ [#186]
- Updated `TemplateSelectListItem` [#186]
- Updated `/graphql/apollo-wrapper.tsx` since `@apollo/experimental-nextjs-app-support/ssr` was deprecated [#186]
- Updated `/graphql/graphqlHelper.ts` with a call to `client.resetStore’` This should refetch user’s data when refreshAuthTokens() is called [#186]
- Updated `refreshAuthTokens` function with ability to pass in cookies [#186]
- Updated `middleware` to call refreshAuthTokens when there is no auth token cookie [#186]
- Updated `QuestionTypeSelectPage`- hooked up to real data and updated code [#220]
- Renamed previous `QuestionEdit` component to `QuestionEditCard` for more specificity [#220]

### Added
- Added new `QuestionEdit` and `QuestionTypeCard` components [#220]
- Added new Question and QuestionOption types [#188]
- Added a new FormTextArea component [#188]
- Added new QuestionOptionsComponent for handling the `options` question types in the form [#188]
- Added new QuestionAdd component for adding a new question [#188]
- Added new `QuestionsDisplayOrder` and `Question` queries and `AddQuestion` and `UpdateQuestion` mutations [#188]
- Added useSampleTextAsDefault checkbox for text field question types [#188]

### Fixed


====================================================================================================

### Updated
=======
- Updated `/graphql` files to include new backend error objects [#308]
- Updated `/account/profile/page.tsx` to display the new backend field level errors [#308]
- Updated `/template/[templateid]/page.tsx` to display the new backend field level errors [#308]
- Updated `/template/[templateid]/section/page.tsx` to display the new backend field level errors [#308]
- Updated `/template/[templateid]/section/create/page.tsx` to display the new backend field level errors [#308]
- Updated `/template/[templateid]/section/[section_slug]/page.tsx` to display the new backend field level errors [#308]
- Updated `/template/create/page.tsx`[#186]
- Removed select-template page, since we are using `SelectExistingTemplate` in place of it [#186]
- Updated existing Templates graphql query with more fields [#186]
- Updated shared `FormInput` component to pass ‘ariaDescribedBy’ [#186]
- Updated `TemplateSelectListItem` [#186]
- Updated `/graphql/apollo-wrapper.tsx` since `@apollo/experimental-nextjs-app-support/ssr` was deprecated [#186]
- Updated `/graphql/graphqlHelper.ts` with a call to `client.resetStore’` This should refetch user’s data when refreshAuthTokens() is called [#186]
- Updated `refreshAuthTokens` function with ability to pass in cookies [#186]
- Updated `middleware` to call refreshAuthTokens when there is no auth token cookie [#186]
- Updated some pages with toast messages, and updated toast files [#231]
- Added Portuguese translations for newly added translation keys [#231]
- Updated version of `next` to `14.2.22` [#231]
- Updated app/template/[templateId]/section/[section_slug] to hook it into backend data [#217]
- Updated app/template/[templateId]/section/create page to use Remirror text editors, and checkboxes with info popovers [#187]
- Updated DMPEditor to use a skeleton while the text editors are loading, since it can be slow [#187]
- Updated app/template/[templateId]/section/new page to hook it up to backend data, handle errors, and add translations [#189]
- Updated app/template/[templateId] page to hook it up to the backend and handle errors and translations[#206]
- Updated app/[locale]/template page to hook it up to backend and handle errors and translations[#82]
- Updated account/profile, email/email-confirmed, email/verification-failed, and account/connections to use new, shared layout containers [#185]
- Refactored font family usage for consistency.
- Updated the Login and Signup pages to function as the wireframes. [#117]
- Updated TypeAheadWithOther component to be a bit more generic [#117]
- Cleaned up some of the error handling code so that it's easier to debug and
  trace issues. [#117]

### Added
- Added `MyVersionedTemplates` and `PublishedTemplates` graphql queries and `addTemplateMutation` graphql mutation [#186]
- Created the `SelectExistingTemplate` component which displays the publishedTemplates and allows user to filter view [#186]
- Created `TemplateList` component used by `SelectExistingTemplate`[#186]
- Added Toast Message capabilities using **React Aria Component's use Toast**. [#211]
- Project overview page [#175]
  - Moved pages under [locale] folder
  - dummy portuguese brazilian translation
- New translation updates [#160]
  - Installed next-intl, and created a /messages directory for content, and /i18n directory for next-intl request and routing
  - Moved pages under dynamic folder [locale]
  - Updated middleware to add correct locale based on path, token, browser preference, or default to english
  - Added provider NextIntlClientProvider to layout.tsx
  - Added a test page, locale-test, where you can see demos of translations
  - Added NextIntlClientProvider to the @/utils/test-utils
  - Updated next.config.mjs to use next-intl plugin
- Template Builder: Access Page [#166]
- Created css for sectionContainer, sectionHeader, sectionContent for generic sections
- Updated mobile breadcrumbs css
- Added ability to add 'Other' affiliation in the User Profile page [#170]
- Created create/select-template page and test [#167]
  - Created new components for this page
  - Created Template Select List Item
- Template Builder: Access Page [#166]
- Created css for sectionContainer, sectionHeader, sectionContent for generic sections
- Updated mobile breadcrumbs css
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
- Added `LayoutContainer`, `ContentContainer` and their related styles. [#154]
- Added a responsive size hook for react that will return the window size on
  resize. [#154, #110]
- Added a `LayoutWithSidebar` container, along with a related
  `SidebarContainer`, and documented their use on the styleguide. [#154, #110]


### Fixed
- Fixed `login` 404 error issue and looping issue in middleware [#194]
- Removed old `app/layout.tsx` page. It was causing errors, since we have one located at `app/[locale]/layout.tsx` now.
- Fixed a failing unit test and build for `confirm-email` component when backend server was not running [#180]
- Removed use of NEXT_PUBLIC_GRAPHQL_ENDPOINT env variable, since it was a duplicate of NEXT_PUBLIC_SERVER_ENDPOINT [#171]

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
