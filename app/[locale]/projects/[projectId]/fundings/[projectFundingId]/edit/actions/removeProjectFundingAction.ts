"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { RemoveProjectFundingDocument } from "@/generated/graphql";

export async function removeProjectFundingAction({
  projectFundingId
}: {
  projectFundingId: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: RemoveProjectFundingDocument,
      variables: { projectFundingId },
      dataPath: "removeProjectFunding"
    });

  } catch (error) {
    logger.error(`[RemoveProjectFunding Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}