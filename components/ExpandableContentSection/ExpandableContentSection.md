# ExpandableContentSection

A React component for displaying content that is wrapped in multiple html tags that can be expanded or collapsed. Supports truncation based on character count, while preserving paragraph (`<p>`, `<div>`, `<span>`) structure.

---

## ✨ Features

- Truncates text content across multiple HTML elements.
- Preserves semantic tags (`<p>`, `<div>`, `<span>`).
- Shows "Expand" / "Collapse" links for toggling visibility.
- Accessible with proper ARIA attributes and `aria-live` updates.

---

## 🔧 Props

| Name               | Type                    | Required | Description                                                                           |
|--------------------|-------------------------|----------|---------------------------------------------------------------------------------------|
| `id`               | `string`                | ✅       | Unique identifier for accessibility and toggling.                                     |
| `heading`          | `string` or `ReactNode` | ✅       | The section heading.                                                                  |
| `expandLabel`      | `string`                |          | Optional label for the expand link (defaults to a localized string).                  |
| `collapseLabel`    | `string`                |          | Optional label for the collapse link (defaults to a localized string).                |
| `summaryCharLimit` | `number`                |          | Max character count before truncating. If none specified, will show all the content.  |
| `children`         | `React.ReactNode`       | ✅       | Content to be shown and truncated. Should include `<p>`, `<div>`, or `<span>`.         |

---

## 💡 Usage

```tsx
import ExpandableContentSection from '@/components/ExpandableContentSection';

<ExpandableContentSection
  id="data-description"
  heading="Description of Your Data"
  expandLabel="Show more"
  collapseLabel="Show less"
  summaryCharLimit={300}
>
  <p>This is paragraph one of the content...</p>
  <p>This is paragraph two with more details...</p>
  <p>This is paragraph three with further explanation...</p>
</ExpandableContentSection>
```