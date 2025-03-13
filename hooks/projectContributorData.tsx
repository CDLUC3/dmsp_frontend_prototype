'use client'

import { useEffect, useState } from 'react';
import { useProjectContributorQuery, ContributorRole } from '@/generated/graphql';
import { ProjectContributorFormInterface } from '@/app/types';

export const useProjectContributorData = (projectContributorId: number) => {
  const [projectContributorData, setProjectContributorData] = useState<ProjectContributorFormInterface>({
    givenName: '',
    surName: '',
    affiliationId: '',
    email: '',
    orcid: '',
  });

  // Keep track of which roles are checked
  const [selectedRoles, setSelectedRoles] = useState<ContributorRole[]>([]);
  const [checkboxRoles, setCheckboxRoles] = useState<string[]>([]);

  // Query for the specified project contributor
  const { data, loading, error: queryError } = useProjectContributorQuery({
    variables: {
      projectContributorId: Number(projectContributorId)
    }
  })


  console.log("***DATA", data);

  useEffect(() => {
    // Update state values from data results
    if (data?.projectContributor) {
      const projContributor = data.projectContributor;
      setProjectContributorData({
        givenName: projContributor.givenName ?? '',
        surName: projContributor?.surName ?? '',
        affiliationId: projContributor?.affiliation?.uri ?? '',
        email: projContributor?.email ?? '',
        orcid: projContributor?.orcid ?? '',
      })
      if (data.projectContributor?.contributorRoles) {
        const cleanedRoles = data.projectContributor?.contributorRoles.filter(role => role !== null && role !== undefined);
        /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
        const cleanedData = cleanedRoles.map(({ __typename, ...fields }) => fields);
        setSelectedRoles((prevRoles) => {
          return [...prevRoles, ...cleanedData];
        });
        const selectedRoleLabels = cleanedData
          .map(role => {
            return role?.id?.toString() ?? '';
          })
        setCheckboxRoles(selectedRoleLabels);
      }
    }
  }, [data])


  return {
    projectContributorData,
    selectedRoles,
    checkboxRoles,
    setCheckboxRoles,
    loading,
    setProjectContributorData,
    setSelectedRoles,
    data,
    queryError
  };
};
