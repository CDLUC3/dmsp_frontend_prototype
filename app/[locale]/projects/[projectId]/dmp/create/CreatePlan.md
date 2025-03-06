# Summary of page functionality

The functionality on this page is a bit confusing, so it's been summarized here.

## Initital page load
When the page first loads, we automatically check all the `Filter` checkboxes. So if there are project funders, we will check all the project funder filter checkboxes and we will only display those templates.

If there are no funders, we will show a filter checkbox for DMP Best Practices, which will be checked on initial page load.

## Displaying all public templates
When filters are unchecked, then all the public, versioned templates are displayed. The number of templates we show will depend on the `PUBLIC_TEMPLATES_INCREMENT` and `FILTER_TEMPLATES_INCREMENT` constants set. The `Load more` button will allow users to load more in the given increments.

## Searching
When a user enters a search term, it will search the templates that are currently available. So, if the funder filter checkbox is checked, the search will only search those project funder templates. Otherwise, all public templates will be searched.
