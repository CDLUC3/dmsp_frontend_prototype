"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, { prepareObjectForLogs } from "@/utils/server/logger";
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
    logger.debug(await prepareObjectForLogs({ planId, projectMemberId }), "Adding planMember");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: AddPlanMemberDocument,
      variables: { planId, projectMemberId },
      dataPath: "addPlanMember"
    });

  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, projectMemberId, error }), "Add planMember");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}
