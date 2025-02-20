'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';

// Components
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import ProjectListItem from "@/components/ProjectListItem";
import {
  ContentContainer,
  LayoutContainer
} from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';

//GraphQL
import { useMyProjectsQuery, } from '@/generated/graphql';

import { ProjectItemProps } from '@/app/types';

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


const ProjectsListPage: React.FC = () => {
  const formatter = useFormatter();
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [projects, setProjects] = useState<(ProjectItemProps)[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<(ProjectItemProps)[] | null>([]);

  // Translation keys
  const Global = useTranslations('Global');
  const Project = useTranslations('ProjectsListPage');

  // Query for projects
  const { data = {}, loading, errors: projectsQueryError } = useMyProjectsQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  /* Filter results when a user enters a search term and clicks "Search" button.
  Searches through title, content, description, and collaborator fields*/
  const handleFiltering = (term: string) => {
    setSearchButtonClicked(true);
    setErrors([]);

    const lowerCaseTerm = term.toLowerCase();

    const filteredList = projects.filter(proj =>
      [
        proj.title,
        proj.description,
        // Ensure all collaborator fields (name, orcid, roles) are included in the search
        proj.collaborators
          .map(collab =>
            [
              collab.name.toLowerCase(),
              collab.orcid?.toLowerCase() || "",
              collab.roles.join(" ").toLowerCase() // Convert roles array to a string
            ].join(" ")
          )
          .join(" ") // Join all collaborators into one searchable string
      ]
        .filter(Boolean) // Remove any undefined/null values
        .some(field => field?.toLowerCase().includes(lowerCaseTerm))
    );

    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredProjects(filteredList);
    }
  };

  const formatDate = (date: string | number) => {
    const parsedDate = typeof date === "number"
      ? new Date(date)
      : new Date(date.replace(/-/g, "/")); // Replace dashes with slashes for compatibility

    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date"; // Handle invalid input gracefully
    }

    return formatter.dateTime(parsedDate, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  useEffect(() => {
    // Transform projects into format expected by ProjectListItem component
    if (data && data?.myProjects) {
      const fetchAllProjects = async (projects: (ProjectInterface | null)[]) => {
        const transformedProjects = await Promise.all(
          projects.map(async (project: ProjectInterface | null) => {
            return {
              title: project?.title || "",
              link: `/projects/${project?.id}`,
              funder: (project?.funders && project?.funders[0]?.affiliation?.name) ?? '',
              defaultExpanded: false,
              startDate: project?.startDate ? formatDate(project.startDate) : '',
              endDate: project?.endDate ? formatDate(project.endDate) : '',
              collaborators: project?.contributors ? project.contributors.map((contributor) => {
                return {
                  name: `${contributor.givenName} ${contributor.surName}`,
                  roles: contributor.contributorRoles ? contributor.contributorRoles.map((role) => role.label) : [],
                  orcid: contributor.orcid
                }
              }) : [],
              grantId: project?.grantId,

            }
          }));

        setProjects(transformedProjects);
      }
      fetchAllProjects(data?.myProjects ? data.myProjects : []);
    }
  }, [data]);

  useEffect(() => {
    // Need this to set list of projects back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredProjects(null);
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  // If page-level errors, scroll them into view
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);

  useEffect(() => {
    if (projectsQueryError) {
      setErrors([Global('messaging.somethingWentWrong')]);
    } else if (data?.myProjects?.some((project) => project?.errors)) {
      setErrors([Project('messages.errors.errorRetrievingProjects')]);
    } else {
      setErrors([]);
    }
  }, [data, projectsQueryError]);

  // TODO: Implement shared loading spinner
  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <PageHeader
        title={Global('breadcrumbs.projects')}
        description={Project('intro')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link href="/projects/create-project"
              className={"button-link button--primary"}>{Project('buttons.createProject')}</Link>
          </>
        }
        className="page-project-list"
      />

      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutContainer>
        <ContentContainer>
          <div className="Filters">
            <SearchField
              onClear={() => { setFilteredProjects(null) }}
            >
              <Label>{Global('labels.searchByKeyword')}</Label>
              <Input value={searchTerm} onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  // Call your filtering function without changing the input value
                  handleFiltering(searchTerm);
                }}
              >
                {Global('buttons.search')}
              </Button>
              <FieldError />
              <Text slot="description" className="help">
                {Global('helpText.searchHelpText')}
              </Text>
            </SearchField>
          </div>


          {filteredProjects && filteredProjects.length > 0 ? (
            <div className="template-list" aria-label="Template list" role="list">
              {
                filteredProjects.map((project, index) => (
                  <ProjectListItem
                    key={index}
                    item={project} />
                ))
              }
            </div>
          ) : (
            <>
              <div className="template-list" aria-label="Template list" role="list">
                {(searchTerm.length > 0 && searchButtonClicked) ? (
                  <>
                    <p>{Global('messaging.noItemsFound')}</p>
                  </>
                ) : (
                  <>
                    {
                      projects.map((project, index) => (
                        <ProjectListItem
                          key={index}
                          item={project} />
                      ))
                    }
                  </>
                )
                }
              </div>
            </>
          )
          }


        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default ProjectsListPage;
