"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, { prepareObjectForLogs } from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateAnswerDocument } from "@/generated/graphql";

export async function updateAnswerAction({
  answerId,
  json
}: {
  answerId: number;
  json: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ answerId, json }), "Updating answer");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateAnswerDocument,
      variables: { answerId, json },
      dataPath: "updateAnswer"
    });

  } catch (error) {
    logger.error(await prepareObjectForLogs({ answerId, json, error }), "Update answer for question");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}