"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { AddMetadataStandardInputDocument } from "@/generated/graphql";

export async function addMetaDataStandardsAction({
  name,
  description,
  uri,
}: {
  name: string;
  description: string;
  uri: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddMetadataStandardInputDocument,
    variables: {
      input: {
        name,
        description,
        uri,
      }
    },
    dataPath: "addMetadataStandard"
  });
}