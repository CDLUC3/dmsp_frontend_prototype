"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
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
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateFeedbackCommentDocument,
      variables: { planId, planFeedbackCommentId, commentText },
      dataPath: "updateFeedbackComment"
    });
  } catch (error) {
    logger.error({ error }, `[Update feedbackComment from answer]: ${error}`);
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}