"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateProjectCollaboratorDocument } from "@/generated/graphql";
import logger from "@/utils/server/logger";
import { prepareObjectForLogs } from "@/utils/server/loggerUtils";

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
    logger.error(
        await prepareObjectForLogs({ error, projectCollaboratorId, accessLevel }),
        "Update project collaborator error"
    );
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}