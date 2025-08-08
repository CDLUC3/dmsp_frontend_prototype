'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text,
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from '@/components/Container';
import TemplateList from '@/components/TemplateList';
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import ErrorMessages from '@/components/ErrorMessages';
import { CheckboxGroupComponent } from '@/components/Form';
import Pagination from '@/components/Pagination';

// GraphQL
import {
  useAddPlanMutation,
  useProjectFundingsQuery,
  usePublishedTemplatesLazyQuery
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import logECS from '@/utils/clientLogger';
import { filterTemplates } from '@/utils/filterTemplates';
import { TemplateItemProps } from '@/app/types';
import { useFormatDate } from '@/hooks/useFormatDate';

const LIMIT = 10;

interface ProjectFundersInterface {
  name: string;
  uri: string;
}

interface PublicTemplatesInterface {
  bestPractice?: boolean | null;
  id?: number | null;
  name?: string | null;
  description?: string | null;
  modified?: string | null;
  modifiedByName?: string | null;
  modifiedById?: number | null;
  visibility?: string | null;
  ownerDisplayName?: string | null;
  ownerURI?: string | null;
}

interface Affiliation {
  __typename: "Affiliation";
  displayName: string;
  uri: string;
}

interface ProjectFunding {
  __typename: "ProjectFunding";
  id: number;
  status: string; // or use a union type like "PLANNED" | "ACTIVE" | "COMPLETED" if you know the possible values
  grantId: string | null;
  funderOpportunityNumber: string;
  funderProjectNumber: string | null;
  affiliation: Affiliation;
}

const PlanCreate: React.FC = () => {
  const formatDate = useFormatDate();
  const { scrollToTop } = useScrollToTop();
  const params = useParams();
  const router = useRouter();

  // Get projectId from the URL
  const { projectId } = params;

  // Set refs for Load More button and error messages
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  //states
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [bestPractice, setBestPractice] = useState<boolean>(false);
  const [selectedOwnerURIs, setSelectedOwnerURIs] = useState<string[]>([]);
  const [hasBestPractice, setHasBestPractice] = useState<boolean>(false);
  const [selectedFunders, setSelectedFunders] = useState<string[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<TemplateItemProps[] | null>([])
  const [funders, setFunders] = useState<ProjectFundersInterface[]>([]);
  const [uniqueAffiliations, setUniqueAffiliations] = useState<string[]>([]);
  const [bestPracticeTemplates, setBestPracticeTemplates] = useState<TemplateItemProps[]>([]);
  const [selectedFilterItems, setSelectedFilterItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean | null>(false);

  // Localization keys
  const PlanCreate = useTranslations('PlanCreate');
  const Global = useTranslations('Global');


  // Published templates lazy query
  const [fetchPublishedTemplates, { data: publishedTemplates }] = usePublishedTemplatesLazyQuery();

  // Get Project Funders data
  const { data: projectFundings, loading: projectFundingsLoading, error: projectFundingsError } = useProjectFundingsQuery({
    variables: { projectId: Number(projectId) },
  });


  // Initialize the addPlan mutation
  const [addPlanMutation] = useAddPlanMutation({
    notifyOnNetworkStatusChange: true,
  });


  const clearErrors = () => {
    setErrors([])
  }


  // Transform the templates data into more useable format
  const transformTemplates = async (templates: (PublicTemplatesInterface | null)[]) => {
    const transformedTemplates = await Promise.all(
      templates.map(async (template: PublicTemplatesInterface | null) => ({
        id: template?.id,
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.id ? template.id : ''}`,
        content: template?.description || template?.modified ? (
          <div>
            <p>{template?.description}</p>
            <p>
              {Global('lastUpdated')}: {template?.modified ? formatDate(template?.modified) : null}
            </p>
          </div>
        ) : null,
        funder: template?.ownerDisplayName || "",
        funderUri: template?.ownerURI || "",
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedByName || null,
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.visibility,
        bestPractices: template?.bestPractice || false,
        publishStatus: Global('published') // All publishedTemplates returned are marked as 'Published'
      }))
    );
    return transformedTemplates;
  };

  // Handle search input
  const handleSearchInput = async (value: string) => {
    setSearchTerm(value);
    if (value.length === 0) {
      setSearchButtonClicked(false);
      await fetchTemplates({ page: currentPage, bestPractice, selectedOwnerURIs })
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = async (value: string[], type: string) => {
    // Mark that user has interacted with checkboxes
    setUserHasInteracted(true);

    setSelectedFilterItems(value);
    let filteredList: TemplateItemProps[] | null = null;

    // Determine which templates to show based on selected filters

    if (value.length === 0) {
      setSelectedOwnerURIs([]);
      setBestPractice(false);
      // Default to all templates when no criteria selected
      await fetchTemplates({ page: currentPage });

    } else if (type === 'funders') {
      // Always dispatch selected filter items (whether empty or not)
      setSelectedFunders(value);
      setSelectedOwnerURIs(value);
      setBestPractice(false);
      // Fetch templates for selected funders
      await fetchTemplates({ selectedOwnerURIs: value });
    } else if (type === 'bestPractice') {
      setSelectedOwnerURIs([]);
      setBestPractice(true);
      // Fetch best practice templates
      await fetchTemplates({ bestPractice: true, selectedOwnerURIs: [] });
    }
  };

  const handlePageClick = async (page: number) => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
    }

    await fetchTemplates({
      page,
      bestPractice,
      selectedOwnerURIs,
      searchTerm
    });
  };


  const handleFiltering = async (term: string) => {
    setErrors([]);
    setSearchButtonClicked(true);
    setSearchTerm(term);

    await fetchTemplates({ searchTerm: term })
  };

  // When user selects a template, we create a plan and redirect
  const onSelect = async (versionedTemplateId: number) => {
    let newPlanId;
    //Add the new plan
    try {
      const response = await addPlanMutation({
        variables: {
          projectId: Number(projectId),
          versionedTemplateId
        },
      });
      if (response?.data) {
        clearErrors();
        // Get plan id of new plan so we know where to redirect
        newPlanId = response?.data?.addPlan?.id;
      }
    } catch (err) {
      logECS('error', 'handleClick', {
        error: err,
        url: { path: '/template/create' }
      });
      setErrors([(err as Error).message])
    }

    // Redirect to the newly created plan
    if (newPlanId) {
      router.push(`/projects/${projectId}/dmp/${newPlanId}`)
    }
  }

  const fetchTemplates = async ({
    page,
    bestPractice = false,
    selectedOwnerURIs = [],
    searchTerm = ''
  }: {
    page?: number;
    bestPractice?: boolean;
    selectedOwnerURIs?: string[];
    searchTerm?: string;
  }): Promise<void> => {
    let offsetLimit = 0;
    if (page) {
      setCurrentPage(page);
      offsetLimit = (page - 1) * LIMIT;
    }

    await fetchPublishedTemplates({
      variables: {
        paginationOptions: {
          offset: offsetLimit,
          limit: LIMIT,
          type: "OFFSET",
          sortDir: "DESC",
          includeMetadata: true,
          selectOwnerURIs: selectedOwnerURIs,
          bestPractice: bestPractice
        },
        term: searchTerm,
      }
    });
  };

  // Load published templates
  useEffect(() => {
    const callFetchTemplates = async () => {
      await fetchTemplates({ page: currentPage });
    }

    callFetchTemplates();
  }, []);

  useEffect(() => {
    const processTemplates = async () => {
      const affiliations = publishedTemplates?.publishedTemplates?.availableAffiliations?.filter(
        (affiliation): affiliation is string => affiliation !== null
      ) || [];

      const hasBestPractice = publishedTemplates?.publishedTemplates?.hasBestPracticeTemplates ?? false;
      if (publishedTemplates && publishedTemplates?.publishedTemplates && publishedTemplates?.publishedTemplates?.items) {
        const publicTemplates = await transformTemplates(publishedTemplates?.publishedTemplates?.items);
        setPublicTemplatesList(publicTemplates);
        const totalCount = publishedTemplates?.publishedTemplates?.totalCount ? publishedTemplates?.publishedTemplates?.totalCount : 0;
        // Calculate total pages based on total records and records per page
        const totalPages = Math.ceil(totalCount / LIMIT);
        setTotalPages(totalPages);
        setHasNextPage(publishedTemplates?.publishedTemplates?.hasNextPage ? publishedTemplates?.publishedTemplates?.hasNextPage : false);
        setHasPreviousPage(publishedTemplates?.publishedTemplates?.hasPreviousPage ? publishedTemplates?.publishedTemplates?.hasPreviousPage : false);
        setUniqueAffiliations(affiliations);
        setHasBestPractice(hasBestPractice);
      }
    };
    processTemplates();
  }, [publishedTemplates, projectFundings]);


  useEffect(() => {
    const processMatchingFunders = async () => {
      if (projectFundings?.projectFundings && uniqueAffiliations.length > 0 && funders.length === 0) {
        const matchingAffiliations = projectFundings.projectFundings.filter(item =>
          item && item.affiliation && uniqueAffiliations.includes(item.affiliation.uri)
        );

        if (matchingAffiliations.length > 0) {
          const fundersData = matchingAffiliations
            .map(funder => ({
              name: funder?.affiliation?.displayName ?? null,
              uri: funder?.affiliation?.uri ?? null,
            }))
            .filter((funder): funder is { name: string; uri: string } => funder.name !== null);

          const funderURIs = fundersData.map(funder => funder.uri);
          setFunders(fundersData);
          setSelectedFunders(funderURIs);
          await fetchTemplates({ selectedOwnerURIs: funderURIs });
        }
      }
    }
    processMatchingFunders();
  }, [projectFundings, uniqueAffiliations, funders.length]);

  useEffect(() => {
    const setSelectedItems = async () => {
      // On page load, initially check the checkboxes for either project funders or best practice templates
      if (funders.length === 0 && hasBestPractice) {
        setSelectedFilterItems(["DMP Best Practice"]); // Set to best practice value
        setBestPractice(true);
        setSelectedOwnerURIs([]);
        await fetchTemplates({ bestPractice: true });

      } else {
        // Set selected funders by their uri
        const funderURIs = funders.map(funder => funder.uri);
        setSelectedFunders(funderURIs);
        setBestPractice(false);
        setSelectedOwnerURIs(funderURIs);
      }
    }
    if (!userHasInteracted) {
      setSelectedItems();
    }

  }, [funders, publicTemplatesList]);



  return (
    <>
      <PageHeader
        title={PlanCreate('title')}
        description={PlanCreate('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}`}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{PlanCreate('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={<></>}
        className="page-template-list"
      />
      <ErrorMessages errors={errors} ref={errorRef} />
      <LayoutContainer>
        <ContentContainer className={"layout-content-container-full"}>
          <div className="searchSection" role="search">
            <SearchField aria-label="Template search">
              <Label>{Global('labels.searchByKeyword')}</Label>
              <Text slot="description" className="help">
                {Global('helpText.searchHelpText')}
              </Text>
              <Input
                aria-describedby="search-help"
                value={searchTerm}
                onChange={e => handleSearchInput(e.target.value)}
              />
              <Button
                onPress={() => handleFiltering(searchTerm)}
              >{Global('buttons.search')}</Button>
              <FieldError />
            </SearchField>

            {/**Only show filters if there are funders. If no funders, then show best practice filter if the results include them  */}

            {funders.length > 0 && (
              <CheckboxGroupComponent
                name="funders"
                value={selectedFunders}
                onChange={(value) => handleCheckboxChange(value, 'funders')}
                checkboxGroupLabel={PlanCreate('checkbox.filterByFunderLabel')}
                checkboxGroupDescription={PlanCreate('checkbox.filterByFunderDescription')}
                checkboxData={funders.map(funder => ({
                  label: funder.name,
                  value: funder.uri,
                }))}
              />
            )}

            {funders.length === 0 && hasBestPractice && (
              <CheckboxGroupComponent
                name="bestPractices"
                value={selectedFilterItems}
                onChange={(value) => handleCheckboxChange(value, 'bestPractice')}
                checkboxGroupLabel={PlanCreate('checkbox.filterByBestPracticesLabel')}
                checkboxGroupDescription={PlanCreate('checkbox.filterByBestPracticesDescription')}
                checkboxData={[{
                  label: PlanCreate('labels.dmpBestPractice'),
                  value: "DMP Best Practice",
                }]}
              />
            )}

          </div>

          {publicTemplatesList?.length > 0 && (
            <>
              {/**Only display pagination if there is more than one page */}
              {publicTemplatesList?.length && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  handlePageClick={handlePageClick}
                />
              )}

              <section className="mb-8" aria-labelledby="public-templates">
                <div className="template-list" role="list" aria-label="Public templates">

                  <TemplateList
                    key={publicTemplatesList.length}
                    templates={publicTemplatesList}
                    onSelect={onSelect}
                  />

                </div>
              </section>
              {/**Only display pagination if there is more than one page */}
              {publicTemplatesList?.length && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasPreviousPage={hasPreviousPage}
                  hasNextPage={hasNextPage}
                  handlePageClick={handlePageClick}
                />)}

            </>
          )}

        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default PlanCreate;
