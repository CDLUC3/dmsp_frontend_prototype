"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateGuidanceGroupDocument } from "@/generated/graphql";

export async function updateGuidanceGroupAction({
  guidanceGroupId,
  name,
  description,
  optionalSubset,
  bestPractice
}: {
  guidanceGroupId: number;
  name: string;
  description: string;
  optionalSubset: boolean;
  bestPractice: boolean;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateGuidanceGroupDocument,
    variables: {
      input: {
        guidanceGroupId,
        name,
        description,
        optionalSubset,
        bestPractice
      }
    },
    dataPath: "updateGuidanceGroup"
  });
}