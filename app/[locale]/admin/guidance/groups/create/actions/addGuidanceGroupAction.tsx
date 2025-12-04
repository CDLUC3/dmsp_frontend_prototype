"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { AddGuidanceGroupDocument } from "@/generated/graphql";

export async function addGuidanceGroupAction({
  affiliationId,
  bestPractice,
  name,
  description,
}: {
  affiliationId: string;
  bestPractice: boolean;
  name: string;
  description: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddGuidanceGroupDocument,
    variables: {
      input: {
        affiliationId,
        bestPractice,
        name,
        description,
      }
    },
    dataPath: "addGuidanceGroup"
  });
}