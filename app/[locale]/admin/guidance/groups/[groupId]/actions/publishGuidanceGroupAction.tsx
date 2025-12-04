"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { PublishGuidanceGroupDocument } from "@/generated/graphql";

export async function publishGuidanceGroupAction({
  guidanceGroupId
}: {
  guidanceGroupId: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: PublishGuidanceGroupDocument,
    variables: {
      guidanceGroupId
    },
    dataPath: "publishGuidanceGroup"
  });
}