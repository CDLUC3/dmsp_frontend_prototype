"use server";

import { gql } from "graphql-request";
import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/logger";
import { ActionResponse } from "@/app/types";

const UpdatePlanStatusDocument = gql`
    mutation UpdatePlanStatus($planId: Int!, $status: PlanStatus!) {
  updatePlanStatus(planId: $planId, status: $status) {
    errors {
      general
      status
    }
    id
    status
    visibility
  }
}
    `;

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