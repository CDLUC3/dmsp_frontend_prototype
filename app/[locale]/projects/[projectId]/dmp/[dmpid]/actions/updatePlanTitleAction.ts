"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdatePlanTitleDocument } from "@/generated/graphql";

export async function updatePlanTitleAction({
  planId,
  title
}: {
  planId: number;
  title: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdatePlanTitleDocument,
      variables: { planId, title },
      dataPath: "updatePlanTitle"
    });

  } catch (error) {
    logger.error(`[Update Plan Title Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}