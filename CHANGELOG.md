### Added
- Added three more `icons` for solid down, left and right arrows for the Date Picker [#597]
- Added a new `ExpandableContentSection` component that allows use to `expand` and `collapse` content, especially for the `Best Practices` right sidebar, but can be used for any content [#578]
- Added the `Question details` page that allows users to answer a question [#320]
- Added, or moved, the `question details` page from `projects/[projectId]/dmp/[dmpid]/q/[qid]` to `projects/[projectId]/dmp/[dmpid]/s/[sid]/q/[qid]` [#320]
- Added a new `useRenderQuestionField` hook to render different questions on the `Question details` page [#320]
- Added a test in `jest.setup.ts` to catch extraneous errors that are not tested or in a unit test.
- Added delete section functionality to template builder with confirmation modal, including translations, and tests
- Implemented a "Delete Question" feature on the question editing page with extra dialog and with tests
- Hook up the Plan Funder page with actual data so that the user can manage funders on their plan. [#363]

### Updated
- Updated `routePath` with route `projects.share.index` and updated unit test for `ProjectsProjectMembers` [#589]
- Updated `QuestionView` to use the new `ExpandableContentSection` for the `Best Practices` right sidebar [#578]
- Updated `graphqlHelper.ts` file to be more robust and correctly refresh tokens and refresh content when there is an `UNAUTHENTICATED` error [#320]
- Clean up connections page and buttons [#516]
- Added spacing on the `Account Profile` for the demo [#509]
- Updated `Account Profile` to use routePath() instead of hardcoded paths
- fix translation string to use the correct tags for the `Account Profile` [#515]

### Fixed
- Improved color contrast on date picker [#597]
- Updated `projects/[projectId]/members` page to have consistent breadcrumbs as the `Project overview` page [#589]
- Prevent the project date from displaying if either `startDate` or `endDate` are not available [#588]
- Fixed broken links on the `Project overview` page that go to the individual plans [#575]
- Removed the `Sample text` field from the Question Add/Edit forms for all question types except for `textArea` [#564]


## v0.0.1
- Plan Manage Access [#299]
- Plan Publish [#299]
- Plan Downloads [#299]
-
### Added
- Added new `SectionEditContainer` component, for use in `QuestionEditCard`, to make reordering of questions more smooth [#207]
- Added new `updateQuestionDisplayorder` and `updateSectionDisplayOrder` server actions to update question and section order when users click the `onMoveUp` and `onMoveDown` arrows [#207]
- Added question type components to the components/Form/QuestionComponents directory [#157]
  - Updated the `QuestionAdd` and `QuestionEdit` components to allow for the adding and editing of the new question types [#157]
  - Updated `QuestionView` component, which is used to show a Preview of the Question that is being added or edited. Added handlers to allows users to interact with the questions in the Preview mode.
  - Built a `MultiSelect` component using an accessible approach [#157]
  - Created the `Number` and `Currency` components using React Aria Component's `NumberField`. This allows users to increment and decrement the field using buttons.[#157]
- Added support for question type JSON objects [#535]
- Added TinyMCE Editor component and added it to the styleguide [#462]
- Added a Load more button to the Add new section page [#450]
- PublishedSections graphQL query [#448]
- Added new Server Actions `addCollaboratorAction` [#381]
- Added `addProjectCollaborator` mutations [#381]
- Added help text to Section fields from the wireframe [#281]
- Added new serverAuthHelper.ts to work with Server Actions [#364]
- Added type check to pre-commit hook and fixed some issues in the app [#391]
- Add central "named routes" and helper function
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
- QuestionPreview component [#224]

### Updated
- Updated the template cards in `TemplateListPage` and `PlanCreate` components to use the `TemplateSelectListItem` component, which was updated to correctly display `ownerDisplayName`, `publish status` and `visibility` [#470]
- Updated the templates cards on `/template` page to match the look of the cards on the `/template/create` page [#470]
- Switched out all occurrences of Remirror/DMPEditor rich text editor with TinyMCE [#496]
- Convert all references to the old `Contributor` to `Member` and `Project/PlanFunder` to `Project/PlanFunding` to mimic language used in UI
- Added the `Account Profile` link on the home page for the demo and fixed the success message when updating profile [#508] [#512]
- Updated the "add new section" page to properly split our the affiliation's sections from best practice sections [#451]
- Changed all instances of TemplateVisibility.PRIVATE to TemplateVisibility.ORGANIZATION to accomodate backend changes and also made update to `template/[templateId]` so that the `Version` and `Last updated` titles don't show in `description` when values are undefined [#466]
- Updated `affiliations`, `myTemplates`, `publishedTemplates`, `myProjects` queries to handle the new pagination format. Updated the corresponding pages and components only enough to keep them working as-is [#180](https://github.com/CDLUC3/dmsp_backend_prototype/issues/180)
- Updated `templates/[templateId]/sections/new` to use the new PublishedSections query and to use the addSection mutation when the user selects a section to copy
- Hooked up `projects/[projectId]/dmp/[dmpId]/feedback/invite` page to backend data [#381]
- Removed from from the modal on `projects/[projectId]/dmp/[dmpId]/feedback/invite` to add a project member, since we don't have user data at that point [#381]
- Updated `Template` and `Projects` pages to work with the new pared down search result responses from GraphQL [#223] and [#218](https://github.com/CDLUC3/dmsp_backend_prototype/issues/218)
- Updated `Plan Members` page. Added mutation and queries, and a server action for handling addPlanContributors mutation [#364]
- Explicitly updated nextJS version to 14.2.25 due to an Authorization Bypass vulnerability in middleware (CVE-2025-29927) [#388]
- Added `white-space: pre-wrap` for Prosemirror due to warnings [#388]
- Update `Edit Member Details` page. Added mutation and queries, translations, and unit test [#367]
- Updated `PlanCreate` component so that it hooks up to real data. The functionality of the page is a little complicated, so I added a `CreatePlan.md` file to summarize what functionality is expected in the page. [#361]
- Updated the `Project Members` page with real data [#360]
- Updated `ProjectsProjectFundingEdit` component and moved the page under a new `[projectFunderId]` directory at `/projects/[projectId]/funder/[projectFunderId]/edit` [#357]
- Updated the `Project Overview` page [#339]
- Updated `/projects/[projectId]/project` page to hook it up to data [#351]
- Moved some shared test utils to jest.setup.ts or `__mocks__/common.ts` [#351]
- Updated translation content to use sentence-case rather than title case [#351]
- Made updates throughout the Template Builder flow to make the experience more consistent across pages, and fixed some bugs [#347]
- Updated `/projects/create-project` and added new shared RadioGroup and CheckboxGroup components [#332]
- Made updates to get Dockerfile.prod to work.
  - Updated Dockerfile.prod
  - Updated next.config.mjs to include output `standalone`
  - Updated `docker-compose.yml`
  - Fixed lint issues introduced with changes to field-level errors
- Updated `buildspec` to use the `Docker.prod` file
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
- Added the `QuestionView` component which will render the question fields based on the question type. [#379]
- Integrated the `QuestionPreview` and `QuestionView` components on the add and edit question pages. [#379]
- Removed unused component `EditQuestionPage` to avoid confusion with other components. This is a legacy component. [#379]
- Added a FunderSearch component that performs a funder search, and returns the
  results. [#335]
- Added a the `LoggedError` custom error type to simplify logging of errors by. [#335]
- Updated the funding-search page under create project to use the new funder
  search component. Also hooked up the capability to select a funder and
  associate it with the project. [#335]
- Updated some of the other Funder pages under create project so that they link
  and redirect to the correct named urls for the funder search page. [#335]

### Fixed
- Fixed type error related to `confirm-email` page that was breaking build
- Fixed issue with search fields not looking good on smaller devices. Made updates to get the `Search` button to wrap for mobile [#488]
- Fixed breaking build by addressing a type error
- Fixed missing translations on User Profile page [#488]
- Fixed issue with TypeAheadWithOther dropdown menu displaying when user clicks the `Edit` button on `User profile` page [#511]
- Fixed issue with Template not refreshing after published [#455]
  - Added a server endpoint env variable for graphqlServerActionHandler.ts since env variables prefixed with NEXT_PUBLIC do not work on the server side [#455]
- Added Rich Text Editor for Sample Text in the Question forms [#456]
  - Adjusted widths of Edit template title to accomodate for very long titles [#456]
- Fixed bugs related to the template builder flow
  - Fixed Preview page to not display HTML at top for Requirements [#449]
  - Added redirect back to Edit Template page when user creates a new Section [#452]
  - On `/template` page, fixed the `published` and `unpublished` labels on the list items because they were reversed [#453]
  - Replaced hard-coded org names with the actual org names in text on `Manage access` page, and fixed archive modal title to `Confirm removal` [#454]
  - Changed `Published` to `Last updated` on `/template/[templateId]` page and fixed missing translation for `Load 3 more`. Also when adding a new `Question`, the button should say `Save and add` and when editing an existing question, the form button should say `Save and update`. [#455]
  - Added missing space after `Guidance by` and `These are requirements by` in the Preview page [#455]
- Fix logger path issue in auth.ts [#441]
- Added handling of scenario where no jwt payload is returned when getting languageId in middleware [#441]
- Fixed ordering issue for Sections on the Edit Templates page [#436]
- Fixed missing `as deps` in `Dockerfile.prod`.
- Fixed wrong node image in `Dockerfile.prd`. Also fixed a number of linting issues.
- Fixed bug in `/projects/[projectId]/dmp/[dmpId]/download` because of unused `FileIcon` [#376]
- Fixed bug where `/template` page was continuosly refreshed when no data was returned [#351]
- Fixed that didn't show the current title when editing a template name [#475]
- Added the missing button to create a new template from scratch [#474]
- Fixed typo and ensure that correct visibility text displays when changing the
  Private/Public status in the Template Publish Modal [#483]

### Chore
- Updated a number of packages, such as next, react-aria-components, eslint, next-intl, etc [#529]
- Updated a number of unit tests to address the reduced coverage of branch tests [#529]
- Fixed sass warnings and errors introduced with latest updates to packages [#529]
- Updated and added unit tests to increase coverage in the app [#490]
- Updated and improved the cypress functional tests to fix them and updated some cypress documentation in the README.md file [#490]
- Updated NodeJS version to v22 [#144]
====================================================================================================

### Added
- Added real data and functionality to the PlanOverviewPage, `/projects/[projectId]/dmp/[dmpId]` [#362]
- Added new right sidebar with new multi-page Publish modal with checklist data, and `status` select [#362]
- Added `/projects/[projectId]/project-funding`, copying over the static code from `/projects/[projectId]/create-project/funding`. Updated
  page to use shared RadioGroupComponent, and updated RadioGroupComponent to use description [#336]
- Added new `QuestionEdit` and `QuestionTypeCard` components [#220]
- Added new Question and QuestionOption types [#188]
- Added a new FormTextArea component [#188]
- Added new QuestionOptionsComponent for handling the `options` question types in the form [#188]
- Added new QuestionAdd component for adding a new question [#188]
- Added new `QuestionsDisplayOrder` and `Question` queries and `AddQuestion` and `UpdateQuestion` mutations [#188]
- Added useSampleTextAsDefault checkbox for text field question types [#188]

### Fixed
- Fixed `EvalError: Code generation from strings ` bug that was occurring because I set the environment in docker-compose.yml to production

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
- Remove duplicate graphqlServerActionHandler.ts and serverAuthHelper.ts
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
