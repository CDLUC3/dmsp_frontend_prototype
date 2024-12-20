import React from 'react';
import styles from './editor.module.scss';

export const EditorSkeleton: React.FC = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonToolbar}>
        <div className={styles.skeletonButton}></div>
        <div className={styles.skeletonButton}></div>
        <div className={styles.skeletonButton}></div>
      </div>
      <div className={styles.skeletonEditor}></div>
    </div>
  );
};