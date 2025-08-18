import React from 'react';
import { formatRelativeFromTimestamp } from '@/utils/dateUtils';
import {
  Button,
  TextArea,
} from "react-aria-components";
import { MergedComment } from '@/app/types';
import styles from './PlanOverviewQuestionPage.module.scss';


interface CommentListProps {
  comments: any[];
  editingCommentId: number | null | undefined;
  editingCommentText: string;
  me: any;
  planOwners: number[] | null | undefined;
  t: any;
  Global: any;
  handleEditComment: (comment: MergedComment) => void;
  handleUpdateComment: (comment: MergedComment) => void;
  handleCancelEdit: () => void;
  handleDeleteComment: (comment: MergedComment) => void;
  locale: string;
  setEditingCommentText: (text: string) => void;
}

const CommentList = React.memo(function CommentList(props: CommentListProps) {
  const {
    comments,
    editingCommentId,
    editingCommentText,
    me,
    planOwners,
    t,
    Global,
    handleEditComment,
    handleUpdateComment,
    handleCancelEdit,
    handleDeleteComment,
    locale,
    setEditingCommentText,
  } = props;


  const updateCommentHandler = (comment: MergedComment) => {
    if (!editingCommentText.trim()) {
      return; // Prevent saving empty comments
    }

    handleUpdateComment({
      ...comment,

    });
    setEditingCommentText(''); // Clear the editing text after saving
  };
  return (
    <>
      {comments?.map((comment, index) => {
        // Replace useMemo with a simple variable
        const formattedCreatedDate = comment.created
          ? formatRelativeFromTimestamp(comment.created, locale)
          : "";

        const isEditing = editingCommentId === comment.id;

        return (
          <div key={`${comment.type}-${comment.id}-${index}`} className={styles.comment}>
            <h4>
              {comment?.user?.givenName}{' '}{comment?.user?.surName}{' '}
              <span className={styles.deEmphasize}>
                {comment?.isFeedbackComment ? `(${t('admin')})` : ''}
              </span>
            </h4>
            <p className={`${styles.deEmphasize} ${styles.createdDate}`}>
              {formattedCreatedDate}{' '}
              {(comment.created !== comment.modified) ? `(${t('edited')})` : ''}
            </p>

            {/* Conditional rendering: textarea when editing, paragraph when not */}
            {isEditing ? (
              <TextArea
                value={editingCommentText}
                onChange={(e) => setEditingCommentText(e.target.value)}
                className={styles.editTextarea}
                rows={3}
                ref={(el) => {
                  if (el) {
                    el.focus({ preventScroll: true }); {/**focus the text without scrolling. If we use autofocus, it will scroll the field behind the sticky Add Comment section */ }
                  }
                }}
              />
            ) : (
              <p>{comment.commentText}</p>
            )}

            <div>
              {isEditing ? (
                <>
                  <Button
                    className={`${styles.deEmphasize} link`}
                    type="button"
                    onPress={() => updateCommentHandler(comment)}
                  >
                    {Global('buttons.save')}
                  </Button>
                  <Button
                    className={`${styles.deEmphasize} link`}
                    type="button"
                    onPress={handleCancelEdit}
                  >
                    {Global('buttons.cancel')}
                  </Button>
                </>
              ) : (
                <>
                  {/**Only display edit button if it's the user's own comment */}
                  {comment?.user?.id === me?.me?.id && (
                    <Button
                      className={`${styles.deEmphasize} link`}
                      type="button"
                      onPress={() => handleEditComment(comment)}
                    >
                      {Global('buttons.edit')}
                    </Button>
                  )}

                  {/**Only display the delete button for the user who created the comment or a project collaborator with role 'OWN' */}
                  {((comment?.user?.id === me?.me?.id) || planOwners?.includes(me?.me?.id as number)) && (
                    <Button
                      className={`${styles.deEmphasize} link`}
                      type="button"
                      onPress={() => handleDeleteComment(comment)}
                    >
                      {Global('buttons.delete')}
                    </Button>
                  )}

                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
});

export default CommentList;