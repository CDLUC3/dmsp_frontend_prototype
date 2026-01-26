'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button
} from "react-aria-components";
import Image from 'next/image';
import parse from 'html-react-parser';
import { useTranslations } from "next-intl";

// GraphQL
import { useQuery } from '@apollo/client/react';
import {
  BestPracticeGuidanceDocument
} from '@/generated/graphql';

// Types
import {
  GuidanceSource,
  GuidancePanelProps,
  MatchedGuidance,
} from '@/app/types';

// Components
import ExpandableContentSection from '@/components/ExpandableContentSection';
import { DmpIcon } from "@/components/Icons";
import styles from './GuidancePanel.module.scss';

// Additional hard-coded guidance for demonstration purposes
const additionalGuidance = [
  {
    orgURI: 'https://ror.org/01an7q238',
    orgName: 'UC Berkeley',
    orgShortname: 'UCB',
    items: [
      {
        id: 1001,
        title: "UC Berkeley",
        guidanceText: `
    <p><strong>UC Berkeley Data Management:</strong> All research data must be stored on approved institutional storage systems. Consider using bDrive or Research Data Management services.</p>
    <p>Ensure compliance with UC Berkeley's data retention policies. Data should be retained for a minimum of 3 years after publication.</p>
    <p>For sensitive data, consult with the Office of Research Compliance and ensure appropriate IRB approval is obtained.</p>
  `.trim()
      }
    ]
  },
  {
    orgURI: 'https://ror.org/021nxhr68',
    orgName: 'National Institute of Health',
    orgShortname: 'NIH',
    items: [
      {
        id: 2001,
        title: "National Institute of Health",
        guidanceText: '<p>Data sharing plans should describe how data will be shared and preserved, or explain why data sharing is not possible.</p><p>Data should be deposited in a recognized repository appropriate to your field of study. Consider using domain-specific repositories when available.</p>'
      },
    ]
  },
]

