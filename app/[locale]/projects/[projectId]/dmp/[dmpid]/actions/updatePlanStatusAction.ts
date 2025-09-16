"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdatePlanStatusDocument } from "@/generated/graphql";

export async function updatePlanStatusAction({
  planId,
  status
}: {
  planId: number;
  status: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdatePlanStatusDocument,
    variables: { planId, status },
    dataPath: "updatePlanStatus"
  });
}