"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateAnswerCommentDocument } from "@/generated/graphql";

export async function updateAnswerCommentAction({
  answerId,
  answerCommentId,
  commentText
}: {
  answerId: number;
  answerCommentId: number;
  commentText: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateAnswerCommentDocument,
    variables: { answerId, answerCommentId, commentText },
    dataPath: "updateAnswerComment"
  });
}