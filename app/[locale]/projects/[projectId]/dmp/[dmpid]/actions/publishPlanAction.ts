"use server";

import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/logger";
import { ActionResponse } from "@/app/types";
import { PublishPlanDocument } from "@/generated/graphql";

export async function publishPlanAction({
  planId,
  visibility
}: {
  planId: number;
  visibility: string;
}): Promise<ActionResponse> {
  console.log("***PublishPlanDocument", PublishPlanDocument);
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: PublishPlanDocument,
      variables: { planId, visibility },
      dataPath: "publishPlan"
    });

  } catch (error) {
    logger.error(`[Publish Plan Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}