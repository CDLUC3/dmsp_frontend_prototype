"use server";

import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdatePlanStatusDocument } from "@/generated/graphql";

export async function updatePlanStatusAction({
  planId,
  status
}: {
  planId: number;
  status: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: UpdatePlanStatusDocument,
      variables: { planId, status },
      dataPath: "updatePlanStatus"
    });

  } catch (error) {
    logger.error(`[Update Plan Status Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}