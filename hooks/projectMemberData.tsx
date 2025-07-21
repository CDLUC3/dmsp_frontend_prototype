'use client'

import { useEffect, useState } from 'react';
import { useProjectMemberQuery } from '@/generated/graphql';
import { ProjectMemberFormInterface } from '@/app/types';

// Custom hook to fetch project Member data
export const useProjectMemberData = (projectMemberId: number) => {
  const [projectMemberData, setProjectMemberData] = useState<ProjectMemberFormInterface>({
    givenName: '',
    surName: '',
    affiliationId: '',
    email: '',
    orcid: '',
  });

  // Keep track of which roles are checked
  const [checkboxRoles, setCheckboxRoles] = useState<string[]>([]);

  // Query for the specified project member
  const { data, loading, error: queryError } = useProjectMemberQuery({
    variables: {
      projectMemberId: Number(projectMemberId)
    }
  })

  useEffect(() => {
    // Update state values from data results
    if (data?.projectMember) {
      const projMember = data.projectMember;
      setProjectMemberData({
        givenName: projMember.givenName ?? '',
        surName: projMember?.surName ?? '',
        affiliationId: projMember?.affiliation?.uri ?? '',
        email: projMember?.email ?? '',
        orcid: projMember?.orcid ?? '',
      })
      if (data.projectMember?.memberRoles) {
        const cleanedRoles = data.projectMember?.memberRoles.filter(role => role !== null && role !== undefined);
        const cleanedData = cleanedRoles.map(({ __typename, ...fields }) => fields);
        const selectedRoleLabels = cleanedData
          .map(role => {
            return role?.id?.toString() ?? '';
          })
        setCheckboxRoles(selectedRoleLabels);
      }
    }
  }, [data])


  return {
    projectMemberData,
    checkboxRoles,
    setCheckboxRoles,
    loading,
    setProjectMemberData,
    data,
    queryError
  };
};
