
import {
  ProjectContributor,
  PlanContributor,
} from '@/generated/graphql';

export function formatProjectContributors(
  projectContributors: (ProjectContributor | null)[],
  planContributors: (PlanContributor | null)[]
) {
  // Create a function to check primary contact status
  const isPrimaryContact = (contributor: ProjectContributor | null) => {
    if (!planContributors || planContributors.length === 0) {
      return false;
    }

    // Find the primary contact ID from planContributors
    const primaryContactId = planContributors
      .find((planContributor) => planContributor?.isPrimaryContact)
      ?.projectContributor?.id;

    console.log("PRIMARY CONTACT CHANGE", primaryContactId, contributor?.id, contributor);
    // Check if the given contributor matches the primary contact ID
    return primaryContactId === contributor?.id;
  };

  return projectContributors
    .filter((contributor): contributor is ProjectContributor =>
      contributor !== null && contributor !== undefined)
    .map((contributor) => ({
      id: contributor.id ?? null,
      fullName: `${contributor.givenName ?? ''} ${contributor.surName ?? ''}`.trim(),
      affiliation: contributor.affiliation?.displayName ?? '',
      orcid: contributor.orcid ?? '',
      isPrimaryContact: isPrimaryContact(contributor),
      roles: (contributor.contributorRoles && contributor.contributorRoles.length > 0)
        ? contributor.contributorRoles.map((role) => ({
          id: role.id ?? null,
          label: role.label ?? '',
        }))
        : [],
    }));
}