"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
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
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddFeedbackCommentDocument,
    variables: { planId, planFeedbackId, answerId, commentText },
    dataPath: "addFeedbackComment"
  });
}