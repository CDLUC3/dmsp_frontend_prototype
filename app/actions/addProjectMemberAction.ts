"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { AddProjectMemberResponse } from "@/app/types";
import { AddProjectMemberDocument, MemberRole } from "@/generated/graphql";

export async function addProjectMemberAction({
  projectId,
  givenName,
  surName,
  email,
  orcid,
  affiliationId,
  memberRoleIds
}: {
  projectId: number;
  givenName: string;
  surName: string;
  email: string;
  orcid: string;
  affiliationId: string;
  memberRoleIds?: number[] | MemberRole[] | null;
}): Promise<AddProjectMemberResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddProjectMemberDocument,
    variables: {
      input: {
        projectId,
        givenName,
        surName,
        email,
        orcid,
        affiliationId,
        memberRoleIds
      }
    },
    dataPath: "addProjectMember"
  });
}