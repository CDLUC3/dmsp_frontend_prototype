"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { addRepositoryActionResponse } from "@/app/types";
import { AddRepositoryDocument } from "@/generated/graphql";

export async function addRepositoryAction({
  name,
  description,
  website
}: {
  name: string;
  description: string;
  website: string;
}): Promise<addRepositoryActionResponse> {
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