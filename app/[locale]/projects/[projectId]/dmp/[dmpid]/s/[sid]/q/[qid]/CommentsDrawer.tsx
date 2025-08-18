'use client';

import React from 'react';
import {
  Button,
  Form,
  Label,
  TextArea,
  TextField
} from "react-aria-components";

import {
  MeQuery
} from '@/generated/graphql';
import styles from './PlanOverviewQuestionPage.module.scss';
import { useTranslations } from "next-intl";
import {

  DrawerPanel
} from "@/components/Container";

// Utils
import { formatRelativeFromTimestamp } from '@/utils/dateUtils';

interface User {
  __typename?: "User";
  id?: number | null;
  surName?: string | null;
  givenName?: string | null;
}

// Simple merged comment interface - more flexible approach
interface MergedComment {
  __typename?: "AnswerComment" | "PlanFeedbackComment";
  id?: number | null;
  commentText?: string | null;
  answerId?: number | null;
  created?: string | null;
  type: 'answer' | 'feedback';
  isAnswerComment: boolean;
  isFeedbackComment: boolean;

  // Optional fields that may exist on either type
  user?: User | null;
  modified?: string | null;
  PlanFeedback?: any | null;
}

interface CommentsDrawerProps {
  isCommentsDrawerOpen: boolean;
  closeCurrentDrawer: () => void;
  openCommentsButtonRef: React.RefObject<HTMLButtonElement>;
  mergedComments: MergedComment[];
  editingCommentId: number | null | undefined;
  editingCommentText: string;
  setEditingCommentText: (text: string) => void;
  handleUpdateComment: (comment: MergedComment) => void;
  handleCancelEdit: () => void;
  handleEditComment: (comment: MergedComment) => void;
  handleDeleteComment: (comment: MergedComment) => void;
  me: MeQuery | null | undefined;
  planOwners: number[] | undefined | null;
  locale: string;
  commentsEndRef: React.RefObject<HTMLDivElement>;
  canAddComments: boolean;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  handleAddComment: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}


const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isCommentsDrawerOpen,
  closeCurrentDrawer,
  openCommentsButtonRef,
  mergedComments,
  editingCommentId,
  editingCommentText,
  setEditingCommentText,
  handleUpdateComment,
  handleCancelEdit,
  handleEditComment,
  handleDeleteComment,
  me,
  planOwners,
  locale,
  commentsEndRef,
  canAddComments,
  newCommentText,
  setNewCommentText,
  handleAddComment,
}) => {

  // Localization
  const Global = useTranslations('Global');
  const PlanOverview = useTranslations('PlanOverview');
  const t = useTranslations('PlanOverviewQuestionPage');


  return (
    <>
      {/**Comments drawer */}
      <DrawerPanel
        isOpen={isCommentsDrawerOpen}
        onClose={closeCurrentDrawer}
        returnFocusRef={openCommentsButtonRef}
        className={styles.drawerPanelWrapper}
        title={PlanOverview('headings.comments')}
      >

        <div className={styles.commentsWrapper}>
          {mergedComments?.map((comment, index) => {
            const formattedCreatedDate = comment.created ? formatRelativeFromTimestamp(comment.created, locale) : '';
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
                        onPress={() => handleUpdateComment(comment)}
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
            )
          })}
          <div ref={commentsEndRef} />
        </div>


        {/**Can only add comments if the user has the correct permissions */}
        {canAddComments && (
          <div className={styles.leaveComment}>
            <h2>{PlanOverview('headings.leaveAComment')}</h2>
            <Form onSubmit={(e) => handleAddComment(e)}>
              <TextField className={styles.commentTextField}>
                <Label>{me ? (`${me?.me?.givenName} ${me?.me?.surName}`) : ''}{' '}{`(${t('you')})`}</Label>
                <TextArea
                  onChange={e => setNewCommentText(e.target.value)}
                  value={newCommentText}
                  data-testid="new-comment-textarea"
                />
              </TextField>
              <div className={styles.addCommentButton}>
                <div>
                  <Button type="submit" className={`${styles.buttonSmall}`}>{PlanOverview('buttons.comment')}</Button>
                </div>
                <p className="font-small">{PlanOverview('page.participantsWillBeNotified')}</p>
              </div>
            </Form>
          </div>
        )}

      </DrawerPanel>
    </>
  );
}

export default CommentsDrawer;