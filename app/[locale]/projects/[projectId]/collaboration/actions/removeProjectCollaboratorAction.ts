"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { RemoveProjectCollaboratorDocument } from "@/generated/graphql";

export async function removeProjectCollaboratorAction({
  projectCollaboratorId,
}: {
  projectCollaboratorId: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: RemoveProjectCollaboratorDocument,
      variables: { projectCollaboratorId },
      dataPath: "removeProjectCollaborator"
    });

  } catch (error) {
    logger.error(`[Remove Project Collaborator Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}