"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
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
    logger.debug(await prepareObjectForLogs({ answerId, answerCommentId }), "Removing answer comment");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: RemoveAnswerCommentDocument,
      variables: { answerId, answerCommentId },
      dataPath: "removeAnswerComment"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ answerId, answerCommentId, error }), "Remove answerComment from answer");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}