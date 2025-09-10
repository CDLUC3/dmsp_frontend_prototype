"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
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
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: AddProjectCollaboratorDocument,
      variables: { projectId, email, accessLevel },
      dataPath: "addProjectCollaborator"
    });

  } catch (error) {
    logger.error({ error }, `[Add Project Collaborator Error]: ${error}`);
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}