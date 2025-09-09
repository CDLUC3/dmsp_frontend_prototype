"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateProjectCollaboratorDocument } from "@/generated/graphql";

export async function updateProjectCollaboratorAction({
  projectCollaboratorId,
  accessLevel
}: {
  projectCollaboratorId: number;
  accessLevel: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateProjectCollaboratorDocument,
      variables: { projectCollaboratorId, accessLevel },
      dataPath: "updateProjectCollaborator"
    });

  } catch (error) {
    logger.error(`[Update Project Collaborator Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}