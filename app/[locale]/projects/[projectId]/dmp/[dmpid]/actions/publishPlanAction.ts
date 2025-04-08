"use server";

import { gql } from "graphql-request";
import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/logger";
import { ActionResponse } from "@/app/types";

const PublishPlanDocument = gql`
    mutation PublishPlan($planId: Int!, $visibility: PlanVisibility) {
  publishPlan(planId: $planId, visibility: $visibility) {
    errors {
      general
      visibility
      status
    }
    visibility
    status
  }
}
    `;

export async function publishPlanAction({
  planId,
  visibility
}: {
  planId: number;
  visibility: string;
}): Promise<ActionResponse> {
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