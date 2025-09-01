# Summary of Comment functionality

There are a lot of rules around who can add, edit and delete comments on this page.

The `Leave a comment` section is sticky at the bottom of the Drawer panel. The `Comments` header and `Close` button also remain at the top. The list of comments is scrollable, with lengthy comments having their own `Expand/Collapse` links.

## Initital page load
When there are comments from either the `answerComments` or `feedbackComments` table for the given `answerId`, a user will see the `Comments` button showing the # of comments associated with the current `answerId`.

## Displaying all comments
When the user clicks on the `Comments` button, all available comments from the above tables will be displayed in chronological order. Comments from `ADMINS` and `SUPERADMINs` will be marked with `(ADMIN)` next to the admin name.

## CommentsDrawer
The Comments Drawer code was placed into its own `CommentsDrawer` component for cleaner code, and to make it easier to test.

## Comments hook
All comments handlers and associated states were consolidated into one hook at `hooks/useComment.tsx`.

## Adding comments

### ADMIN and SUPERADMIN
If there are `feedback` rounds open for given `planId` in the `feedback` db table, and the user is an `ADMIN` or `SUPERADMIN` that belongs to the same org as the plan, then they can add comments.

### Plan Owners
If the user is the `creator` of the plan, or is a project collaborator with the `role="OWN"`, then they can add comments.

### Project Collaborators
If the user is a `project collaborator` they can also add comments.

## Editing comments
Only the user who added the comment can edit their own comment. An `edit` link will display under the user's comment, allowing them to edit it.

## Deleting comments
The creator of the plan can `delete` any comments. Users who added the comments can delete their own.
