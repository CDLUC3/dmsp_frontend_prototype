'use client';

import React, { useEffect, useReducer, useRef } from 'react';
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

// GraphQL
import {
  useAddPlanMutation,
  useProjectFundersQuery,
  usePublishedTemplatesQuery
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import logECS from '@/utils/clientLogger';
import { filterTemplates } from '@/utils/filterTemplates';
import { TemplateItemProps } from '@/app/types';
import { useFormatDate } from '@/hooks/useFormatDate';

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
  /*owner?: {
    displayName?: string;
    name?: string;
    searchName?: string;
    uri?: string | null;
  } | null;*/
}

const PUBLIC_TEMPLATES_INCREMENT = 3;
const FILTER_TEMPLATES_INCREMENT = 10;

const initialState = {
  projectFunderTemplates: [] as TemplateItemProps[],
  publicTemplatesList: [] as TemplateItemProps[],
  filteredPublicTemplates: null as TemplateItemProps[] | null,
  funders: [] as ProjectFundersInterface[],
  bestPracticeTemplates: [] as TemplateItemProps[],
  selectedFilterItems: [] as string[],
  searchTerm: '',
  searchButtonClicked: false,
  errors: [] as string[],
  visibleCount: {
    publicTemplatesList: 3,
    templates: 3,
    filteredTemplates: 3,
    filteredPublicTemplates: 3,
  },
};

type State = typeof initialState;

