"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpsertRelatedWorkDocument, RelatedWorkStatus } from "@/generated/graphql";

export async function upsertRelatedWorkAction({ planId, doi, hash, status }: { planId: number; doi: string; hash: string, status: RelatedWorkStatus }): Promise<ActionResponse> {
  return await executeGraphQLMutation({
    document: UpsertRelatedWorkDocument,
    variables: { input: { planId, doi, hash, status } },
    dataPath: "upsertRelatedWork",
  });
}
