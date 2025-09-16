"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdatePlanTitleDocument } from "@/generated/graphql";

export async function updatePlanTitleAction({
  planId,
  title
}: {
  planId: number;
  title: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdatePlanTitleDocument,
    variables: { planId, title },
    dataPath: "updatePlanTitle"
  });
}