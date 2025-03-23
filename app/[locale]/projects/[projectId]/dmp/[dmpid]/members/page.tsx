import { Suspense } from "react";
import { redirect } from 'next/navigation';
import {
  ProjectContributor,
  ProjectContributorsDocument,
  ProjectContributorsQuery,
  PlanContributorsDocument,
  PlanContributorsQuery,
  PlanContributor
} from '@/generated/graphql';
import { formatProjectContributors } from './utils';
import PlanMembersClientComponent from './PlanMembersClientComponent';
import { executeGraphQLQuery } from '@/utils/serverGraphQLHandler';

interface RolesInterface {
  id: number | null;
  label: string;
}
interface initialProjectContributorsInterface {
  id: number | null;
  fullName: string;
  affiliation: string;
  orcid: string;
  isPrimaryContact: boolean;
  roles: RolesInterface[];
}

interface AffiliationInterface {
  displayName: string;
}

interface ContributorRoles {
  description: string;
  id: number | null;
  label: string;
}
interface ProjectContributorInterface {
  givenName: string;
  surName: string;
  id: number | null;
  orcid: string;
  affiliation: AffiliationInterface;
  contributorRoles: ContributorRoles[];
}

type ProjectContributorsArray = (ProjectContributor | null)[];

export default async function ProjectsPage({ params }: { params: { projectId: string, dmpid: string } }) {
  const projectId = params.projectId;
  const planId = params.dmpid;

  // Extract the query strings from the gql document
  const queryStringProjectContributors = ProjectContributorsDocument.loc?.source.body;
  const queryStringPlanContributors = PlanContributorsDocument.loc?.source.body;

  if (!queryStringProjectContributors) {
    return (
      <PlanMembersClientComponent
        originalProjectContributors={[]}
        initialProjectContributors={[]}
        initialPlanContributors={[]}
        initialErrors={["Could not extract query string from document"]}
      />
    );
  }

  if (!queryStringPlanContributors) {
    return (
      <PlanMembersClientComponent
        originalProjectContributors={[]}
        initialProjectContributors={[]}
        initialPlanContributors={[]}
        initialErrors={["Could not extract query string from document"]}
      />
    );
  }

  // You can add any additional custom headers if needed
  const additionalHeaders = {
    // Add any custom headers here if needed
  };

  // Use the executeGraphQLQuery function with error handling to make graphql requests
  const resultProjectContributors: { data?: ProjectContributorsQuery; errors?: string[]; redirect?: string } =
    await executeGraphQLQuery(queryStringProjectContributors, { projectId: Number(projectId) }, { additionalHeaders });


  console.log("***RESULTS***", resultProjectContributors);
  if ('redirect' in resultProjectContributors && resultProjectContributors.redirect) {
    // Use the Next.js redirect function
    redirect(resultProjectContributors.redirect);
  }

  const resultPlanContributors: { data?: PlanContributorsQuery; errors?: string[]; redirect?: string } =
    await executeGraphQLQuery(queryStringPlanContributors, { planId: Number(planId) }, { additionalHeaders });

  if ('redirect' in resultPlanContributors && resultPlanContributors.redirect) {
    // Use the Next.js redirect function
    redirect(resultPlanContributors.redirect);
  }

  const { data, errors } = resultProjectContributors;

  const { data: planContributorsData, errors: planContributorsErrors } = resultPlanContributors;

  if (errors || planContributorsErrors) {
    return (
      <PlanMembersClientComponent
        originalProjectContributors={[]}
        initialProjectContributors={[]}
        initialPlanContributors={[]}
        initialErrors={[...(errors || []), ...(planContributorsErrors || [])]}
      />
    );
  }

  const initialProjectContributors = formatProjectContributors(
    (data?.projectContributors as ProjectContributorsArray) || [],
    planContributorsData?.planContributors || []
  );

  const initialPlanContributors = (planContributorsData?.planContributors || [])
    .filter((contributor): contributor is PlanContributor => contributor !== null);

  const originalProjectContributors = data?.projectContributors || []; // Already a ProjectContributorsArray


  return (
    <Suspense fallback={<p>Loading data...</p>}>
      <PlanMembersClientComponent
        originalProjectContributors={originalProjectContributors as ProjectContributorsArray}
        initialProjectContributors={initialProjectContributors}
        initialPlanContributors={initialPlanContributors}
        initialErrors={[]}
      />
    </Suspense>
  );
}