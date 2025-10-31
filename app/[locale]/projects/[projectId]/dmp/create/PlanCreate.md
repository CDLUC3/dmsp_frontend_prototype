# Plan Create Page

## Overview

The Plan Create page loads the published templates associated with the given `project id`. The templates can be filtered on specific`funder templates` and on `best practice` templates, and users can search the template list. Pagination is available for long lists.

---

## Business Requirements

### Template Filtering Logic

#### Scenario 1: Project with Funders
- **Condition**: Project has associated funders AND published templates exist that match those funders
- **Behavior**: 
  - Funder checkboxes, or user's org checkbox, are initially checked
  - Template list is filtered to show only templates matching project funders
  - Other filtering options remain available
  - When user enters a search term with funder checkbox(es) checked, then the results will still only contain the funder templates
  - If the funder checkboxes are unchecked with a search term available, then the results will display all matches for the search term, regardless of which created by funders

#### Scenario 2: No Funders, Best Practice Available
- **Condition**: Project has no funders AND template list contains best practice templates
- **Behavior**:
  - "Best Practice" checkbox is displayed and initially checked
  - Template list is filtered to show only best practice templates
  - Funder checkboxes are not displayed
  - When user enters a search term with the best practice checkbox checked, then the results from the search will continue to search only within best practice templates
  - If the best practice checkbox is unchecked while there is a search term, then the results will display all matches for the search term, regardless of which are best practice

#### Scenario 3: No Funders, No Best Practice
- **Condition**: Project has no funders AND no best practice templates available
- **Behavior**:
  - No checkboxes are displayed initially
  - All available templates are shown
  - Users can still apply filters manually if desired

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
