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

const PUBLIC_TEMPLATES_INCREMENT = 3;
const FILTER_TEMPLATES_INCREMENT = 10;

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
  const [projectFunderTemplates, setProjectFunderTemplates] = useState<TemplateItemProps[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<TemplateItemProps[] | null>([])
  const [funders, setFunders] = useState<ProjectFundersInterface[]>([]);
  const [bestPracticeTemplates, setBestPracticeTemplates] = useState<TemplateItemProps[]>([]);
  const [selectedFilterItems, setSelectedFilterItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
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


  console.log("PROJECT FUNDINGS", projectFundings);
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
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  };

  // Handle checkbox change
  const handleCheckboxChange = (value: string[], bestPracticeTemplates?: TemplateItemProps[]) => {
    // Always dispatch selected filter items (whether empty or not)
    setSelectedFilterItems(value);

    let filteredList: TemplateItemProps[] | null = null;

    // Determine which templates to show based on selected filters
    if (value.length > 0) {
      if (value.includes('DMP Best Practice')) {
        // Use best practice templates
        filteredList = bestPracticeTemplates ?? bestPracticeTemplates ?? [];
      } else if (funders.length > 0) {
        // Filter project templates by selected funders
        filteredList = projectFunderTemplates.filter(template =>
          template.funder && value.includes(template.funder)
        );
      } else {
        // Default to best practice templates when no other criteria match
        filteredList = bestPracticeTemplates ?? [];
      }
    } else {
      // No filters selected - use all templates or null depending on search
      filteredList = searchTerm ? publicTemplatesList : null;
    }

    // Apply search term filtering if needed
    if (searchTerm && filteredList) {
      filteredList = filterTemplates(filteredList, searchTerm);
      // Set filtered templates with a single dispatch
      setFilteredPublicTemplates(filteredList);
    }
  };

  const handleFiltering = (term: string) => {
    let filtered;
    setErrors([]);
    setSearchButtonClicked(true);

    if (selectedFilterItems.length > 0 && (filteredPublicTemplates && filteredPublicTemplates.length > 0)) {
      filtered = filterTemplates(filteredPublicTemplates, term);
    } else {

      filtered = filterTemplates(publicTemplatesList, term);

    }

    if (filtered.length > 0) {
      setSearchTerm(term);
      setFilteredPublicTemplates(filtered);
    } else {
      setFilteredPublicTemplates(null);
    }
  };

  // const sortTemplatesByProjectFunders = (templates: TemplateItemProps[]) => {
  //   const funders = projectFundings?.projectFundings || [];
  //   return [...templates].sort((a, b) => {
  //     if (funders?.length === 0) {
  //       return Number(b.bestPractices) - Number(a.bestPractices);
  //     }
  //     return a.funder && funders && funders.some(f => f?.affiliation?.displayName === a.funder) ? -1 : 1;
  //   });
  // };

  const resetSearch = () => {
    if (selectedFilterItems.length > 0) {
      let filteredList;
      if (funders.length > 0) {
        filteredList = projectFunderTemplates.filter(template =>
          template.funder && selectedFilterItems.includes(template.funder)
        );
      } else {
        filteredList = bestPracticeTemplates;
      }
      setFilteredPublicTemplates(filteredList)
    } else {
      setFilteredPublicTemplates(null);
    }
    scrollToTop(topRef);
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

  const fetchTemplates: (page: number) => Promise<void> = async (page) => {
    setCurrentPage(page);
    await fetchPublishedTemplates({
      variables: {
        paginationOptions: {
          offset: (page - 1) * LIMIT,
          limit: 10,
          type: "OFFSET", // or just leave off if this is the default
          sortDir: "DESC", // optional
          includeMetadata: true
        },
        term: '',
      }
    });
  }

  // Load published templates
  useEffect(() => {
    fetchTemplates(1);
  }, []);

  useEffect(() => {
    const processTemplates = async () => {
      console.log("***PUBLISHED TEMPLATES", publishedTemplates);
      const templates = publishedTemplates?.publishedTemplates?.items ?? [];

      if (publishedTemplates && publishedTemplates?.publishedTemplates && publishedTemplates?.publishedTemplates?.items) {
        const publicTemplates = await transformTemplates(publishedTemplates?.publishedTemplates?.items);
        setPublicTemplatesList(publicTemplates);
        setTotalCount(publishedTemplates?.publishedTemplates?.totalCount ? publishedTemplates?.publishedTemplates?.totalCount : 0);
        setHasNextPage(publishedTemplates?.publishedTemplates?.hasNextPage ? publishedTemplates?.publishedTemplates?.hasNextPage : false);
        setHasPreviousPage(publishedTemplates?.publishedTemplates?.hasPreviousPage ? publishedTemplates?.publishedTemplates?.hasPreviousPage : false);
      }

      // Find templates that contain project funder as owner
      const matchingTemplates = templates.filter(template =>
        projectFundings?.projectFundings && projectFundings.projectFundings.some(pf => pf?.affiliation?.uri === template?.ownerURI)
      );

      if (matchingTemplates) {
        const transformedProjectFunderTemplates = await transformTemplates(matchingTemplates);
        const funders = transformedProjectFunderTemplates
          .map(funder => ({
            name: funder?.funder ?? null,
            uri: funder?.funderUri ?? null,
          }))
          .filter((funder): funder is { name: string; uri: string } => funder.name !== null);

        // Remove duplicates based on `name` and `uri`
        const uniqueFunders = Array.from(
          new Map(funders.map(funder => [funder.name, funder])).values()
        );

        if (uniqueFunders.length > 0) {
          setFunders(uniqueFunders);
        }
        setProjectFunderTemplates(transformedProjectFunderTemplates);
      }
    };
    processTemplates();
  }, [publishedTemplates, projectFundings]);


  useEffect(() => {
    // On page load, initially check the checkboxes for either project funders or best practice templates
    if (funders.length === 0) {
      const bestPracticeTemplates = publicTemplatesList.filter(template => template.bestPractices);
      // If best practice templates exist, then we want to show them by default
      if (bestPracticeTemplates.length > 0) {
        const bestPracticeArray = bestPracticeTemplates.map(bp => bp.funder || '');
        setBestPracticeTemplates(bestPracticeTemplates);
        setSelectedFilterItems(bestPracticeArray);
        handleCheckboxChange([...bestPracticeArray, "DMP Best Practice"], bestPracticeTemplates);
      }
    } else {
      const funderNames = funders.map(funder => funder.name);
      handleCheckboxChange(funderNames);
    }
  }, [funders, publicTemplatesList]);

  useEffect(() => {
    // Reset to original state when search term is empty
    if (searchTerm === '') {
      resetSearch();
      setSearchButtonClicked(false);
    }
  }, [searchTerm]);

  // Calculate total pages based on total records and records per page
  const RECORDS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalCount / RECORDS_PER_PAGE);


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

            {/**funders or best practice options  */}

            <CheckboxGroupComponent
              name="funders"
              value={selectedFilterItems}
              onChange={handleCheckboxChange}
              checkboxGroupLabel={PlanCreate('checkbox.filterByFunderLabel')}
              checkboxGroupDescription={PlanCreate('checkbox.filterByFunderDescription')}
              checkboxData={funders.map(funder => ({
                label: funder.name,
                value: funder.name,
              }))}
            />

            <CheckboxGroupComponent
              name="bestPractices"
              value={selectedFilterItems}
              onChange={handleCheckboxChange}
              checkboxGroupLabel={PlanCreate('checkbox.filterByBestPracticesLabel')}
              checkboxGroupDescription={PlanCreate('checkbox.filterByBestPracticesDescription')}
              checkboxData={bestPracticeTemplates.map(() => ({
                label: PlanCreate('labels.dmpBestPractice'),
                value: "DMP Best Practice",
              }))}
            />

          </div>

          {publicTemplatesList?.length > 0 && (
            <>
              {Pagination({ currentPage, totalPages, hasPreviousPage, hasNextPage, fetchTemplates })}

              <section className="mb-8" aria-labelledby="public-templates">
                <div className="template-list" role="list" aria-label="Public templates">

                  <TemplateList
                    key={publicTemplatesList.length}
                    templates={publicTemplatesList}
                    onSelect={onSelect}
                  />

                </div>
              </section>
              {Pagination({ currentPage, totalPages, hasPreviousPage, hasNextPage, fetchTemplates })}

            </>
          )}

        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default PlanCreate;
