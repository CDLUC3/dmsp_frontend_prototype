"use server";

import { AddPlanContributorDocument } from "@/generated/graphql";
import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/logger";
import { ActionResponse } from "@/app/types";


export async function addPlanContributorAction({
  planId,
  projectContributorId,
}: {
  planId: number;
  projectContributorId: number;
}): Promise<ActionResponse> {

  try {
    // Extract mutation string from the generated document
    const mutationString = AddPlanContributorDocument.loc?.source.body;

    if (!mutationString) {
      logger.error("Could not extract mutation string from document");
      return {
        success: false,
        errors: ["An error occurred while preparing the request."]
      }
    }

    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      mutationString,
      variables: { planId, projectContributorId },
      errorPath: "addPlanContributor.errors",
      dataPath: "addPlanContributor"
    });

  } catch (error) {
    logger.error(`[Add Plan Contributor Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}