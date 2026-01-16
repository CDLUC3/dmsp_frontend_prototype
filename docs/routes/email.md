# Email Routes

This section contains 3 routes.

## Route Structure

```mermaid
graph TD
    node0[Email]
    node1[":locale"]
    node0 --> node1
    node2[email]
    node1 --> node2
    node3[confirm-email]
    node2 --> node3
    node4[":userId"]
    node3 --> node4
    node5[":token"]
    node4 --> node5
    node6[email-confirmed]
    node2 --> node6
    node7[verification-failed]
    node2 --> node7
```

## All Routes

| Route | Depth |
|-------|-------|
| `/:locale/email/confirm-email/:userId/:token` | 5 |
| `/:locale/email/email-confirmed` | 3 |
| `/:locale/email/verification-failed` | 3 |
