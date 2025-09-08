"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { RemoveFeedbackCommentDocument } from "@/generated/graphql";

export async function removeFeedbackCommentAction({
  planId,
  planFeedbackCommentId
}: {
  planId: number;
  planFeedbackCommentId: number;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ planId, planFeedbackCommentId }), "Removing feedback comment");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: RemoveFeedbackCommentDocument,
      variables: { planId, planFeedbackCommentId },
      dataPath: "removeFeedbackComment"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, planFeedbackCommentId, error }), "Remove feedbackComment from answer");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}