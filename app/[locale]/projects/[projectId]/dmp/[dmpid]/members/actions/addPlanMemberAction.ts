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
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddPlanMemberDocument,
    variables: { planId, projectMemberId },
    dataPath: "addPlanMember"
  });
}
