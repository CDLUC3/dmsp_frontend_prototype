'use client';

import React, { useEffect, useRef, useReducer } from 'react';
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
  usePublishedTemplatesQuery,
  useProjectFundersQuery,
  useAddPlanMutation
} from '@/generated/graphql';

// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';

// Other
import logECS from '@/utils/clientLogger';
import { TemplateItemProps } from '@/app/types';
import { useFormatDate } from '@/hooks/useFormatDate';

interface ProjectFundersInterface {
  name: string;
  uri: string;
}

interface PublicTemplatesInterface {
  bestPractice?: boolean | null;
  id?: number | null;
  name: string;
  description?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  visibility: string;
  owner?: {
    displayName?: string;
    name?: string;
    searchName?: string;
    uri?: string | null;
  } | null;
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
        selectedFilterItems: [],
      };
    default:
      return state;
  }
};







const PlanCreate: React.FC = () => {
  const formatDate = useFormatDate();
  const params = useParams();
  const router = useRouter();
  const { projectId } = params;
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { scrollToTop } = useScrollToTop();
  const [state, dispatch] = useReducer(reducer, initialState);

  const PlanCreate = useTranslations('PlanCreate');
  const Global = useTranslations('Global');

  const { data: projectFunders, loading: projectFundersLoading, error: projectFundersError } = useProjectFundersQuery({
    variables: { projectId: Number(projectId) },
  });

  const { data: publishedTemplatesData, loading: publishedTemplatesLoading, error: publishedTemplatesError } = usePublishedTemplatesQuery({
    notifyOnNetworkStatusChange: true,
  });

  // Initialize the addPlan mutation
  const [addPlanMutation] = useAddPlanMutation({
    notifyOnNetworkStatusChange: true,
  });


  const isLoading = projectFundersLoading || publishedTemplatesLoading;
  const isError = projectFundersError || publishedTemplatesError;

  const filterTemplates = (templates: TemplateItemProps[], term: string): TemplateItemProps[] =>
    templates.filter(template =>
      [template.title, template.funder, template.description].some(field =>
        field?.toLowerCase().includes(term.toLowerCase())
      )
    );


  const clearErrors = () => {
    dispatch({ type: 'SET_ERRORS', payload: [] });
  }

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
        funder: template?.owner?.displayName || "",
        funderUri: template?.owner?.uri || "",
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedById || null,
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.visibility,
        bestPractices: template?.bestPractice || false,
      }))
    );
    return transformedTemplates;
  };

  const handleSearchInput = (value: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: value });
  };

  const handleCheckboxChange = (value: string[]) => {
    let filteredList;
    if (value.length > 0) {
      dispatch({ type: 'SET_SELECTED_FILTER_ITEMS', payload: value });
      if (state.funders.length > 0) {
        filteredList = state.projectFunderTemplates.filter(template =>
          template.funder && value.includes(template.funder)
        );
      } else {
        filteredList = state.bestPracticeTemplates;
      }
      dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: filteredList });
      if (state.searchTerm) {
        filteredList = filterTemplates(filteredList, state.searchTerm);
        dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: filteredList });
      }
    } else {
      dispatch({ type: 'SET_SELECTED_FILTER_ITEMS', payload: [] });
      if (state.searchTerm) {
        filteredList = filterTemplates(state.publicTemplatesList, state.searchTerm);
        dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: filteredList });
      } else {
        dispatch({ type: 'SET_FILTERED_PUBLIC_TEMPLATES', payload: null });
      }
    }
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
    return [...templates].sort((a, b) => {
      if (state.funders.length === 0) {
        return Number(b.bestPractices) - Number(a.bestPractices);
      }
      return state.funders.some(f => f.name === a.funder) ? -1 : 1;
    });
  };

  const resetSearch = () => {
    dispatch({ type: 'RESET_SEARCH' });
    scrollToTop(topRef);
  };

  const onSelect = async (versionedTemplateId: number) => {
    let newPlanId;
    //Add the new template
    try {
      const response = await addPlanMutation({
        variables: {
          projectId: Number(projectId),
          versionedTemplateId: versionedTemplateId
        },
      });
      if (response?.data) {
        clearErrors();
        // Get templateId of new template so we know where to redirect
        newPlanId = response?.data?.addPlan?.id;
      }
    } catch (err) {
      logECS('error', 'handleClick', {
        error: err,
        url: { path: '/template/create' }
      });
      dispatch({ type: 'SET_ERRORS', payload: [(err as Error).message] });

    }

    // Redirect to the newly created template
    if (newPlanId) {
      router.push(`/projects/${projectId}/dmp/${newPlanId}`)
    }
  }

  useEffect(() => {
    const processTemplates = async () => {
      if (publishedTemplatesData && publishedTemplatesData?.publishedTemplates) {
        const publicTemplates = await transformTemplates(publishedTemplatesData.publishedTemplates);
        const transformedPublicTemplates = publicTemplates.filter(template => template.visibility === 'PUBLIC');
        const sortedPublicTemplates = sortTemplatesByProjectFunders(transformedPublicTemplates);
        dispatch({ type: 'SET_PUBLIC_TEMPLATES_LIST', payload: sortedPublicTemplates });
      }

      if (projectFunders && projectFunders?.projectFunders) {
        const funders = projectFunders.projectFunders
          .map(funder => ({
            name: funder?.affiliation?.displayName ?? null,
            uri: funder?.affiliation?.uri ?? null,
          }))
          .filter((funder): funder is { name: string; uri: string } => funder.name !== null);
        if (funders) {
          dispatch({ type: 'SET_FUNDERS', payload: funders });
        }
      }

      const matchingTemplates = publishedTemplatesData?.publishedTemplates?.filter(template =>
        state.funders.some(funder => funder.uri === template?.owner?.uri)
      );
      if (matchingTemplates) {
        const transformedProjectFunderTemplates = await transformTemplates(matchingTemplates);
        dispatch({ type: 'SET_PROJECT_FUNDER_TEMPLATES', payload: transformedProjectFunderTemplates });
      }
    };
    processTemplates();
  }, [publishedTemplatesData, projectFunders]);


  useEffect(() => {
    if (state.funders.length === 0) {
      const bestPracticeTemplates = state.publicTemplatesList.filter(template => template.bestPractices);
      const bestPracticeArray = bestPracticeTemplates.map(bp => bp.funder || '');
      dispatch({ type: 'SET_BEST_PRACTICE_TEMPLATES', payload: bestPracticeTemplates });
      dispatch({ type: 'SET_SELECTED_FILTER_ITEMS', payload: bestPracticeArray });
    } else {
      const funderNames = state.funders.map(funder => funder.name);
      handleCheckboxChange(funderNames);
    }
  }, [state.funders, state.publicTemplatesList]);


  useEffect(() => {
    if (state.bestPracticeTemplates.length > 0) {
      const bestPracticeArray = state.bestPracticeTemplates.map(bp => bp.funder || '');
      handleCheckboxChange(bestPracticeArray);
    }
  }, [state.bestPracticeTemplates]);

  useEffect(() => {
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

            {/**Only show filters if there are filtered items */}
            {state.selectedFilterItems.length > 0 && (
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
                  checkboxData={state.bestPracticeTemplates.map(bp => ({
                    label: bp.funder || '',
                    value: bp.funder || '',
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