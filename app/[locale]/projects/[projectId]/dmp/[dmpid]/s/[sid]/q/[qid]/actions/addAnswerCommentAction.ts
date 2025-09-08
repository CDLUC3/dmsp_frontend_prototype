"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { AddAnswerCommentDocument } from "@/generated/graphql";

export async function addAnswerCommentAction({
  answerId,
  commentText
}: {
  answerId: number;
  commentText: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ answerId, commentText }), "Adding answer comment");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: AddAnswerCommentDocument,
      variables: { answerId, commentText },
      dataPath: "addAnswerComment"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ answerId, commentText, error }), "Add answerComment for answer");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}