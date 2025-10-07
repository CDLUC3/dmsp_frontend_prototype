"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateSectionDisplayOrderDocument } from "@/generated/graphql";

export async function updateSectionDisplayOrderAction({
  sectionId,
  newDisplayOrder
}: {
  sectionId: number;
  newDisplayOrder: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateSectionDisplayOrderDocument,
    variables: { sectionId, newDisplayOrder },
    dataPath: "updateSectionDisplayOrder"
  });
}