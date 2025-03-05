# Summary of page functionality

The functionality on this page is a bit confusing, so it's been summarized here.

## Initital page load
When the page first loads, we automatically check all the `Filter` checkboxes to show only the templates that belong to the project's funders.

When these filters are unchecked, then all the public, versioned templates are displayed with the `Load more` buttons. The `increments` for display are set in the `INCREMENT` constant in the component.

## If there are no project funders
If there are no project funders, we will have a filter to display the DMP Best Practice templates. This filter will automatically be checked on initial page load.

When the filter is unchecked, then all the public templates will be displayed with the `Load more` buttons.

## Searching
When a user enters a search term, all the public templates will be searched. The filters will automatically be unchecked so that all the templates can be searched.

## Load more
`Load more` functionality is not available for the filtered project funder templates or best practice templates