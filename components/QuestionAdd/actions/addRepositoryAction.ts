"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { AddRepositoryDocument } from "@/generated/graphql";

export async function addRepositoryAction({
  name,
  description,
  website
}: {
  name: string;
  description: string;
  website: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddRepositoryDocument,
    variables: {
      input: {
        name,
        description,
        website,
      }
    },
    dataPath: "addRepository"
  });
}