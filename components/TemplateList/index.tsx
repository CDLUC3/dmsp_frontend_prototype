import React, { useRef } from 'react';
import { Button, Link } from 'react-aria-components';
import { useTranslations } from 'next-intl';
import TemplateSelectListItem from "@/components/TemplateSelectListItem";
import { TemplateItemProps } from '@/app/types';
import styles from './templateList.module.scss';

// Define the possible keys for visibleCount object
export type VisibleCountKeys = 'publicTemplatesList' | 'templates' | 'filteredTemplates' | 'filteredPublicTemplates';

// Define the shape of the visibleCount object
export interface VisibleCount {
  publicTemplatesList: number;
  templates: number;
  filteredTemplates: number;
  filteredPublicTemplates: number;
}

// Define the props interface for TemplateList component
export interface TemplateListProps {
  /** Array of template items to display */
  templates: TemplateItemProps[];
  /** Key to identify which list is being displayed */
  visibleCountKey: VisibleCountKeys;
  /** Callback function when a template is selected */
  onSelect: (versionedTemplateId: number) => Promise<void>;
  /** Object containing count of visible items for each list type */
  visibleCount: VisibleCount;
  /** Callback function to load more items */
  handleLoadMore: (key: VisibleCountKeys) => void;
  /** Callback function to reset search results */
  resetSearch: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  visibleCountKey,
  onSelect,
  visibleCount,
  handleLoadMore,
  resetSearch
}) => {
  const nextSectionRef = useRef<HTMLDivElement>(null);
  //Localization keys
  const SelectTemplate = useTranslations('TemplateSelectTemplatePage');


  const handleLoadMorePress = (listKey: VisibleCountKeys) => {

    // load more
    handleLoadMore(listKey);

    //scroll to next section
    setTimeout(() => {
      if (nextSectionRef.current) {
        nextSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  }
  return (
    <>
      {(visibleCountKey === 'filteredTemplates' || visibleCountKey === 'filteredPublicTemplates') && (
        <>
          {(() => {
            const numOfResults = templates.length;
            return (
              <>
                <div className={styles.searchMatchText}> {SelectTemplate('resultsText', { name: numOfResults })} - <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>clear filter</Link></div>
              </>
            );
          })()}
        </>
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
            {(() => {
              const loadMoreNumber = templates.length - visibleCount[visibleCountKey]; // Calculate loadMoreNumber
              const currentlyDisplayed = visibleCount[visibleCountKey];
              const totalAvailable = templates.length;
              return (
                <>
                  <Button onPress={() => handleLoadMorePress(visibleCountKey)}>
                    {loadMoreNumber > 2
                      ? SelectTemplate('buttons.load3More')
                      : SelectTemplate('buttons.loadMore', { name: loadMoreNumber })}
                  </Button>
                  <div className={styles.remainingText}>
                    {SelectTemplate('numDisplaying', { num: currentlyDisplayed, total: totalAvailable })}
                  </div>
                </>
              );
            })()}
          </>
        )}
        {(visibleCountKey === 'filteredTemplates' || visibleCountKey === 'filteredPublicTemplates') && (
          <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>{SelectTemplate('clearFilter')}</Link>
        )
        }
      </div>
    </>
  );
};

export default TemplateList;