import styles from './editorSkeleton.module.scss';

const EditorSkeleton = () => {
  return (
    <div
      className={styles['editor-skeleton']}
      role="status"
      aria-label="Editor loading"
    >
      {/* Toolbar skeleton */}
      <div className={styles['skeleton-toolbar']}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`${styles['skeleton-block']} ${i === 0 ? styles['skeleton-block-wide'] : ''}`}
          />
        ))}
      </div>
      {/* Content area skeleton */}
      <div className={styles['skeleton-content']}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`${styles['skeleton-line']} ${i === 2 ? styles['skeleton-line-short'] : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorSkeleton;