const GuidancePanel: React.FC<GuidancePanelProps> = ({
  userAffiliationId,
  ownerAffiliationId,
  guidanceItems,
  sectionTags,
  onAddOrganization,
  //onRemoveOrganization, - This will be used for future work on removing pills
}) => {

  const Global = useTranslations('Global');
  const t = useTranslations('GuidancePanel');

  // Refs for measuring
  const containerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Internal state for uncontrolled usage
  const [showAllTabs, setShowAllTabs] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(3); // Default to 3
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [selectedGuidanceId, setSelectedGuidanceId] = useState<string>('bestPractice');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Query to get Best Practice guidance content
  const { data: bestPracticeGuidanceData, loading: bestPracticeLoading } = useQuery(
    BestPracticeGuidanceDocument,
    {
      variables: {
        tagIds: Object.keys(sectionTags).map(Number)// Extract tag IDs from sectionTags and convert to numbers
      },
      notifyOnNetworkStatusChange: true
    }
  );

  // Build guidance sources for tabs
  const guidanceSources = useMemo<GuidanceSource[]>(() => {
    const sources: GuidanceSource[] = [];

    // Build best practice guidance items
    const bestPracticeItems: MatchedGuidance[] = [];

    bestPracticeGuidanceData?.bestPracticeGuidance.forEach((bp) => {
      if (bp.guidanceText && bp.id != null && Object.keys(sectionTags).map(Number).includes(bp.tagId)) {
        bestPracticeItems.push({
          id: bp.id,
          title: sectionTags[bp.tagId],
          guidanceText: bp.guidanceText
        });
      }
    });

    // Only add best practice source if it has items
    if (bestPracticeItems.length > 0) {
      sources.push({
        id: 'bestPractice',
        type: 'bestPractice',
        label: "DMP Tool",
        shortName: 'DMP Tool',
        items: bestPracticeItems
      });
    }

    // Build organization guidance sources
    guidanceItems.forEach((org, index) => {
      if (org.items.length > 0) {
        sources.push({
          id: `org-${index}`,
          type: 'organization',
          label: org.orgName,
          shortName: org.orgShortname || null,
          items: org.items || [],
          orgURI: org.orgURI
        });
      }
    });

    // Additional guidance hard-coded just for demonstation purposes, since we cannot yet add additional orgs
    additionalGuidance.forEach((org, index) => {
      if (org.items.length > 0) {
        sources.push({
          id: `org-additional-${index}`,
          type: 'organization',
          label: org.orgName,
          shortName: org.orgShortname || null,
          items: org.items,
          orgURI: org.orgURI
        });
      }
    });
    return sources;
  }, [guidanceItems, bestPracticeGuidanceData]);

  // Calculate how many pills can fit in first row
  // because we always want to show the "More" button in the first row if there are too many pills
  useEffect(() => {
    const calculateVisibleCount = () => {
      if (!containerRef.current || guidanceSources.length === 0) return;

      const containerWidth = containerRef.current.offsetWidth;
      const gap = 8; // Gap between pills
      const moreButtonWidth = 80; // Approximate width of "More" button
      const availableWidth = containerWidth - moreButtonWidth - gap;

      let totalWidth = 0;
      let count = 0;

      // Measure each pill temporarily to see how many fit
      pillsRef.current.forEach((pill) => {
        if (!pill) return;
        const pillWidth = pill.offsetWidth;
        if (totalWidth + pillWidth + (count > 0 ? gap : 0) <= availableWidth) {
          totalWidth += pillWidth + (count > 0 ? gap : 0);
          count++;
        }
      });

      // Always show at least 1 pill
      setVisibleCount(Math.max(1, count));
    };

    // Calculate on mount and guidanceSources change
    calculateVisibleCount();

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(calculateVisibleCount);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [guidanceSources]);


  // Ensure selected tab is valid
  useEffect(() => {
    if (guidanceSources.length > 0 && !guidanceSources.find(s => s.id === selectedGuidanceId)) {
      setSelectedGuidanceId(guidanceSources[0].id);
    }
  }, [guidanceSources, selectedGuidanceId]);

  // Auto-select tab based on user affiliation, with fallback to owner affiliation, and then best practice
  useEffect(() => {
    // Wait for GraphQL to finish loading before auto-selecting
    if (bestPracticeLoading || isInitialized) {
      return;
    }

    if (guidanceSources.length > 0) {
      // Compute correct selection
      let matchingSource = null;

      // First priority: Try to match user's affiliation
      if (userAffiliationId) {
        matchingSource = guidanceSources.find(
          source => source.type === 'organization' && source.orgURI === userAffiliationId
        );
      }

      // Second priority: If no user match, try to match owner's affiliation
      if (!matchingSource && ownerAffiliationId) {
        matchingSource = guidanceSources.find(
          source => source.type === 'organization' && source.orgURI === ownerAffiliationId
        );
      }

      // Set the selected tab
      if (matchingSource) {
        setSelectedGuidanceId(matchingSource.id);
      } else {
        // No match found, fall back to bestPractice
        setSelectedGuidanceId('bestPractice');
      }

      setIsInitialized(true);
    }
  }, [bestPracticeLoading, userAffiliationId, ownerAffiliationId, guidanceSources]);


  const toggleShowAllTabs = () => {
    setIsTransitioning(true);

    setShowAllTabs(!showAllTabs);

    // Clear transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200); // Match your fadeIn animation duration

  };

  // Show "More" button if there are more than the calculated visible tabs that fit in one row
  const hasOverflow = guidanceSources.length > visibleCount;

  return (
    <div className={`${styles.guidancePanel} ${!isInitialized ? styles.initializing : ''}`}>
      <Tabs
        selectedKey={selectedGuidanceId}
        onSelectionChange={(key) => setSelectedGuidanceId(String(key))}
        className={styles.guidanceTabs}
      >
        <div className={styles.tabListWrapper} ref={containerRef}>
          <div className={styles.tabsRow}>
            <TabList
              aria-label={t('guidanceSourceSelection')}
              className={styles.pillsContainer}
            >
              {/* Render all pills (hidden ones are positioned off-screen) */}
              {guidanceSources.map((source, index) => {
                const isVisible = showAllTabs || index < visibleCount;
                return (
                  <Tab
                    key={source.id}
                    id={source.id}
                    className={`
                      ${styles.pill} 
                      ${isTransitioning ? styles.transitioning : ''} 
                      ${isVisible ? styles.pillVisible : styles.pillHidden}
                      ${!isVisible && !showAllTabs ? styles.pillOffscreen : ''}
                    `}
                  >

                    {({ isSelected, isFocusVisible }) => (
                      <div
                        ref={(el) => { pillsRef.current[index] = el; }}
                        className={`
                        ${styles.pillInner} 
                        ${isSelected ? styles.pillSelected : ''} 
                        ${isFocusVisible ? styles.pillFocused : ''}
                      `}
                      >
                        <span>{source.shortName}</span>
                      </div>

                    )}
                  </Tab>
                );
              })}
            </TabList>

            {/* More button at end of first row */}
            {hasOverflow && !showAllTabs && (
              <Button
                className="toggle"
                onPress={toggleShowAllTabs}
                aria-expanded={showAllTabs}
                aria-label={t('ariaLabels.showMoreGuidance')}
              >
                {t('more')} <span aria-hidden="true">&#9660;</span>
              </Button>
            )}
          </div>

          {/* Action Buttons - Below tabs when expanded */}
          {hasOverflow && showAllTabs && (
            <div className={styles.actionButtons}>
              <Button
                className="toggle"
                onPress={toggleShowAllTabs}
                aria-expanded={showAllTabs}
                aria-label={t('ariaLabels.showLessGuidance')}
              >
                {t('less')} <span aria-hidden="true">&#9650;</span>
              </Button>
              {onAddOrganization && (
                <Button
                  className="link"
                  onPress={onAddOrganization}
                  aria-label={t('addGuidanceSource')}
                >
                  <DmpIcon icon="plus" />
                  <span>{t('addOrganization')}</span>
                </Button>
              )}
            </div>
          )}

          {/* Add Organization button when no overflow */}
          {!hasOverflow && onAddOrganization && (
            <div className={`${styles.actionButtons} ${styles.singleRow}`}>
              <Button
                className="link"
                onPress={onAddOrganization}
                aria-label={t('addGuidanceSource')}
              >
                <span>{t('addOrganization')}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Tab Panels (Content) */}
        {guidanceSources.map((source) => (
          <TabPanel key={source.id} id={source.id} className={styles.guidanceContent}>
            {renderGuidanceContentForSource(source, Global)}
          </TabPanel>
        ))}
      </Tabs>
    </div >
  );
};

// Helper function to render content based on source type
const renderGuidanceContentForSource = (source: GuidanceSource, Global: (key: string, values?: Record<string, string | number>) => string) => {
  switch (source.type) {
    case 'bestPractice':
      return (
        <>
          <div className={styles.headerWithLogo}>
            <h2 className="h4">{Global('bestPractice')}</h2>
            <Image
              className={styles.Logo}
              src="/images/DMP-logo.svg"
              width="140"
              height="16"
              alt="DMP Tool"
            />
          </div>
          <div className={styles.matchedGuidanceList}>
            {source.items?.map(g => {
              // Extract plain text to check length
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = g.guidanceText;
              const textContent = tempDiv.textContent || tempDiv.innerText || '';
              const needsExpansion = textContent.length > 100;
              return (
                <ExpandableContentSection
                  key={`guidance-${g.id}`}
                  id={`guidance-${g.id}`}
                  heading={g.title || ''}
                  expandLabel={Global('links.expand')}
                  summaryCharLimit={needsExpansion ? 100 : undefined}
                >
                  {parse(g.guidanceText)}
                </ExpandableContentSection>
              );
            })}
          </div>
        </>
      );

    case 'organization':
      return (
        <>
          <div className={styles.matchedGuidanceList}>
            <h2 className="h4">{source.label}</h2>
            {source.items?.map(g => {
              // Extract text from HTML to check if we need expandable section
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = g.guidanceText;
              const textContent = tempDiv.textContent || tempDiv.innerText || '';
              const needsExpansion = textContent.length > 100;

              return (
                <ExpandableContentSection
                  key={`guidance-${g.id}`}
                  id={`guidance-${g.id}`}
                  heading={(source.label !== g.title) ? g.title : undefined}
                  expandLabel={Global('links.expand')}
                  summaryCharLimit={needsExpansion ? 100 : undefined}
                >
                  {parse(g.guidanceText)}
                </ExpandableContentSection>
              );
            })}
          </div>
        </>
      );

    default:
      return null;
  }
};

export default GuidancePanel;