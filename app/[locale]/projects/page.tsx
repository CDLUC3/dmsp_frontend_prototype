'use client';

import {useEffect, useRef, useState} from 'react';
import {useFormatter, useTranslations} from 'next-intl';

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
import {ContentContainer, LayoutContainer} from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';

//GraphQL
import {useMyProjectsQuery,} from '@/generated/graphql';

import {ProjectItemProps, ProjectSearchResultInterface} from '@/app/types';
import LoadMoreButton from '@/components/LoadMoreButton';

const ProjectsListPage: React.FC = () => {
  const PAGINATION_LIMIT = 2;

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

  const [visibleCount, setVisibleCount] = useState({
    projects: PAGINATION_LIMIT,
    filteredProjects: PAGINATION_LIMIT,
  });

  // Query for projects
  const { data = {}, loading, fetchMore } = useMyProjectsQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: PAGINATION_LIMIT,
    },
  });

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  /* Filter results when a user enters a search term and clicks "Search" button.
  Searches through title, content, description, and member fields*/
  const handleFiltering = (term: string) => {
    setSearchButtonClicked(true);
    setErrors([]);

    const lowerCaseTerm = term.toLowerCase();

    const filteredList = projects.filter(proj =>
      [
        proj.title,
        proj.description,
        // Ensure all member fields (name, orcid, roles) are included in the search
        proj.members
          .map(member =>
            [
              member.name.toLowerCase(),
              member.orcid?.toLowerCase() || "",
              member.roles.split(",").map(role => role.toLowerCase()).join(" ")
            ].join(" ")
          )
          .join(" ") // Join all members into one searchable string
      ]
        .filter(Boolean) // Remove any undefined/null values
        .some(field => field?.toLowerCase().includes(lowerCaseTerm))
    );

    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredProjects(filteredList);
    }
  };

  type VisibleCountKeys = keyof typeof visibleCount;
  // When user clicks the 'Load more' button, display 3 more by default
  const handleLoadMore = (listKey: VisibleCountKeys) => {
    fetchMore({
      variables: {
        cursor: data.myProjects?.cursor,
        limit: PAGINATION_LIMIT,
      },
    });

    setVisibleCount(prev => ({
      ...prev,
      [listKey]: prev[listKey] + PAGINATION_LIMIT,
    }));
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
      const feed = Array.isArray(data.myProjects?.feed) ? data.myProjects.feed : [];

      const fetchAllProjects = async (feed: (ProjectSearchResultInterface | null)[]) => {
        const transformedProjects = await Promise.all(
          feed.map(async (project: ProjectSearchResultInterface | null) => {
            return {
              title: project?.title || "",
              link: `/projects/${project?.id}`,
              funder: project?.funders ? project?.funders.map((fund) => fund?.name).join(', ') : '',
              defaultExpanded: false,
              startDate: project?.startDate ? formatDate(project.startDate) : '',
              endDate: project?.endDate ? formatDate(project.endDate) : '',
              members: (project?.contributors ? project.contributors.map((contributor) => {
                return {
                  name: contributor.name || '',
                  roles: contributor.role || '',
                  orcid: contributor.orcid || ''
                }
              }) : []),
              grantId: project?.funders ? project?.funders.map((fund) => fund?.grantId).join(', ') : '',
            }
          }));
        setProjects(prevProjects => [...prevProjects, ...transformedProjects]);
      }
      fetchAllProjects(feed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (data?.myProjects?.feed) {
      const projectErrors = data.myProjects.feed
        .filter((project) => project?.errors?.general || project?.errors?.title)
        .map((project) => project?.errors?.general || Project('messages.errors.errorRetrievingProjects'));

      if (projectErrors.length > 0) {
        setErrors(projectErrors);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
            <Breadcrumb>{Global('breadcrumbs.projects')}</Breadcrumb>
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
              <LoadMoreButton
                paginableFeed={data.myProjects || undefined}
                pageSize={PAGINATION_LIMIT}
                onPress={() => {
                  handleLoadMore('filteredProjects');
                }}/>
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

                    <LoadMoreButton
                      paginableFeed={data.myProjects || undefined}
                      pageSize={PAGINATION_LIMIT}
                      onPress={() => {
                        handleLoadMore('projects');
                      }}/>
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
