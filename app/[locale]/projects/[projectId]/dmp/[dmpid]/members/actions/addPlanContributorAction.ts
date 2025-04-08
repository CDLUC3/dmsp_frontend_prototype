"use server";

import { gql } from "graphql-request";
import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/logger";
import { ActionResponse } from "@/app/types";

const AddPlanContributorDocument = gql`
    mutation AddPlanContributor($planId: Int!, $projectContributorId: Int!) {
  addPlanContributor(planId: $planId, projectContributorId: $projectContributorId) {
    errors {
      general
      contributorRoleIds
      primaryContact
      projectContributorId
      projectId
    }
    id
    isPrimaryContact
  }
}
    `;

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