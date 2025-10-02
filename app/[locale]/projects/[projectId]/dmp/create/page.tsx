'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
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
  PlanErrors,
  useAddPlanFundingMutation,
  useProjectFundingsQuery,
  usePublishedTemplatesMetaDataQuery,
  usePublishedTemplatesLazyQuery,
} from '@/generated/graphql';

// Other
import { scrollToTop } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';
import { useToast } from '@/context/ToastContext';
import { useFormatDate } from '@/hooks/useFormatDate';
import { TemplateItemProps } from '@/app/types';
import { checkErrors } from '@/utils/errorHandler';

// # of templates displayed per page
const LIMIT = 5;

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
  const toastState = useToast(); // Access the toast state from context

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
  const [fetchPublishedTemplates, { data: publishedTemplates, loading, error: publishedTemplatesError }] = usePublishedTemplatesLazyQuery();

  // Get Project Funders data
  const { data: projectFundings, loading: projectFundingsLoading, error: projectFundingsError } = useProjectFundingsQuery({
    variables: { projectId: Number(projectId) },
  });


  // Get meta data about the available published templates
  const { data: templateMetaData, loading: templatesMetaDataLoading, error: templatesMetaDataError } = usePublishedTemplatesMetaDataQuery({
    variables: {
      paginationOptions: {
        offset: 0,
        limit: LIMIT,
        type: "OFFSET",
        sortDir: "DESC",
        selectOwnerURIs: [],
        bestPractice: false
      },
      term: ""
    }
  });

  // Initialize the addPlan mutation
  const [addPlanMutation] = useAddPlanMutation({
    notifyOnNetworkStatusChange: true,
  });

  const [addPlanFundingMutation] = useAddPlanFundingMutation({});

  const resetSearch = useCallback(() => {
    setSearchTerm('');
    handleSearchInput('');
    scrollToTop(topRef);
  }, [scrollToTop]);

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
  const handleCheckboxChange = async (value: string[], typ: string) => {
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

    } else if (typ === 'funders') {
      // Always dispatch selected filter items (whether empty or not)
      setSelectedFunders(value);
      setSelectedOwnerURIs(value);
      setBestPractice(false);
      // Fetch templates for selected funders
      await fetchTemplates({ selectedOwnerURIs: value });
    } else if (typ === 'bestPractice') {
      setSelectedFilterItems(value);
      setSelectedOwnerURIs([]);
      setBestPractice(true);
      // Fetch best practice templates
      await fetchTemplates({ bestPractice: true, selectedOwnerURIs: [] });
    }
  };

  const handlePageClick = async (page: number) => {
    setUserHasInteracted(true);
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
    setErrors([]);  // Clear the errors

    let newPlanId: number;
    const fundingIds: number[] = projectFundings
      ?.projectFundings
      ?.filter((item): item is { id: number } => !!item?.id)
      .map(item => item.id) ?? [];

    // Add the new plan
    addPlanMutation({
      variables: {
        projectId: Number(projectId),
        versionedTemplateId
      },
    }).then(planResp => {
      const [hasErrors, errs] = checkErrors(
        planResp?.data?.addPlan?.errors as PlanErrors,
        ['general', 'versionedTemplateId', 'projectId']
      );

      if (hasErrors) {
        setErrors([String(errs.general)]);
        toastState.add(Global("messaging.somethingWentWrong"), { type: 'error' });
      } else if (planResp?.data?.addPlan?.id) {
        newPlanId = planResp.data.addPlan.id;
        return addPlanFundingMutation({
          variables: {
            planId: newPlanId,
            projectFundingIds: fundingIds,
          },
        });
      } else {
        setErrors([Global("messaging.somethingWentWrong")]);
        toastState.add(Global("messaging.somethingWentWrong"), { type: 'error' });
        logECS('error', 'addPlanMutation', {
          error: "Invalid plan response data",
          url: {
            path: routePath('projects.dmp.create', {projectId}),
          }
        });
      }
    }).then(() => {
      // Early return if we don't have a plan ID set in the previous promise
      // callback
      if (!newPlanId) return;

      // NOTE:: We need to redirect to the plan index page regardless of potential
      // errors returned by the AddPlanFundingMutation. This is because we already
      // created the plan at this point, and it will cause confusion if we now
      // deal with errors without redirecting to the newly created plan.
      router.push(routePath('projects.dmp.show', {
        projectId,
        dmpId: newPlanId,  // newPlanId was set in the preceding promise
      }));
    }).catch(err => {
      logECS('error', 'addPlanMutation', {
        error: err,
        url: {
          path: routePath('projects.dmp.create', {projectId}),
        }
      });
      toastState.add(Global("messaging.somethingWentWrong"), { type: 'error' });
      setErrors([(err as Error).message])
    });
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
          selectOwnerURIs: selectedOwnerURIs,
          bestPractice
        },
        term: searchTerm,
      }
    });
  };

  // Process templates when publishedTemplates changes
  useEffect(() => {
    const processTemplates = async () => {
      if (publishedTemplates?.publishedTemplates?.items) {
        const transformedTemplates = await transformTemplates(publishedTemplates.publishedTemplates.items);
        setPublicTemplatesList(transformedTemplates);
        const totalCount = publishedTemplates?.publishedTemplates?.totalCount ?? 0;
        const totalPages = Math.ceil(totalCount / LIMIT);
        setTotalPages(totalPages);
        const hasNextPage = publishedTemplates?.publishedTemplates?.hasNextPage ?? false;
        setHasNextPage(hasNextPage);
        const hasPreviousPage = publishedTemplates?.publishedTemplates?.hasPreviousPage ?? false;
        setHasPreviousPage(hasPreviousPage);
      } else {
        setPublicTemplatesList([]);
      }
    };
    processTemplates();
  }, [publishedTemplates]);


  // Single useEffect for initial data fetching
  useEffect(() => {
    // Wait until both GraphQL queries finish
    if (loading || projectFundingsLoading) return;
    if (userHasInteracted || initialSelectionApplied) return;

    const uniqueAffiliations = templateMetaData?.publishedTemplatesMetaData?.availableAffiliations?.filter(
      (affiliation): affiliation is string => affiliation !== null
    ) || [];

    const hasBestPracticeTemplates = templateMetaData?.publishedTemplatesMetaData?.hasBestPracticeTemplates ?? false;
    setHasBestPractice(hasBestPracticeTemplates);

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
      } else if (hasBestPracticeTemplates) {
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
    if (!initialSelectionApplied) {
      setSelectionsAndFetch();
    }
  }, [
    loading,
    templateMetaData,
    projectFundingsLoading,
    templatesMetaDataLoading,
    userHasInteracted,
    initialSelectionApplied
  ]);

  useEffect(() => {
    if (publishedTemplatesError || projectFundingsError || templatesMetaDataError) {
      logECS('error', 'Plan Create queries', {
        error: "Error running queries",
        url: {
          path: routePath('projects.dmp.create', { projectId })
        }
      });
      toastState.add(Global("messaging.somethingWentWrong"), { type: 'error' });
      router.push(routePath('projects.show', { projectId }));
    }
  }, [publishedTemplatesError, projectFundingsError, templatesMetaDataError]);

  return (
    <>
      <PageHeader
        title={PlanCreate('title')}
        description={PlanCreate('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
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
              >
                {funders.map((funder, index) => (
                  <div key={index}>
                    <Checkbox value={funder.uri}>
                      <div className="checkbox">
                        <svg viewBox="0 0 18 18" aria-hidden="true">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                      <div className="">
                        <span>
                          {funder.name}
                        </span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </CheckboxGroupComponent>
            )}

            {funders.length === 0 && hasBestPractice && (
              <CheckboxGroupComponent
                name="bestPractices"
                value={selectedFilterItems}
                onChange={(value) => handleCheckboxChange(value, 'bestPractice')}
                checkboxGroupLabel={PlanCreate('checkbox.filterByBestPracticesLabel')}
                checkboxGroupDescription={PlanCreate('checkbox.filterByBestPracticesDescription')}
              >
                <Checkbox value="DMP Best Practice" aria-label="best practices">
                  <div className="checkbox">
                    <svg viewBox="0 0 18 18" aria-hidden="true">
                      <polyline points="1 9 7 14 15 4" />
                    </svg>
                  </div>
                  <div className="">
                    <span>
                      {PlanCreate('labels.dmpBestPractice')}
                    </span>
                  </div>
                </Checkbox>
              </CheckboxGroupComponent>
            )}
          </div>

          {searchTerm.length > 0 && (
            <div className="clear-filter">
              <div className="search-match-text"><Button data-testid="clear-filter" onPress={resetSearch} className="search-match-text link">{Global('links.clearFilter')}</Button></div>
            </div>
          )}

          {(publicTemplatesList?.length > 0) ? (
            <>
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
          ) : (
            <p>{Global('messaging.noItemsFound')}</p>
          )}

        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default PlanCreate;
