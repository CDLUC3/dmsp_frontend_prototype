"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { RemoveProjectCollaboratorDocument } from "@/generated/graphql";

export async function removeProjectCollaboratorAction({
  projectCollaboratorId,
}: {
  projectCollaboratorId: number;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: RemoveProjectCollaboratorDocument,
    variables: { projectCollaboratorId },
    dataPath: "removeProjectCollaborator"
  });
}