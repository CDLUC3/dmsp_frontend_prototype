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

// Components
import ExpandableContentSection from '@/components/ExpandableContentSection';
import { DmpIcon } from "@/components/Icons";
import { GuidanceItemInterface } from '@/app/types';
import styles from './GuidancePanel.module.scss';

interface MatchedGuidance {
  id?: number;
  title?: string;
  guidanceText: string;
}

interface GuidanceSource {
  id: string;
  type: 'bestPractice' | 'funder' | 'organization';
  label: string;
  shortName?: string | null;
  content?: string;
  items?: MatchedGuidance[];
  orgURI?: string;
}

interface GuidancePanelProps {
  // Organization guidance
  guidanceItems: GuidanceItemInterface[];
  // Tags assigned to the current section
  sectionTags: Record<number, string>;
  // Callbacks
  onAddOrganization?: () => void;
  onRemoveOrganization?: (orgId: string) => void;

  // Optional: control selected source externally
  selectedSourceId?: string;
  onSourceChange?: (sourceId: string) => void;
}

const GuidancePanel: React.FC<GuidancePanelProps> = ({
  guidanceItems,
  sectionTags,
  onAddOrganization,
  onRemoveOrganization,
  selectedSourceId: controlledSelectedId,
  onSourceChange
}) => {

  console.log("***Guidance Items:", guidanceItems);
  console.log("***Section Tags:", sectionTags);
  const Global = useTranslations('Global');
  const t = useTranslations('GuidancePanel');

  // Refs for measuring
  const containerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<(HTMLDivElement | null)[]>([]);
  const moreButtonRef = useRef<HTMLButtonElement>(null);


  // Internal state for uncontrolled usage
  const [internalSelectedId, setInternalSelectedId] = useState<string>('bestPractice');
  const [showAllTabs, setShowAllTabs] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(3); // Default to 3
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);


  // Query to get Best Practice guidance content
  const { data: bestPracticeGuidanceData } = useQuery(
    BestPracticeGuidanceDocument,
    {
      variables: {
        tagIds: Object.keys(sectionTags).map(Number)// Extract tag IDs from sectionTags and convert to numbers
      },
      notifyOnNetworkStatusChange: true
    }
  );

  // Use controlled or uncontrolled state
  const selectedGuidanceId = controlledSelectedId ?? internalSelectedId;
  const setSelectedGuidanceId = (id: React.Key) => {
    const idStr = String(id);
    if (onSourceChange) {
      onSourceChange(idStr);
    } else {
      setInternalSelectedId(idStr);
    }
  };

  // Build guidance sources
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

    // Add single best practice source with all items
    sources.push({
      id: 'bestPractice',
      type: 'bestPractice',
      label: "DMP Tool",
      shortName: 'DMP Tool',
      items: bestPracticeItems
    });

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

    const additionalGuidance = [
      {
        orgURI: 'https://ror.org/01an7q238',
        orgName: 'UC Berkeley',
        orgShortname: 'UCB',
        items: [
          {
            id: 1001,
            title: "UC Berkeley",
            guidanceText: '<p><strong>UC Berkeley Data Management:</strong> All research data must be stored on approved institutional storage systems. Consider using bDrive or Research Data Management services.</p>'
          },
          {
            id: 1002,
            title: "UC Berkeley",
            guidanceText: '<p>Ensure compliance with UC Berkeley\'s data retention policies. Data should be retained for a minimum of 3 years after publication.</p>'
          },
          {
            id: 1003,
            title: "UC Berkeley",
            guidanceText: '<p>For sensitive data, consult with the Office of Research Compliance and ensure appropriate IRB approval is obtained.</p>'
          }
        ]
      },
      {
        orgURI: 'https://ror.org/021nxhr62',
        orgName: 'National Science Foundation',
        orgShortname: 'NSF',
        items: [
          {
            id: 2001,
            title: "National Science Foundation",
            guidanceText: '<p><strong>NSF Requirements:</strong> Data sharing plans should describe how data will be shared and preserved, or explain why data sharing is not possible.</p>'
          },
          {
            id: 2002,
            title: "National Science Foundation",
            guidanceText: '<p>Data should be deposited in a recognized repository appropriate to your field of study. Consider using domain-specific repositories when available.</p>'
          }
        ]
      },
    ]

    // additionalGuidance.forEach((org, index) => {
    //   if (org.items.length > 0) {
    //     sources.push({
    //       id: `org-additional-${index}`,
    //       type: 'organization',
    //       label: org.orgName,
    //       shortName: org.orgShortname || null,
    //       items: org.items,
    //       orgURI: org.orgURI
    //     });
    //   }
    // });

    return sources;
  }, [guidanceItems, bestPracticeGuidanceData]);

  // Calculate how many pills can fit in first row
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


  // Ensure selected source exists
  useEffect(() => {
    if (guidanceSources.length > 0 && !guidanceSources.find(s => s.id === selectedGuidanceId)) {
      setSelectedGuidanceId(guidanceSources[0].id);
    }
  }, [guidanceSources, selectedGuidanceId]);

  const handleRemoveOrganization = (e: React.MouseEvent, sourceId: string, orgId?: string) => {
    e.stopPropagation();
    if (!orgId || !onRemoveOrganization) return;

    // If removing the currently selected source, switch to best practice
    if (selectedGuidanceId === sourceId) {
      setSelectedGuidanceId('bestPractice');
    }

    onRemoveOrganization(orgId);
  };

  const toggleShowAllTabs = () => {
    setIsTransitioning(true);

    setShowAllTabs(!showAllTabs);

    // Clear transition flag after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200); // Match your fadeIn animation duration

  };

  // Show more button if there are more than 3 tabs
  const hasOverflow = guidanceSources.length > visibleCount;

  return (
    <div className={styles.guidancePanel}>
      <Tabs
        selectedKey={selectedGuidanceId}
        onSelectionChange={setSelectedGuidanceId}
        className={styles.guidanceTabs}
      >
        <div className={styles.tabListWrapper} ref={containerRef}>
          <div className={styles.tabsRow}>
            <TabList aria-label={t('guidanceSourceSelection')} className={styles.pillsContainer}>
              {/* Render all pills for measurement (hidden ones are positioned off-screen) */}
              {guidanceSources.map((source, index) => {
                const isVisible = showAllTabs || index < visibleCount;
                return (
                  <Tab
                    key={source.id}
                    id={source.id}
                    className={`${styles.pill} ${isTransitioning ? styles.transitioning : ''}`}
                    style={{
                      visibility: isVisible ? 'visible' : 'hidden',
                      position: isVisible ? 'relative' : 'absolute',
                      pointerEvents: isVisible ? 'auto' : 'none',
                      // Add explicit positioning for hidden pills
                      ...((!isVisible && !showAllTabs) && {
                        top: 0,
                        left: '-9999px' // Move far off-screen
                      })
                    }}

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
                ref={moreButtonRef}
                className="toggle"
                onPress={toggleShowAllTabs}
                aria-expanded={showAllTabs}
                aria-label={t('showMore')}
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
                aria-label={t('showLess')}
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
              const needsExpansion = textContent.length > 200;

              return (
                <ExpandableContentSection
                  key={`guidance-${g.id}`}
                  id={`guidance-${g.id}`}
                  heading={(source.label !== g.title) ? g.title : undefined}
                  expandLabel={Global('links.expand')}
                  summaryCharLimit={needsExpansion ? 200 : undefined}
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