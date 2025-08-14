"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
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
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateAnswerCommentDocument,
      variables: { answerId, answerCommentId, commentText },
      dataPath: "updateAnswerComment"
    });
  } catch (error) {
    logger.error(`[Update answerComment from answer]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}