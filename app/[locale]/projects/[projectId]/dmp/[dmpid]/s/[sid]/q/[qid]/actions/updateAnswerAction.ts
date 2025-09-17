"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateAnswerDocument } from "@/generated/graphql";
import logger from "@/utils/server/logger";
import { prepareObjectForLogs } from "@/utils/server/loggerUtils";

export async function updateAnswerAction({
  answerId,
  json
}: {
  answerId: number;
  json: string;
}): Promise<ActionResponse> {

  logger.debug(
      prepareObjectForLogs({ json }),
      "updateAnswerAction initialized"
  );

  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateAnswerDocument,
    variables: { answerId, json },
    dataPath: "updateAnswer"
  });
}