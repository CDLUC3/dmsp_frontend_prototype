"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, { prepareObjectForLogs } from "@/utils/server/logger";
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
    logger.debug(await prepareObjectForLogs({ planId, versionedSectionId, versionedQuestionId, json }), "Adding answer");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: AddAnswerDocument,
      variables: { planId, versionedSectionId, versionedQuestionId, json },
      dataPath: "addAnswer"
    });
  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, versionedSectionId, versionedQuestionId, json, error }), "Add new answer for question");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}