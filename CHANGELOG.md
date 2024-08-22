## [1.0.0]

### Added
- Added more documentation to README.md [#91]
- Added existing header and footer from production to app [#89]
- Added two new TypeAhead/Autosuggest components, one with and one without the "Other" option [#10]
- Added the use of graphql-codegen to generate types for graphql requests [#10]
- Added logout api and link [#65]
- Added loading state and velocity controls to the login and signup forms [#66]
- Added placeholders for /signup and /login pages and added a new api endpoint for setting the access token in a cookie [#19]
- Added .editorconfig file to help maintain consistent coding styles [#37]
- Added buildspec.yaml file for CI/CD pipeline [#81]
- Added graphql file structure and client creation. [#36]
- Added Styleguide Page, as well as custom components and css that are only to
  be used on the Styleguide. [#51]
- Added some default CSS variables that we can hook into when we start doing the
  theming, many of these variables are also used by the newly added `react-aria`
  components. [#51]

### Updates
- Updated lib/graphql/client/apollo-client to include 'retry' and to log graphql errors [#92]
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