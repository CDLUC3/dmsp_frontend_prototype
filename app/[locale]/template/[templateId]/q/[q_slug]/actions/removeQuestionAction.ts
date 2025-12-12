"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { RemoveQuestionDocument } from "@/generated/graphql";

export async function removeQuestionAction({
  questionId
}: {
  questionId: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: RemoveQuestionDocument,
    variables: {
      input: {
        questionId,
      }
    },
    dataPath: "removeQuestion"
  });
}