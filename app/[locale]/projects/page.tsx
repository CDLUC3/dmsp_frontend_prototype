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
  contributorRoles?: ContributorRolesInterface[] | null; // Allow undefined or null
  orcid?: string | null;
}
interface ProjectInterface {
  title: string;
  id?: number | null;
  contributors?: ContributorsInterface[] | null; // Allow undefined or null
  startDate?: string | null;
  endDate?: string | null;
  funders?: FundersInterface[] | null; // Allow undefined or null
  modified?: string | null;
  modifiedById?: number | null;
  created?: string | null;
  createdById?: number | null;
}


const ProjectsListPage: React.FC = () => {
  const formatter = useFormatter();

  const [projects, setProjects] = useState<(ProjectItemProps)[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<(ProjectItemProps)[] | null>([]);

  const errorRef = useRef<HTMLDivElement | null>(null);

  // Query for projects
  const { data = {}, loading, error: queryError, refetch } = useMyProjectsQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });

  console.log("***DATA", data);


  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setSearchButtonClicked(true);
    setErrors([]);
    const filteredList = projects.filter(item =>
      item.title.toLowerCase().includes(term.toLowerCase())
    );
    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredProjects(filteredList);
    }
  }

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
    // Transform projects into format expected by TemplateListItem component
    if (data && data?.myProjects) {
      const fetchAllProjects = async (projects: (ProjectInterface | null)[]) => {
        const transformedProjects = await Promise.all(
          projects.map(async (project: ProjectInterface | null) => {
            return {
              title: project?.title || "",
              link: `/projects/${project?.id}`,
              content: (
                <div>
                  <p>National Science Foundation (nsf.gov)</p>
                  <p>Last updated: 04-01-2024</p>
                </div>
              ),
              funder: (project?.funders && project?.funders[0]?.affiliation?.name) ?? '',
              lastUpdated: (project?.modified) ? formatDate(project?.modified) : null,
              publishStatus: 'Published',
              defaultExpanded: false,
              startDate: project?.startDate ? formatDate(project.startDate) : '',
              endDate: project?.endDate ? formatDate(project.endDate) : '',
              collaborators: project?.contributors ? project.contributors.map((contributor) => {
                return {
                  name: `${contributor.givenName} ${contributor.surName}`,
                  roles: contributor.contributorRoles ? contributor.contributorRoles.map((role) => role.label) : [],
                  orcid: contributor.orcid
                }
              }) : []
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

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manager or create DMSP project or by DMP"
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link href="/projects/create-project"
              className={"button-link button--primary"}>Create
              Project</Link>
          </>
        }
        className="page-project-list"
      />

      {errors && errors.length > 0 &&
        <div className="error" ref={errorRef}>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      }

      <LayoutContainer>
        <ContentContainer>
          <div className="Filters">
            <SearchField
              onClear={() => { setFilteredProjects(null) }}
            >
              <Label>Search by keyword</Label>
              <Input value={searchTerm} onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  // Call your filtering function without changing the input value
                  handleFiltering(searchTerm);
                }}
              >
                Search
              </Button>
              <FieldError />
              <Text slot="description" className="help">
                Search by research organization, field station or lab, template description, etc.
              </Text>
            </SearchField>
          </div>


          <div className="template-list" aria-label="Template list" role="list">
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
                      <p>No items found</p>
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
          </div>

        </ContentContainer>
      </LayoutContainer>


    </>
  );
}

export default ProjectsListPage;
