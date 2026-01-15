# Admin Routes

This section contains 12 routes.

## Route Structure

<style>body.dark #editor .mermaid-chart svg { background-color: #2E3440; color: white; }</style>
```mermaid
graph TD
    node0[Admin]
    node1[":locale"]
    node0 --> node1
    node2[admin]
    node1 --> node2
    node3[departments]
    node2 --> node3
    node4[email-preferences]
    node2 --> node4
    node5[feedback-options]
    node2 --> node5
    node6[guidance]
    node2 --> node6
    node7[groups]
    node6 --> node7
    node8[":groupId"]
    node7 --> node8
    node9[edit]
    node8 --> node9
    node10[create]
    node7 --> node10
    node11[organization-details]
    node2 --> node11
    node12[projects]
    node2 --> node12
    node13[templates]
    node2 --> node13
    node14[users]
    node2 --> node14
```

## All Routes

| Route | Depth |
|-------|-------|
| `/:locale/admin` | 2 |
| `/:locale/admin/departments` | 3 |
| `/:locale/admin/email-preferences` | 3 |
| `/:locale/admin/feedback-options` | 3 |
| `/:locale/admin/guidance` | 3 |
| `/:locale/admin/guidance/groups/:groupId` | 5 |
| `/:locale/admin/guidance/groups/:groupId/edit` | 6 |
| `/:locale/admin/guidance/groups/create` | 5 |
| `/:locale/admin/organization-details` | 3 |
| `/:locale/admin/projects` | 3 |
| `/:locale/admin/templates` | 3 |
| `/:locale/admin/users` | 3 |
