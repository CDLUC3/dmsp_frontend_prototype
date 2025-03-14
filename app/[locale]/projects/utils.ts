interface ContributorRolesInterface {
  id?: number | null;
  label: string;
}

interface FundersInterface {
  affiliation?: {
    name: string;
    uri: string;
  } | null;
}

interface ContributorsInterface {
  givenName?: string | null;
  surName?: string | null;
  contributorRoles?: ContributorRolesInterface[] | null;
  orcid?: string | null;
}
interface ProjectInterface {
  title: string;
  id?: number | null;
  contributors?: ContributorsInterface[] | null;
  startDate?: string | null;
  endDate?: string | null;
  funders?: FundersInterface[] | null;
  modified?: string | null;
  modifiedById?: number | null;
  created?: string | null;
  createdById?: number | null;
  grantId?: string | null;
}

function formatDateForServer(date: string | number) {
  const parsedDate = typeof date === "number"
    ? new Date(date)
    : new Date(date.replace(/-/g, "/"));

  if (isNaN(parsedDate.getTime())) {
    return "Invalid Date";
  }

  // Simple date formatting (or you could use Intl.DateTimeFormat)
  return parsedDate.toLocaleDateString('en-US', {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatProjects(projects: (ProjectInterface | null)[]) {
  return projects.map((project: ProjectInterface | null) => {
    return {
      title: project?.title || "",
      link: `/projects/${project?.id}`,
      funder: (project?.funders && project?.funders[0]?.affiliation?.name) ?? '',
      defaultExpanded: false,
      startDate: project?.startDate ? formatDateForServer(project.startDate) : '',
      endDate: project?.endDate ? formatDateForServer(project.endDate) : '',
      collaborators: project?.contributors ? project.contributors.map((contributor) => {
        return {
          name: `${contributor.givenName} ${contributor.surName}`,
          roles: contributor.contributorRoles ? contributor.contributorRoles.map((role) => role.label) : [],
          orcid: contributor.orcid
        }
      }) : [],
      grantId: project?.grantId,
    };
  });
}