"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { RemoveFeedbackCommentDocument } from "@/generated/graphql";

export async function removeFeedbackCommentAction({
  planId,
  planFeedbackCommentId
}: {
  planId: number;
  planFeedbackCommentId: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: RemoveFeedbackCommentDocument,
    variables: { planId, planFeedbackCommentId },
    dataPath: "removeFeedbackComment"
  });
}