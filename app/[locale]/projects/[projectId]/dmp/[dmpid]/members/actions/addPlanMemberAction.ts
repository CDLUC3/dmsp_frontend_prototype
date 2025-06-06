"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { AddPlanMemberDocument } from "@/generated/graphql";

export async function addPlanMemberAction({
  planId,
  projectMemberId,
}: {
  planId: number;
  projectMemberId: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: AddPlanMemberDocument,
      variables: { planId, projectMemberId },
      dataPath: "addPlanMember"
    });

  } catch (error) {
    logger.error(`[Add Plan Member Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}
