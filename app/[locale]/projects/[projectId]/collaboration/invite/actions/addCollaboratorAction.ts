"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { CollaboratorResponse } from "@/app/types";
import { AddProjectCollaboratorDocument } from "@/generated/graphql";

export async function addProjectCollaboratorAction({
  projectId,
  email,
  accessLevel
}: {
  projectId: number;
  email: string;
  accessLevel: string;
}): Promise<CollaboratorResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddProjectCollaboratorDocument,
    variables: { projectId, email, accessLevel },
    dataPath: "addProjectCollaborator"
  });
}