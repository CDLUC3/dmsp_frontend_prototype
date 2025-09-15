"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { PublishPlanDocument } from "@/generated/graphql";

export async function publishPlanAction({
  planId,
  visibility
}: {
  planId: number;
  visibility: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: PublishPlanDocument,
      variables: { planId, visibility },
      dataPath: "publishPlan"
    });

  } catch (error) {
    logger.error({ error }, `[Publish Plan Error]: ${error}`);
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}