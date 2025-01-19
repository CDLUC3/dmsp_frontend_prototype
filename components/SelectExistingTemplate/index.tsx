'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ApolloError } from "@apollo/client";

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

//Components
import PageHeader from "@/components/PageHeader";
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import {
  ContentContainer,
  LayoutContainer,
} from '@/components/Container';

//GraphQL
import {
  useAddTemplateMutation,
  usePublicVersionedTemplatesQuery,
  useUserAffiliationTemplatesQuery
} from '@/generated/graphql';

// Other
import logECS from '@/utils/clientLogger';
import { UserAffiliationTemplatesInterface, TemplateItemProps } from '@/app/types';
import { filterTemplates } from '@/components/SelectExistingTemplate/utils';
import { useFormatDate } from '@/hooks/useFormatDate';
import styles from './selectExistingTemplate.module.scss';


const TemplateSelectTemplatePage = ({ templateName }: { templateName: string }) => {
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formatDate = useFormatDate();
  const router = useRouter();
  if (!templateName) {
    router.push('/template/create?step1');
  }

  // State
  const [templates, setTemplates] = useState<TemplateItemProps[]>([]);
  const [publicTemplatesList, setPublicTemplatesList] = useState<TemplateItemProps[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateItemProps[] | null>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<TemplateItemProps[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState({
    publicTemplatesList: 3,
    templates: 3,
    filteredTemplates: 3,
    filteredPublicTemplates: 3,
  });

  // Make graphql request for versionedTemplates under the user's affiliation
  const { data = {}, loading, error: queryError } = useUserAffiliationTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });


  // Make graphql request for all public versionedTemplates
  const { data: publicTemplatesData, loading: publicTemplatesLoading, error: publicTemplatesError, refetch: refetchPublicTemplates } = usePublicVersionedTemplatesQuery({
    /* Force Apollo to notify React of changes. This was needed for when refetch is
    called and a re-render of data is necessary*/
    notifyOnNetworkStatusChange: true,
  });

  const [addTemplateMutation] = useAddTemplateMutation();

  const onSelect = async (versionedTemplateId: number) => {
    let newTemplateId;
    //Add the new template
    try {
      const response = await addTemplateMutation({
        variables: {
          name: templateName,
          copyFromTemplateId: versionedTemplateId
        },
      });
      if (response?.data) {
        newTemplateId = response?.data?.addTemplate?.id;
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        /* We need to call this mutation again when there is an error and
refetch the user query in order for the page to reload with updated info. I tried just
calling 'refetch()' for the user query, but that didn't work. */
        await addTemplateMutation({
          variables: {
            name: templateName,
            copyFromTemplateId: versionedTemplateId
          }
        });
      } else {
        logECS('error', 'handleClick', {
          error: err,
          url: { path: '/template/create' }
        });
      }
    }
    if (newTemplateId) {
      router.push(`/template/${newTemplateId}`)
    }
  }

  const transformTemplates = async (templates: (UserAffiliationTemplatesInterface | null)[]) => {
    const transformedTemplates = await Promise.all(
      templates.map(async (template: UserAffiliationTemplatesInterface | null) => ({
        id: template?.id,
        template: {
          id: template?.template?.id ? template?.template.id : null
        },
        title: template?.name || "",
        description: template?.description || "",
        link: `/template/${template?.template?.id ? template?.template.id : ''}`,
        content: template?.description || template?.modified ? (
          <div>
            <p>{template?.description}</p>
            <p>
              Last updated: {template?.modified ? formatDate(template?.modified) : null}
            </p>
          </div>
        ) : null, // Set to null if no description or last modified data
        funder: template?.template?.owner?.name || template?.name,
        lastUpdated: template?.modified ? formatDate(template?.modified) : null,
        lastRevisedBy: template?.modifiedById || null,
        publishStatus: template?.versionType,
        hasAdditionalGuidance: false,
        defaultExpanded: false,
        visibility: template?.visibility,
      }))
    );
    return transformedTemplates;
  };

  type VisibleCountKeys = keyof typeof visibleCount;
  interface TemplateListProps {
    templates: TemplateItemProps[]; // An array of templates
    visibleCountKey: VisibleCountKeys; // Key used to access visible count
  }

  const TemplateList: React.FC<TemplateListProps> = ({ templates, visibleCountKey }) => (
    <>
      {(visibleCountKey === 'filteredTemplates' || visibleCountKey === 'filteredPublicTemplates') && (
        <div className={styles.searchMatchText}>{`${templates.length} results match your search`} - <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>clear filter</Link></div>
      )
      }
      {templates.slice(0, visibleCount[visibleCountKey]).map((template, index) => {
        const isFirstInNextSection = index === visibleCount[visibleCountKey] - 3;
        return (
          <div ref={isFirstInNextSection ? nextSectionRef : null} key={index}>
            <TemplateSelectListItem
              item={template}
              onSelect={onSelect}
            />
          </div>
        );
      })}
      <div className={styles.loadBtnContainer}>
        {templates.length - visibleCount[visibleCountKey] > 0 && (
          <>
            <Button onPress={() => handleLoadMore(visibleCountKey)}>
              {(templates.length - visibleCount[visibleCountKey] > 2)
                ? 'Load 3 more'
                : `Load ${templates.length - visibleCount[visibleCountKey]} more`}
            </Button>
            <div className={styles.remainingText}>{`Showing ${visibleCount[visibleCountKey]} of ${templates.length}`}</div>
          </>
        )}
        {(visibleCountKey === 'filteredTemplates' || visibleCountKey === 'filteredPublicTemplates') && (
          <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>clear filter</Link>
        )
        }
      </div>
    </>
  );

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
      topRef.current.focus();
    }
  }

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setErrors([]);
    // Search title, funder and description fields for terms
    const filteredList = filterTemplates(templates, term);
    const filteredPublicTemplatesList = filterTemplates(publicTemplatesList, term);

    if (filteredList.length || filteredPublicTemplatesList.length) {
      setSearchTerm(term);
      setFilteredTemplates(filteredList.length > 0 ? filteredList : null);
      setFilteredPublicTemplates(filteredPublicTemplatesList.length > 0 ? filteredPublicTemplatesList : null);
    } else {
      //If there are no matching results, then display an error
      setErrors(prev => [...prev, 'No items found']);
    }
  }

  const handleLoadMore = (listKey: VisibleCountKeys) => {
    setVisibleCount((prevCounts) => ({
      ...prevCounts,
      [listKey]: prevCounts[listKey] + 3, // Increase the visible count for the specific list
    }));

    setTimeout(() => {
      if (nextSectionRef.current) {
        nextSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setFilteredTemplates(null);
    setFilteredPublicTemplates(null);
    scrollToTop();
  }

  useEffect(() => {
    // Transform templates into format expected by TemplateListItem component
    const processTemplates = async () => {
      if (data && data?.userAffiliationTemplates) {
        const transformedTemplates = await transformTemplates(data.userAffiliationTemplates);
        setTemplates(transformedTemplates);
      }
      if (publicTemplatesData && publicTemplatesData?.publicVersionedTemplates) {
        const transformedPublicTemplates = await transformTemplates(publicTemplatesData.publicVersionedTemplates);
        setPublicTemplatesList(transformedPublicTemplates);
      }
    }

    processTemplates();

  }, [data, publicTemplatesData]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      resetSearch();
    }
  }, [searchTerm])


  if (loading || publicTemplatesLoading) {
    return <div>Loading...</div>;
  }
  if (queryError || publicTemplatesError) {
    return <div>Error loading templates. Please try again later.</div>;
  }

  return (
    <>

      <PageHeader
        title="Select an existing template"
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Template</Link></Breadcrumb>
            <Breadcrumb><Link href="/template/create?step=1">Create a template</Link></Breadcrumb>
            <Breadcrumb>Select an existing template</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <></>
        }
        className="page-template-list"
      />

      <LayoutContainer>
        <ContentContainer>
          <>
            <div className="Filters" role="search" ref={topRef}>
              <SearchField aria-label="Template search">
                <Label>Search by keyword</Label>
                <Input
                  aria-describedby="search-help"
                  value={searchTerm}
                  onChange={e => handleSearchInput(e.target.value)} />
                <Button
                  onPress={() => {
                    // Call your filtering function without changing the input value
                    handleFiltering(searchTerm);
                  }}
                >
                  Search
                </Button>
                <FieldError />
                <Text slot="description" className="help" id="search-help">
                  Search by research organization, field station or lab, template
                  description, etc.
                </Text>
              </SearchField>
            </div>

            <section className="mb-8" aria-labelledby="previously-created">
              <h2 id="previously-created">
                Use one of your previously created templates
              </h2>
              <div className="template-list" role="list" aria-label="Your templates">
                {(filteredTemplates && filteredTemplates.length > 0) ? (
                  <>
                    {
                      TemplateList({ templates: filteredTemplates, visibleCountKey: 'filteredTemplates' })
                    }

                  </>) : (
                  <>
                    {
                      TemplateList({ templates: templates, visibleCountKey: 'templates' })
                    }
                  </>
                )
                }
              </div>
            </section>

            {(publicTemplatesList && publicTemplatesList.length > 0) && (
              <section className="mb-8" aria-labelledby="public-templates">
                <h2 id="public-templates">
                  Use one of the public templates
                </h2>
                <div className="template-list" role="list" aria-label="Public templates">
                  {filteredPublicTemplates && filteredPublicTemplates.length > 0 ? (
                    <>
                      {
                        TemplateList({ templates: filteredPublicTemplates, visibleCountKey: 'filteredPublicTemplates' })
                      }
                    </>
                  ) : (
                    <>
                      {
                        TemplateList({ templates: publicTemplatesList, visibleCountKey: 'publicTemplatesList' })
                      }
                    </>
                  )
                  }

                </div>
              </section>
            )}

          </>
        </ContentContainer>
      </LayoutContainer >
    </>
  );
}

export default TemplateSelectTemplatePage;
