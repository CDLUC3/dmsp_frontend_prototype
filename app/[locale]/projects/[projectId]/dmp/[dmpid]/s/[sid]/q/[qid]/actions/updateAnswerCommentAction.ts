"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
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
    logger.debug(await prepareObjectForLogs({ answerId, answerCommentId, commentText }), "Updating answer comment");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateAnswerCommentDocument,
      variables: { answerId, answerCommentId, commentText },
      dataPath: "updateAnswerComment"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ answerId, answerCommentId, commentText, error }), "Update answerComment for answer");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}