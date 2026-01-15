# Template Routes

This section contains 10 routes.

## Route Structure

```mermaid
graph TD
    node0[Template]
    node1[":locale"]
    node0 --> node1
    node2[template]
    node1 --> node2
    node3[":templateId"]
    node2 --> node3
    node4[access]
    node3 --> node4
    node5[history]
    node3 --> node5
    node6[q]
    node3 --> node6
    node7[":q_slug"]
    node6 --> node7
    node8[new]
    node6 --> node8
    node9[section]
    node3 --> node9
    node10[":section_slug"]
    node9 --> node10
    node11[create]
    node9 --> node11
    node12[new]
    node9 --> node12
    node13[create]
    node2 --> node13
```

## All Routes

| Route | Depth |
|-------|-------|
| `/:locale/template` | 2 |
| `/:locale/template/:templateId` | 3 |
| `/:locale/template/:templateId/access` | 4 |
| `/:locale/template/:templateId/history` | 4 |
| `/:locale/template/:templateId/q/:q_slug` | 5 |
| `/:locale/template/:templateId/q/new` | 5 |
| `/:locale/template/:templateId/section/:section_slug` | 5 |
| `/:locale/template/:templateId/section/create` | 5 |
| `/:locale/template/:templateId/section/new` | 5 |
| `/:locale/template/create` | 3 |
