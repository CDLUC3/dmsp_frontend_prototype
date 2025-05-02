"use server";

import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { AddPlanContributorDocument } from "@/generated/graphql";

export async function addPlanContributorAction({
  planId,
  projectContributorId,
}: {
  planId: number;
  projectContributorId: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: AddPlanContributorDocument,
      variables: { planId, projectContributorId },
      dataPath: "addPlanContributor"
    });

  } catch (error) {
    logger.error(`[Add Plan Contributor Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}