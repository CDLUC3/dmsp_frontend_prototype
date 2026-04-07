"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { AddAnswerCommentDocument } from "@/generated/graphql";

export async function addAnswerCommentAction({
  answerId,
  commentText
}: {
  answerId: number;
  commentText: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddAnswerCommentDocument,
    variables: { answerId, commentText },
    dataPath: "addAnswerComment"
  });
}