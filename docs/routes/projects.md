# Projects Routes

This section contains 30 routes.

## Route Structure

```mermaid
graph TD
    node0[Projects]
    node1[":locale"]
    node0 --> node1
    node2[projects]
    node1 --> node2
    node3[":projectId"]
    node2 --> node3
    node4[collaboration]
    node3 --> node4
    node5[invite]
    node4 --> node5
    node6[dmp]
    node3 --> node6
    node7[":dmpid"]
    node6 --> node7
    node8[download]
    node7 --> node8
    node9[feedback]
    node7 --> node9
    node10[fundings]
    node7 --> node10
    node11[members]
    node7 --> node11
    node12[related-works]
    node7 --> node12
    node13[s]
    node7 --> node13
    node14[":sid"]
    node13 --> node14
    node15[q]
    node14 --> node15
    node16[":qid"]
    node15 --> node16
    node17[create]
    node6 --> node17
    node18[start]
    node6 --> node18
    node19[upload]
    node6 --> node19
    node20[funding-search]
    node3 --> node20
    node21[fundings]
    node3 --> node21
    node22[":projectFundingId"]
    node21 --> node22
    node23[edit]
    node22 --> node23
    node24[add]
    node21 --> node24
    node25[search]
    node21 --> node25
    node26[members]
    node3 --> node26
    node27[":memberId"]
    node26 --> node27
    node28[edit]
    node27 --> node28
    node29[create]
    node26 --> node29
    node30[search]
    node26 --> node30
    node31[project]
    node3 --> node31
    node32[project-funding]
    node3 --> node32
    node33[projects-search]
    node3 --> node33
    node34[research-outputs]
    node3 --> node34
    node35[edit]
    node34 --> node35
    node36[create-project]
    node2 --> node36
```

## All Routes

| Route | Depth |
|-------|-------|
| `/:locale/projects` | 2 |
| `/:locale/projects/:projectId` | 3 |
| `/:locale/projects/:projectId/collaboration` | 4 |
| `/:locale/projects/:projectId/collaboration/invite` | 5 |
| `/:locale/projects/:projectId/dmp/:dmpid` | 5 |
| `/:locale/projects/:projectId/dmp/:dmpid/download` | 6 |
| `/:locale/projects/:projectId/dmp/:dmpid/feedback` | 6 |
| `/:locale/projects/:projectId/dmp/:dmpid/fundings` | 6 |
| `/:locale/projects/:projectId/dmp/:dmpid/members` | 6 |
| `/:locale/projects/:projectId/dmp/:dmpid/related-works` | 6 |
| `/:locale/projects/:projectId/dmp/:dmpid/s/:sid` | 7 |
| `/:locale/projects/:projectId/dmp/:dmpid/s/:sid/q/:qid` | 9 |
| `/:locale/projects/:projectId/dmp/create` | 5 |
| `/:locale/projects/:projectId/dmp/start` | 5 |
| `/:locale/projects/:projectId/dmp/upload` | 5 |
| `/:locale/projects/:projectId/funding-search` | 4 |
| `/:locale/projects/:projectId/fundings` | 4 |
| `/:locale/projects/:projectId/fundings/:projectFundingId/edit` | 6 |
| `/:locale/projects/:projectId/fundings/add` | 5 |
| `/:locale/projects/:projectId/fundings/search` | 5 |
| `/:locale/projects/:projectId/members` | 4 |
| `/:locale/projects/:projectId/members/:memberId/edit` | 6 |
| `/:locale/projects/:projectId/members/create` | 5 |
| `/:locale/projects/:projectId/members/search` | 5 |
| `/:locale/projects/:projectId/project` | 4 |
| `/:locale/projects/:projectId/project-funding` | 4 |
| `/:locale/projects/:projectId/projects-search` | 4 |
| `/:locale/projects/:projectId/research-outputs` | 4 |
| `/:locale/projects/:projectId/research-outputs/edit` | 5 |
| `/:locale/projects/create-project` | 3 |
