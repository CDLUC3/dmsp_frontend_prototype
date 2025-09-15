"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
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
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: RemoveFeedbackCommentDocument,
      variables: { planId, planFeedbackCommentId },
      dataPath: "removeFeedbackComment"
    });
  } catch (error) {
    logger.error({ error }, `[Remove feedbackComment from answer]: ${error}`);
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}