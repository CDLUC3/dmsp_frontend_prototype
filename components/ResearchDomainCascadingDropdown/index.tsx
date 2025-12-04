import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ListBoxItem, } from "react-aria-components";
import {
  useChildResearchDomainsQuery,
  useTopLevelResearchDomainsQuery,
} from '@/generated/graphql';

import { FormSelect, } from "@/components/Form";
import { ProjectDetailsFormInterface } from "@/app/types";
import styles from './researchDomainDropdowns.module.scss';

interface ChildOption {
  id: string;
  name: string;
}

interface ResearchDomainInterface {
  id: string;
  name: string;
}
interface CascadingDropdownProps {
  projectData: ProjectDetailsFormInterface;
  setProjectData: (data: ProjectDetailsFormInterface) => void;
}

const ResearchDomainCascadingDropdown: React.FC<CascadingDropdownProps> = ({ projectData, setProjectData }) => {
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState('');
  const [rDomains, setRDomains] = useState<ResearchDomainInterface[]>([]);
  const [childOptionsList, setChildOptionsList] = useState<ChildOption[]>([]);
  const statusRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);

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
    }
  };

  // Handle child selection change
  const handleChildChange = (selected: string) => {
    setSelectedChild(selected);
    setProjectData({ ...projectData, researchDomainId: selected });
  };

  // Find the selected parent domain
  const selectedParentDomain = myResearchDomains?.topLevelResearchDomains?.find(domain => domain?.id === Number(selectedParent)) ?? null;
  const selectedParentName = selectedParentDomain?.description ?? '';


  // Get human-readable selection text
  const getSelectionText = () => {
    if (!selectedChild && selectedParent) {
      return ProjectDetail('helpText.selectedCategory', { category: selectedParentName })
    }
    const childText = childOptionsList.find(option => option.id === selectedChild)?.name;
    return ProjectDetail('helpText.selectedRDomain', { domains: `${childText} (${selectedParentName})` })
  };

  useEffect(() => {
    if (myChildDomains?.childResearchDomains) {
      const subDomains = myChildDomains.childResearchDomains.map(domain => ({
        id: domain?.id ? domain.id.toString() : '',
        name: domain?.description ? domain.description : ''
      }))

      setChildOptionsList(subDomains);

      // Update live region when subdomains change
      if (statusRef.current) {
        if (subDomains.length > 0) {
          statusRef.current.textContent = ProjectDetail('helpText.childDropdownUpdated', { childOptionsList: subDomains.length, selectedParent: selectedParentName });
        } else {
          statusRef.current.textContent = '';
        }
      }
    }
  }, [myChildDomains]);

  useEffect(() => {
    const handleResearchDomains = async () => {
      if (myResearchDomains && myResearchDomains.topLevelResearchDomains) {
        const researchDomains = (myResearchDomains?.topLevelResearchDomains)
          .filter((domain) => domain !== null)
          .map((domain) => ({
            id: domain.id?.toString() ?? '',
            name: domain.description ?? ''
          }))
        setRDomains(researchDomains)
      }
    };

    handleResearchDomains();
  }, [myResearchDomains]);


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

  return (
    <div className="cascading-dropdown">
      <div className="form-group">
        <FormSelect
          label={ProjectDetail('labels.researchDomain')}
          name="researchDomain"
          items={rDomains}
          selectClasses={styles.researchDomainSelect}
          onChange={selected => updateChildDropdown(selected as string)}
          selectedKey={selectedParent}
          placeholder={ProjectDetail('placeholder.selectDomain')}
        >
          {rDomains.map((domain) => {
            return (
              <ListBoxItem key={domain.id} textValue={String(domain.id)}>{domain.id}</ListBoxItem>
            )

          })}
        </FormSelect>
      </div>

      {(selectedParent && myResearchDomains?.topLevelResearchDomains) && (
        <div className="form-group">
          <FormSelect
            label={ProjectDetail('labels.childDomain', { name: selectedParentDomain?.description || '' })}
            name="childDomain"
            items={childOptionsList}
            selectClasses={styles.researchDomainSelect}
            onChange={selected => handleChildChange(selected as string)}
            helpMessage={getSelectionText()}
            selectedKey={selectedChild}
            aria-labelledby="child-label"
            placeholder={ProjectDetail('placeholder.selectSubDomain')}
            data-testid="subdomain-select"
          >
            <option value="">
              {ProjectDetail('labels.childDomain', { name: selectedParentDomain?.description || '' })}
            </option>
            {childOptionsList && childOptionsList.map((option) => {
              return (
                <ListBoxItem key={option.id} textValue={option.name}>{option.name}</ListBoxItem>
              )

            })}
          </FormSelect>
        </div>
      )}


      {/* Live region to announce changes */}
      <div
        ref={statusRef}
        className="hidden-accessibly"
        role="status"
        aria-live="polite"
      ></div>

    </div>
  );
};

export default ResearchDomainCascadingDropdown;
