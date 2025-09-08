"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { AddFeedbackCommentDocument } from "@/generated/graphql";

export async function addFeedbackCommentAction({
  planId,
  planFeedbackId,
  answerId,
  commentText
}: {
  planId: number;
  planFeedbackId: number;
  answerId: number;
  commentText: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ planId, planFeedbackId, answerId, commentText }), "Adding feedback comment");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: AddFeedbackCommentDocument,
      variables: { planId, planFeedbackId, answerId, commentText },
      dataPath: "addFeedbackComment"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, planFeedbackId, answerId, commentText, error }), "Add feedbackComment for answer");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}