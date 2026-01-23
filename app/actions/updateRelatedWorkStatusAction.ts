"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { RelatedWorkStatus, UpdateRelatedWorkStatusDocument } from "@/generated/graphql";

export async function updateRelatedWorkStatusAction({
  id,
  status,
}: {
  id: number;
  status: RelatedWorkStatus;
}): Promise<ActionResponse> {
  return await executeGraphQLMutation({
    document: UpdateRelatedWorkStatusDocument,
    variables: { input: {id, status} },
    dataPath: "updateRelatedWorkStatus",
  });
}
