"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateSectionDisplayOrderDocument } from "@/generated/graphql";

export async function updateSectionDisplayOrderAction({
  sectionId,
  newDisplayOrder
}: {
  sectionId: number;
  newDisplayOrder: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: UpdateSectionDisplayOrderDocument,
      variables: { sectionId, newDisplayOrder },
      dataPath: "updateSectionDisplayOrder"
    });

  } catch (error) {
    logger.error(`[Update Section Display Order Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}