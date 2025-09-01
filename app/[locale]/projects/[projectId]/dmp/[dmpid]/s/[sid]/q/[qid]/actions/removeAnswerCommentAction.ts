"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { RemoveAnswerCommentDocument } from "@/generated/graphql";

export async function removeAnswerCommentAction({
  answerId,
  answerCommentId
}: {
  answerId: number;
  answerCommentId: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: RemoveAnswerCommentDocument,
      variables: { answerId, answerCommentId },
      dataPath: "removeAnswerComment"
    });
  } catch (error) {
    logger.error(`[Remove answerComment from answer]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}