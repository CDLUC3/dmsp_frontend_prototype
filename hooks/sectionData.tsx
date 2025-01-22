'use client'

import { useEffect, useState } from 'react';
import { SectionFormInterface, TagsInterface } from '@/app/types';
import {
  useSectionQuery,
} from '@/generated/graphql';

export const useSectionData = (sectionId: number) => {
  const [sectionData, setSectionData] = useState<SectionFormInterface>({
    sectionName: '',
    sectionIntroduction: '',
    sectionRequirements: '',
    sectionGuidance: '',
    sectionTags: [],
    displayOrder: undefined,
    bestPractice: undefined
  });

  // Keep track of which checkboxes have been selected
  const [selectedTags, setSelectedTags] = useState<TagsInterface[]>([]);
  const [checkboxTags, setCheckboxTags] = useState<string[]>([]);

  // Query for the specified section
  const { data, loading } = useSectionQuery({
    variables: {
      sectionId: Number(sectionId)
    }
  })


  useEffect(() => {
    // Update state values from data results
    if (data?.section) {
      const section = data.section;
      setSectionData({
        sectionName: section.name,
        sectionIntroduction: section?.introduction ? section.introduction : '',
        sectionRequirements: section?.requirements ? section.requirements : '',
        sectionGuidance: section?.guidance ? section.guidance : '',
        displayOrder: section?.displayOrder ? section.displayOrder : undefined,
        bestPractice: section?.bestPractice ? Boolean(section.bestPractice) : undefined

      })
      if (data.section?.tags) {
        const cleanedTags = data.section?.tags.filter(tag => tag !== null && tag !== undefined);
        /*eslint-disable @typescript-eslint/no-unused-vars*/
        const cleanedData = cleanedTags.map(({ __typename, ...fields }) => fields);
        setSelectedTags((prevTags) => {
          return [...prevTags, ...cleanedData];
        });
        const selectedTagNames = cleanedData.map(tag => {
          return tag.name;
        });
        setCheckboxTags(selectedTagNames);
      }
    }
  }, [data])


  return {
    sectionData,
    selectedTags,
    checkboxTags,
    loading,
    setSectionData,
    setSelectedTags,
    data
  };
};