# Plan Create Page

## Overview

The Plan Create page loads the published templates associated with the given `project id`. The templates can be filtered on specific`funder templates` and on `best practice` templates, and users can search the template list. Pagination is available for long lists.

---

## Business Requirements

### Template Filtering Logic

The functionality on this page is a bit confusing, so it's been summarized here.

## Initital page load
When the page first loads, we automatically check all the `Project Funder` checkboxes if there are any. If there are no project funders, then we default to showing a checkbox for `Best Practices` templates

## Displaying all public templates
When filters are unchecked, then all the public, versioned templates are displayed. The number of templates we show will depend on the `PUBLIC_TEMPLATES_INCREMENT` and `FILTER_TEMPLATES_INCREMENT` constants set. The `Load more` button will allow users to load more in the given increments.

The templates are ordered with the project funder templates at the top.

## Searching
When a user enters a search term, it will search the templates that are currently available. So, if the funder filter checkbox is checked, the search will only search those project funder templates. Otherwise, all public templates will be searched.

---

## User Interface Components

### Filter Controls
- **Funder Checkboxes**: Dynamic based on project funders and available templates
- **Best Practice Checkbox**: Shown when best practice templates are available
- **Search Bar**: Text-based filtering of templates
- **Clear Filters Button**: Reset all applied filters

### Template List
- **Template Cards**: Display template name, description, owner, and metadata
- **Template Actions**: Select template button, preview options
- **Loading States**: Skeleton loading while fetching data
- **Empty States**: Messaging when no templates match filters

### Pagination Controls
- **Navigation**: Previous/Next buttons for sequential browsing
- **Direct Access**: Clickable page numbers for jumping to specific pages
- **Ellipsis**: Prevents overcrowding when many pages exist
- **Page Info**: Shows current page and total results
