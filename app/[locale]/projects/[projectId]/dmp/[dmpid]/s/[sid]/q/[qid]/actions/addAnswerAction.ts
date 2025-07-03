"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { AddAnswerDocument } from "@/generated/graphql";

export async function addAnswerAction({
  planId,
  versionedSectionId,
  versionedQuestionId,
  json
}: {
  planId: number;
  versionedSectionId: number;
  versionedQuestionId: number;
  json: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: AddAnswerDocument,
      variables: { planId, versionedSectionId, versionedQuestionId, json },
      dataPath: "addAnswer"
    });

  } catch (error) {
    console.log("***ERROR", error);
    logger.error(`[Publish Plan Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}