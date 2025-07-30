"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateAnswerDocument } from "@/generated/graphql";

export async function updateAnswerAction({
  answerId,
  json
}: {
  answerId: number;
  json: string;
}): Promise<ActionResponse> {

console.log('Doc', UpdateAnswerDocument);
console.log('answer', answerId);
console.log('json', json);

  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateAnswerDocument,
      variables: { answerId, json },
      dataPath: "updateAnswer"
    });

  } catch (error) {
    logger.error(`[Update answer for question]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}