type Action =
  | { type: 'SET_PROJECT_FUNDER_TEMPLATES'; payload: TemplateItemProps[] }
  | { type: 'SET_PUBLIC_TEMPLATES_LIST'; payload: TemplateItemProps[] }
  | { type: 'SET_FILTERED_PUBLIC_TEMPLATES'; payload: TemplateItemProps[] | null }
  | { type: 'SET_FUNDERS'; payload: ProjectFundersInterface[] }
  | { type: 'SET_BEST_PRACTICE_TEMPLATES'; payload: TemplateItemProps[] }
  | { type: 'SET_SELECTED_FILTER_ITEMS'; payload: string[] }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SEARCH_BUTTON_CLICKED'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: string[] }
  | { type: 'SET_VISIBLE_COUNT'; payload: Partial<State['visibleCount']> }
  | { type: 'RESET_SEARCH' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PROJECT_FUNDER_TEMPLATES':
      return { ...state, projectFunderTemplates: action.payload };
    case 'SET_PUBLIC_TEMPLATES_LIST':
      return { ...state, publicTemplatesList: action.payload };
    case 'SET_FILTERED_PUBLIC_TEMPLATES':
      return { ...state, filteredPublicTemplates: action.payload };
    case 'SET_FUNDERS':
      return { ...state, funders: action.payload };
    case 'SET_BEST_PRACTICE_TEMPLATES':
      return { ...state, bestPracticeTemplates: action.payload };
    case 'SET_SELECTED_FILTER_ITEMS':
      return { ...state, selectedFilterItems: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_SEARCH_BUTTON_CLICKED':
      return { ...state, searchButtonClicked: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'SET_VISIBLE_COUNT':
      return { ...state, visibleCount: { ...state.visibleCount, ...action.payload } };
    case 'RESET_SEARCH':
      return {
        ...state,
        searchTerm: '',
        filteredPublicTemplates: null,
      };
    default:
      return state;
  }
};







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


  const [state, dispatch] = useReducer(reducer, initialState);

  // Localization keys
  const PlanCreate = useTranslations('PlanCreate');
  const Global = useTranslations('Global');

  // Get Project Funders data
  const { data: projectFunders, loading: projectFundersLoading, error: projectFundersError } = useProjectFundersQuery({
    variables: { projectId: Number(projectId) },
  });

  // Get Published Templates data
  const { data: publishedTemplatesData, loading: publishedTemplatesLoading, error: publishedTemplatesError } = usePublishedTemplatesQuery({
    notifyOnNetworkStatusChange: true,
  });

  // Initialize the addPlan mutation
  const [addPlanMutation] = useAddPlanMutation({
    notifyOnNetworkStatusChange: true,
  });


  const isLoading = projectFundersLoading || publishedTemplatesLoading;
  const isError = projectFundersError || publishedTemplatesError;


  const clearErrors = () => {
    dispatch({ type: 'SET_ERRORS', payload: [] });
  }

  // Transform the templates data into more useable format
  const transformTemplates = async (templates: (PublicTemplatesInterface | null)[]) => {
    console.log('Transforming templates:', templates);
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
      }))
    );
    return transformedTemplates;
  };

  // Handle search input
  const handleSearchInput = (value: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: value });
  };

  // Handle checkbox change
  const handleCheckboxChange = (value: string[], bestPracticeTemplates?: TemplateItemProps[]) => {
    // Always dispatch selected filter items (whether empty or not)
    dispatch({ type: 'SET_SELECTED_FILTER_ITEMS', payload: value });

    let filteredList: TemplateItemProps[] | null = null;

    // Determine which templates to show based on selected filters
    if (value.length > 0) {
      if (value.includes('DMP Best Practice')) {
        // Use best practice templates
        filteredList = bestPracticeTemplates ?? state.bestPracticeTemplates ?? [];
      } else if (state.funders.length > 0) {
        // Filter project templates by selected funders
        filteredList = state.projectFunderTemplates.filter(template =>
          template.funder && value.includes(template.funder)
        );
      } else {
        // Default to best practice templates when no other criteria match
        filteredList = bestPracticeTemplates ?? [];
      }
    } else {
      // No filters selected - use all templates or null depending on search
      filteredList = state.searchTerm ? state.publicTemplatesList : null;
    }

    // Apply search term filtering if needed
    if (state.searchTerm && filteredList) {
      filteredList = filterTemplates(filteredList, state.searchTerm);
    }

    // Set filtered templates with a single dispatch
    dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: filteredList });
  };

  const handleFiltering = (term: string) => {
    let filtered;
    dispatch({ type: 'SET_ERRORS', payload: [] });
    dispatch({ type: 'SET_SEARCH_BUTTON_CLICKED', payload: true });

    if (state.selectedFilterItems.length > 0 && (state.filteredPublicTemplates && state.filteredPublicTemplates.length > 0)) {
      filtered = filterTemplates(state.filteredPublicTemplates, term);
    } else {
      filtered = filterTemplates(state.publicTemplatesList, term);
    }

    if (filtered.length > 0) {
      dispatch({ type: 'SET_SEARCH_TERM', payload: term });
      dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: filtered });
    } else {
      dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: null });
    }
  };

  const handleLoadMore = (listKey: keyof State['visibleCount']) => {
    const increment = listKey === 'filteredPublicTemplates' ? FILTER_TEMPLATES_INCREMENT : PUBLIC_TEMPLATES_INCREMENT;
    dispatch({
      type: 'SET_VISIBLE_COUNT',
      payload: { [listKey]: state.visibleCount[listKey] + increment },
    });

    setTimeout(() => {
      if (nextSectionRef.current) {
        nextSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const sortTemplatesByProjectFunders = (templates: TemplateItemProps[]) => {
    const funders = projectFunders?.projectFunders || [];
    return [...templates].sort((a, b) => {
      if (funders?.length === 0) {
        return Number(b.bestPractices) - Number(a.bestPractices);
      }
      return a.funder && funders && funders.some(f => f?.affiliation?.displayName === a.funder) ? -1 : 1;
    });
  };

  const resetSearch = () => {
    dispatch({ type: 'RESET_SEARCH' });
    if (state.selectedFilterItems.length > 0) {
      let filteredList;
      if (state.funders.length > 0) {
        filteredList = state.projectFunderTemplates.filter(template =>
          template.funder && state.selectedFilterItems.includes(template.funder)
        );
      } else {
        filteredList = state.bestPracticeTemplates;
      }
      dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: filteredList });
    } else {
      dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: null });
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
      dispatch({ type: 'SET_ERRORS', payload: [(err as Error).message] });

    }

    // Redirect to the newly created plan
    if (newPlanId) {
      router.push(`/projects/${projectId}/dmp/${newPlanId}`)
    }
  }

  useEffect(() => {
    const processTemplates = async () => {
      const templates = publishedTemplatesData?.publishedTemplates?.items ?? [];

      if (publishedTemplatesData && publishedTemplatesData?.publishedTemplates) {
        const publicTemplates = await transformTemplates(templates);
        const transformedPublicTemplates = publicTemplates.filter(template => template.visibility === 'PUBLIC');
        const sortedPublicTemplates = sortTemplatesByProjectFunders(transformedPublicTemplates);
        dispatch({ type: 'SET_PUBLIC_TEMPLATES_LIST', payload: sortedPublicTemplates });
      }

      // Find templates that contain project funder as owner
      const matchingTemplates = templates.filter(template =>
        projectFunders?.projectFunders && projectFunders.projectFunders.some(pf => pf?.affiliation?.uri === template?.ownerURI)
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
          dispatch({ type: 'SET_FUNDERS', payload: uniqueFunders });
        }
        dispatch({ type: 'SET_PROJECT_FUNDER_TEMPLATES', payload: transformedProjectFunderTemplates });
      }
    };
    processTemplates();
  }, [publishedTemplatesData, projectFunders]);


  useEffect(() => {
    // On page load, initially check the checkboxes for either project funders or best practice templates
    if (state.funders.length === 0) {
      const bestPracticeTemplates = state.publicTemplatesList.filter(template => template.bestPractices);
      // If best practice templates exist, then we want to show them by default
      if (bestPracticeTemplates.length > 0) {
        const bestPracticeArray = bestPracticeTemplates.map(bp => bp.funder || '');
        dispatch({ type: 'SET_BEST_PRACTICE_TEMPLATES', payload: bestPracticeTemplates });
        dispatch({ type: 'SET_SELECTED_FILTER_ITEMS', payload: bestPracticeArray });
        handleCheckboxChange([...bestPracticeArray, "DMP Best Practice"], bestPracticeTemplates);
      }
    } else {
      const funderNames = state.funders.map(funder => funder.name);
      handleCheckboxChange(funderNames);
    }
  }, [state.funders, state.publicTemplatesList]);

  useEffect(() => {
    // Reset to original state when search term is empty
    if (state.searchTerm === '') {
      resetSearch();
      dispatch({ type: 'SET_SEARCH_BUTTON_CLICKED', payload: false });
    }
  }, [state.searchTerm]);

  if (isLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (isError) {
    return <div>{Global('messaging.error')}</div>;
  }

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
      <ErrorMessages errors={state.errors} ref={errorRef} />
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
                value={state.searchTerm}
                onChange={e => handleSearchInput(e.target.value)}
              />
              <Button
                onPress={() => handleFiltering(state.searchTerm)}
              >{Global('buttons.search')}</Button>
              <FieldError />
            </SearchField>

            {/**Only show filters if there are funders or best practice templates  */}
            {(state.bestPracticeTemplates.length > 0 || state.funders.length > 0) && (
              state.funders.length > 0 ? (
                <CheckboxGroupComponent
                  name="funders"
                  value={state.selectedFilterItems}
                  onChange={handleCheckboxChange}
                  checkboxGroupLabel={PlanCreate('checkbox.filterByFunderLabel')}
                  checkboxGroupDescription={PlanCreate('checkbox.filterByFunderDescription')}
                  checkboxData={state.funders.map(funder => ({
                    label: funder.name,
                    value: funder.name,
                  }))}
                />
              ) : (
                <CheckboxGroupComponent
                  name="bestPractices"
                  value={state.selectedFilterItems}
                  onChange={handleCheckboxChange}
                  checkboxGroupLabel={PlanCreate('checkbox.filterByBestPracticesLabel')}
                  checkboxGroupDescription={PlanCreate('checkbox.filterByBestPracticesDescription')}
                  checkboxData={state.bestPracticeTemplates.map(() => ({
                    label: PlanCreate('labels.dmpBestPractice'),
                    value: "DMP Best Practice",
                  }))}
                />
              )
            )}
          </div>

          {state.publicTemplatesList.length > 0 && (
            <section className="mb-8" aria-labelledby="public-templates">
              <div className="template-list" role="list" aria-label="Public templates">
                {state.filteredPublicTemplates && state.filteredPublicTemplates.length > 0 ? (
                  <>
                    {state.selectedFilterItems.length > 0 ? (
                      state.filteredPublicTemplates.map((template, index) => (
                        <div key={index}>
                          <TemplateSelectListItem
                            item={template}
                            onSelect={onSelect}
                          />
                        </div>
                      ))
                    ) : (
                      <TemplateList
                        templates={state.filteredPublicTemplates}
                        visibleCountKey='filteredPublicTemplates'
                        increment={FILTER_TEMPLATES_INCREMENT}
                        onSelect={onSelect}
                        visibleCount={state.visibleCount}
                        handleLoadMore={handleLoadMore}
                        resetSearch={resetSearch}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {state.searchTerm.length > 0 && state.searchButtonClicked ? (
                      <>{Global('messaging.noItemsFound')}</>
                    ) : (
                      <TemplateList
                        templates={state.publicTemplatesList}
                        visibleCountKey='templates'
                        increment={PUBLIC_TEMPLATES_INCREMENT}
                        onSelect={onSelect}
                        visibleCount={state.visibleCount}
                        handleLoadMore={handleLoadMore}
                        resetSearch={resetSearch}
                      />
                    )}
                  </>
                )}
              </div>
            </section>
          )}
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default PlanCreate;
