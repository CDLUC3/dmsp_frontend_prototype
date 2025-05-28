import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { TemplateItemProps } from '@/app/types';
import styles from './TemplateListItem.module.scss';


function TemplateListItem({ item }: { item: TemplateItemProps }) {
  const t = useTranslations('OrganizationTemplates');
  const Global = useTranslations('Global');


  // Create unique IDs for ARIA relationships
  const headingId = `${item.title.toLowerCase().replace(/\s+/g, '-')}-heading`;

  return (
    <div className={styles.templateItem} role="listitem">
      <div className={styles.TemplateItemInner}>
        <div className={styles.TemplateItemHeading}>
        <div className={styles.funder}>{item.funder}</div>
          <h3 id={headingId}>
            {item.link ? (
              <Link href={item.link} aria-label={`${t('linkUpdate')} ${item.title}`}
                className={styles.titleLink}>
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </h3>
          <div className={styles.metadata}>
            <span>{Global('lastRevisedBy')}: {item.lastRevisedBy}</span>
            <span
              className={styles.separator}>{Global('lastUpdated')}: {item.lastUpdated}
              </span>
              <span
              className={styles.separator}>
                {item.publishStatus === 'Published' ? Global('published') : Global('notPublished')}
              {item.publishDate && ` (${item.publishDate})`}
              </span>
              <span className={styles.separator}>
                {Global('visibility')}: {item.visibility}
                </span>
          </div>
        </div>

        <div className={styles.TemplateItemActions}>
          {item.link && (
            <Link href={item.link} aria-label={`${t('linkUpdate')} ${item.title}`}
              className={styles.updateLink}>
              {t('linkUpdate')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateListItem;
