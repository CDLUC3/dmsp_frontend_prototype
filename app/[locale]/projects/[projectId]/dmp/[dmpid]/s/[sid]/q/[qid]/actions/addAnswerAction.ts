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
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddAnswerDocument,
    variables: { planId, versionedSectionId, versionedQuestionId, json },
    dataPath: "addAnswer"
  });
}