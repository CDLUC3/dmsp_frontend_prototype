"use server";

import { PublishPlanDocument } from "@/generated/graphql";
import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/logger";
import { ActionResponse } from "@/app/types";

export async function publishPlanAction({
  planId,
  visibility
}: {
  planId: number;
  visibility: string;
}): Promise<ActionResponse> {

  try {
    // Extract mutation string from the generated document
    const mutationString = PublishPlanDocument.loc?.source.body;

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
      variables: { planId, visibility },
      errorPath: "publishPlan.errors",
      dataPath: "publishPlan"
    });

  } catch (error) {
    logger.error(`[Publish Plan Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}