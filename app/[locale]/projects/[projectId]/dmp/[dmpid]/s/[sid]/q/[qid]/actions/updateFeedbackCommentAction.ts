"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateFeedbackCommentDocument } from "@/generated/graphql";

export async function updateFeedbackCommentAction({
  planId,
  planFeedbackCommentId,
  commentText
}: {
  planId: number;
  planFeedbackCommentId: number;
  commentText: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ planId, planFeedbackCommentId, commentText }), "Updating feedback comment");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateFeedbackCommentDocument,
      variables: { planId, planFeedbackCommentId, commentText },
      dataPath: "updateFeedbackComment"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, planFeedbackCommentId, commentText, error }), "Update feedbackComment for answer");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}