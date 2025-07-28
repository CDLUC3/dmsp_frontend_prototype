import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ListBoxItem, } from "react-aria-components";
import {
  useChildResearchDomainsQuery,
  useTopLevelResearchDomainsQuery,
} from '@/generated/graphql';

import { FormSelect, } from "@/components/Form";


import styles from './researchDomainDropdowns.module.scss';

// Type definitions
interface ChildOption {
  id: string;
  name: string;
}

interface ResearchDomainInterface {
  id: string;
  name: string;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
interface CascadingDropdownProps {
  projectData: any;
  setProjectData: (data: any) => void;
}

const ResearchDomainCascadingDropdown: React.FC<CascadingDropdownProps> = ({ projectData, setProjectData }) => {
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState('');
  const [rDomains, setRDomains] = useState<ResearchDomainInterface[]>([]);
  const [childOptionsList, setChildOptionsList] = useState<ChildOption[]>([]);
  const childSelectRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);

  // Localization keys
  const ProjectDetail = useTranslations('ProjectsProjectDetail');

  // Get all Research Domains
  const { data: myResearchDomains } = useTopLevelResearchDomainsQuery();

  // Get all related child domains
  const { data: myChildDomains, refetch } = useChildResearchDomainsQuery(
    {
      variables: { parentResearchDomainId: Number(selectedParent) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Update child dropdown when parent selection changes
  const updateChildDropdown = async (parentResearchDomainId: string) => {
    setSelectedParent(parentResearchDomainId);
    setSelectedChild('');
    setProjectData({ ...projectData, researchDomainId: parentResearchDomainId });

    if (parentResearchDomainId) {
      await refetch({ parentResearchDomainId: Number(parentResearchDomainId) });
      // Set a brief timeout to ensure DOM is updated before focusing
      setTimeout(() => {
        if (childSelectRef.current) {
          childSelectRef.current.focus();
        }
      }, 50);
    } else {
      setChildOptionsList([]);
    }
  };

  // Handle child selection change
  const handleChildChange = (selected: string) => {
    setSelectedChild(selected);
    setProjectData({ ...projectData, researchDomainId: selected });
  };

  // Find the selected parent domain
  const selectedParentDomain = myResearchDomains?.topLevelResearchDomains?.find(domain => domain?.id === Number(selectedParent)) ?? null;
  const selectedParentName = selectedParentDomain?.name ?? '';


  // Get human-readable selection text
  const getSelectionText = () => {
    if (!selectedChild && selectedParent) {
      return `Selected category: ${selectedParentName}`;
    }
    const childText = childOptionsList.find(option => option.id === selectedChild)?.name;
    return `Selected: ${childText} (${selectedParentName})`;
  };

  useEffect(() => {
    if (myChildDomains?.childResearchDomains) {
      setChildOptionsList(myChildDomains.childResearchDomains.map(domain => ({
        id: domain?.id ? domain.id.toString() : '',
        name: domain?.name ? domain.name : ''
      })));
    } else {
      setChildOptionsList([]);
    }
  }, [myChildDomains]);

  useEffect(() => {
    const handleResearchDomains = async () => {
      if (myResearchDomains) {
        const researchDomains = (myResearchDomains?.topLevelResearchDomains || [])
          .filter((domain) => domain !== null)
          .map((domain) => ({
            id: domain.id?.toString() ?? '',
            name: domain.name
          }))
        setRDomains(researchDomains)
      }
    };

    handleResearchDomains();
  }, [myResearchDomains]);

  // Update the live region when child options change
  useEffect(() => {
    if (statusRef.current) {
      if (childOptionsList.length > 0) {
        statusRef.current.textContent = `Child dropdown updated with ${childOptionsList.length} options for ${selectedParent}.`;
      } else if (selectedParent) {
        statusRef.current.textContent = `No child options available for ${selectedParent}.`;
      } else {
        statusRef.current.textContent = '';
      }
    }
  }, [childOptionsList, selectedParent]);


  // We need this useEffect to update the selectedParent and selectedChild data passed into component, 
  // just on initial load
  useEffect(() => {
    if (initialLoadRef.current && projectData?.parentResearchDomainId && projectData?.researchDomainId) {
      if (projectData?.parentResearchDomainId) {
        setSelectedParent(projectData.parentResearchDomainId.toString());
      }
      if (projectData?.researchDomainId && projectData?.researchDomainId !== projectData?.parentResearchDomainId) {
        setSelectedChild(projectData.researchDomainId.toString());
      }
      initialLoadRef.current = false;
    }
  }, [projectData]);

  // Disable child dropdown if no parent is selected or no child options are available
  const isChildDisabled = Boolean(selectedParent === '' || childOptionsList.length === 0);

  return (
    <div className="cascading-dropdown">
      <div className="form-group">
        <FormSelect
          label={ProjectDetail('labels.researchDomain')}
          isRequired
          name="researchDomain"
          items={rDomains}
          selectClasses={styles.researchDomainSelect}
          onChange={selected => updateChildDropdown(selected as string)}
          selectedKey={selectedParent}
        >
          {rDomains && rDomains.map((domain) => {
            return (
              <ListBoxItem key={domain.id}>{domain.id}</ListBoxItem>
            )

          })}
        </FormSelect>
      </div>

      <div className="form-group">
        <FormSelect
          label={(selectedParent && myResearchDomains?.topLevelResearchDomains) ? ProjectDetail('labels.childDomain', { name: selectedParentDomain?.name || '' }) : ProjectDetail('labels.item')}
          isRequired
          isDisabled={isChildDisabled}
          name="childDomain"
          items={childOptionsList}
          selectClasses={styles.researchDomainSelect}
          onChange={selected => handleChildChange(selected as string)}
          helpMessage={(selectedParent || selectedChild) ? getSelectionText() : ''}
          selectedKey={selectedChild}
          aria-labelledby="child-label"
          aria-invalid={isChildDisabled}
          aria-required="true"
          ref={childSelectRef}
        >
          <option value="">
            {isChildDisabled
              ? ProjectDetail('helpText.selectResearchDomain')
              : ProjectDetail('labels.childDomain', { name: selectedParentDomain?.name || '' })}
          </option>
          {childOptionsList && childOptionsList.map((option) => {
            return (
              <ListBoxItem key={option.id}>{option.name}</ListBoxItem>
            )

          })}
        </FormSelect>
      </div>

      {/* Live region to announce changes */}
      <div
        ref={statusRef}
        className="sr-only"
        role="status"
        aria-live="polite"
      ></div>

    </div>
  );
};

export default ResearchDomainCascadingDropdown;
