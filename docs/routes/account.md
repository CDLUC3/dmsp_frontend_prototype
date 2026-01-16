# Account Routes

This section contains 5 routes.

## Route Structure

```mermaid
graph TD
    node0[Account]
    node1[":locale"]
    node0 --> node1
    node2[account]
    node1 --> node2
    node3[connections]
    node2 --> node3
    node4[notifications]
    node2 --> node4
    node5[profile]
    node2 --> node5
    node6[update-password]
    node2 --> node6
```

## All Routes

| Route | Depth |
|-------|-------|
| `/:locale/account` | 2 |
| `/:locale/account/connections` | 3 |
| `/:locale/account/notifications` | 3 |
| `/:locale/account/profile` | 3 |
| `/:locale/account/update-password` | 3 |
