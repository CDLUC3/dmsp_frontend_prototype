# Summary of page functionality

The functionality on this page is a bit confusing, so it's been summarized here.

## Initital page load
When the page first loads, we automatically check all the `Project Funder` checkboxes if there are any. If there are no project funders, then we default to showing a checkbox for `Best Practices` templates

## Displaying all public templates
When filters are unchecked, then all the public, versioned templates are displayed. The number of templates we show will depend on the `PUBLIC_TEMPLATES_INCREMENT` and `FILTER_TEMPLATES_INCREMENT` constants set. The `Load more` button will allow users to load more in the given increments.

The templates are ordered with the project funder templates at the top.

## Searching
When a user enters a search term, it will search the templates that are currently available. So, if the funder filter checkbox is checked, the search will only search those project funder templates. Otherwise, all public templates will be searched.
