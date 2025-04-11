"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { AddProjectContributorResponse } from "@/app/types";
import { AddProjectContributorDocument, AddProjectContributorInput } from "@/generated/graphql";

export async function addProjectMemberAction({
  input
}: {
  input: AddProjectContributorInput
}): Promise<AddProjectContributorResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: AddProjectContributorDocument,
      variables: { input },
      dataPath: "addProjectContributor"
    });

  } catch (error) {
    logger.error(`[Add Project Contributor Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}