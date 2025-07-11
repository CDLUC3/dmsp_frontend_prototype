"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateQuestionDisplayOrderDocument } from "@/generated/graphql";

export async function updateQuestionDisplayOrderAction({
  questionId,
  newDisplayOrder
}: {
  questionId: number;
  newDisplayOrder: number
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateQuestionDisplayOrderDocument,
      variables: { questionId, newDisplayOrder },
      dataPath: "updateQuestionDisplayOrder"
    });

  } catch (error) {
    logger.error(`[Update Question Display Order Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}