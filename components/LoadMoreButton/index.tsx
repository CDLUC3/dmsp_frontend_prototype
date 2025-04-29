import React from 'react';
import {useTranslations} from 'next-intl';
import styles from './LoadMoreButton.module.scss';
import { PaginableFeed } from '@/app/types';
import { Button } from 'react-aria-components';

interface LoadMoreButtonProps {
  paginableFeed?: PaginableFeed;
  onPress?: () => void;
  pageSize?: number;
  className?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  paginableFeed,
  onPress,
  pageSize = 10,
  className = '',
}) => {
  const Global = useTranslations('Global');

  if (paginableFeed?.cursor) {
    const totalAvailable = paginableFeed?.totalCount || 0;
    const currentlyDisplayed = Array.isArray(paginableFeed?.feed) ? paginableFeed.feed.length : 0;
    const numberLeft = totalAvailable - currentlyDisplayed;
    const buttonName = numberLeft < pageSize ? numberLeft : pageSize;

    if (numberLeft > 0) {
      return (
        <div className={`${styles.loadBtnContainer} ${className}`.trim()}>
          <Button onPress={onPress}>
            {Global('buttons.loadMore', { name: buttonName })}
          </Button>
          <div className={styles.remainingText}>
            {Global('helpText.numDisplaying', { num: currentlyDisplayed, total: totalAvailable })}
          </div>
        </div>
      );
    } else {
      return (
        <div className={`${styles.container} ${className}`.trim()}>
          <div className={styles.remainingText}>
            {Global('helpText.numDisplaying', { num: currentlyDisplayed, total: totalAvailable })}
          </div>
        </div>
      );
    }
  }
  return null;
};

export default LoadMoreButton;