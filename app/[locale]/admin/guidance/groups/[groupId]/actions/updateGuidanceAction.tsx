"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateGuidanceDocument } from "@/generated/graphql";

export async function updateGuidanceAction({
  guidanceId,
  guidanceText,
  tagId
}: {
  guidanceId: number;
  guidanceText?: string;
  tagId: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateGuidanceDocument,
    variables: {
      input: {
        guidanceId,
        tagId,
        guidanceText
      }
    },
    dataPath: "updateGuidance"
  });
}