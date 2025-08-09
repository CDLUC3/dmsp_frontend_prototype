'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import ErrorMessages from '@/components/ErrorMessages';
import { CheckboxGroupComponent } from '@/components/Form';
import Pagination from '@/components/Pagination';

// GraphQL
import {
  useAddPlanMutation,
  useProjectFundingsQuery,
  usePublishedTemplatesLazyQuery
} from '@/generated/graphql';

// Other
import { scrollToTop } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';
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

const PlanCreate: React.FC = () => {
  const formatDate = useFormatDate();
  const params = useParams();
  const router = useRouter();

  // Get projectId from the URL
  const projectId = String(params.projectId);

  // Set ref for error messages
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Scrolling to top
  const topRef = useRef<HTMLDivElement>(null);

  //states
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [bestPractice, setBestPractice] = useState<boolean>(false);
  const [selectedOwnerURIs, setSelectedOwnerURIs] = useState<string[]>([]);
  const [hasBestPractice, setHasBestPractice] = useState<boolean>(false);
  const [selectedFunders, setSelectedFunders] = useState<string[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [funders, setFunders] = useState<ProjectFundersInterface[]>([]);
  const [uniqueAffiliations, setUniqueAffiliations] = useState<string[]>([]);
  const [selectedFilterItems, setSelectedFilterItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean | null>(false);
  const [initialSelectionApplied, setInitialSelectionApplied] = useState(false);

  // Localization keys
  const PlanCreate = useTranslations('PlanCreate');
  const Global = useTranslations('Global');


  // Published templates lazy query
  const [fetchPublishedTemplates, { data: publishedTemplates, loading }] = usePublishedTemplatesLazyQuery();

  // Get Project Funders data
  const { data: projectFundings, loading: projectFundingsLoading, error: projectFundingsError } = useProjectFundingsQuery({
    variables: { projectId: Number(projectId) },
  });


  // Initialize the addPlan mutation
  const [addPlanMutation] = useAddPlanMutation({
    notifyOnNetworkStatusChange: true,
  });


  const resetSearch = useCallback(() => {
    setSearchTerm('');
    handleSearchInput('');
    scrollToTop(topRef);
  }, [scrollToTop]);

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
      await fetchTemplates({ page: currentPage, bestPractice, selectedOwnerURIs })
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = async (value: string[], type: string) => {
    // Mark that user has interacted with checkboxes
    setUserHasInteracted(true);

    // Reset the search field back to empty
    setSearchTerm('');

    // Determine which templates to show based on selected filters
    if (value.length === 0) {
      setSelectedOwnerURIs([]);
      setBestPractice(false);
      setSelectedFunders([]);
      setSelectedFilterItems([]);
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
      setSelectedFilterItems(value);
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
    setSearchTerm(term);

    // Reset to first page on new search
    setCurrentPage(1);

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
        url: {
          path: routePath('projects.dmp.create')
        }
      });
      setErrors([(err as Error).message])
    }

    // Redirect to the newly created plan
    if (newPlanId) {
      router.push(routePath('projects.dmp.show', { projectId, dmpId: newPlanId }));
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
      }
    };
    processTemplates();
  }, [publishedTemplates, projectFundings]);

  useEffect(() => {
    // Wait until both GraphQL queries finish
    if (loading || projectFundingsLoading) return;
    if (userHasInteracted || initialSelectionApplied) return;

    const hasBestPractice =
      publishedTemplates?.publishedTemplates?.hasBestPracticeTemplates ?? false;
    setHasBestPractice(hasBestPractice);

    // Get matching funders directly from `projectFundings` + `uniqueAffiliations`
    let fundersData: { name: string; uri: string }[] = [];
    let funderURIs: string[] = [];

    if (projectFundings?.projectFundings && uniqueAffiliations.length > 0) {
      const matchingAffiliations = projectFundings.projectFundings.filter(
        (item) =>
          item?.affiliation &&
          uniqueAffiliations.includes(item.affiliation.uri)
      );

      if (matchingAffiliations.length > 0) {
        fundersData = matchingAffiliations
          .map((funder) => ({
            name: funder?.affiliation?.displayName ?? null,
            uri: funder?.affiliation?.uri ?? null,
          }))
          .filter(
            (funder): funder is { name: string; uri: string } =>
              funder.name !== null
          );

        funderURIs = fundersData.map((funder) => funder.uri);
      }
    }

    const setSelectionsAndFetch = async () => {
      if (fundersData.length > 0) {
        // Funders exist
        setFunders(fundersData);
        setSelectedFunders(funderURIs);
        setBestPractice(false);
        setSelectedOwnerURIs(funderURIs);
        await fetchTemplates({ selectedOwnerURIs: funderURIs });
      } else if (hasBestPractice) {
        // No funders, but best practice exists
        setSelectedFilterItems(["DMP Best Practice"]);
        setBestPractice(true);
        setSelectedOwnerURIs([]);
        await fetchTemplates({ bestPractice: true });
      } else {
        // No funders and no best practice
        await fetchTemplates({ page: currentPage });
      }
      setInitialSelectionApplied(true);
    };

    setSelectionsAndFetch();
  }, [
    loading,
    projectFundingsLoading,
    publishedTemplates,
    projectFundings,
    uniqueAffiliations,
    userHasInteracted,
    initialSelectionApplied,
    currentPage,
  ]);

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
          <div className="searchSection" role="search" ref={topRef}>
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

          {searchTerm.length > 0 && (
            <div className="clear-filter">
              <div className="search-match-text"><Button onPress={resetSearch} className="search-match-text link">{Global('links.clearFilter')}</Button></div>
            </div>
          )}


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

              {/**Display list of published templates */}
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
