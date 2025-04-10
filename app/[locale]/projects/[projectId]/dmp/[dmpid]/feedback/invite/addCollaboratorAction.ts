"use server";

import { gql } from "graphql-request";
import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";

const AddProjectCollaboratorDocument = gql`
    mutation addProjectCollaborator($projectId: Int!, $email: String!, $accessLevel: ProjectCollaboratorAccessLevel) {
  addProjectCollaborator(
    projectId: $projectId
    email: $email
    accessLevel: $accessLevel
  ) {
    id
    errors {
      general
      email
      accessLevel
      userId
      invitedById
      planId
    }
    email
  }
}
    `;

export async function addProjectCollaboratorAction({
  projectId,
  email,
  accessLevel
}: {
  projectId: number;
  email: string;
  accessLevel: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: AddProjectCollaboratorDocument,
      variables: { projectId, email, accessLevel },
      dataPath: "addProjectCollaborator"
    });

  } catch (error) {
    logger.error(`[Add Project Collaborator Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}