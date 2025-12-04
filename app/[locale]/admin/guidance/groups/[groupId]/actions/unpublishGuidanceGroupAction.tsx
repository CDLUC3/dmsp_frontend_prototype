"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UnpublishGuidanceGroupDocument } from "@/generated/graphql";

export async function unPublishGuidanceGroupAction({
  guidanceGroupId
}: {
  guidanceGroupId: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UnpublishGuidanceGroupDocument,
    variables: {
      guidanceGroupId
    },
    dataPath: "unpublishGuidanceGroup"
  });
}