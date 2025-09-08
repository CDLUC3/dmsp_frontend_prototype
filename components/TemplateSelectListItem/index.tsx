import { Button } from 'react-aria-components';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './TemplateSelectListItem.module.scss';
import { useToast } from '@/context/ToastContext';
import { toTitleCase } from '@/utils/general';
interface TemplateSelectListItemProps {
  onSelect?: (versionedTemplateId: number) => Promise<void>;
  item: {
    id?: number | null;
    link?: string | null;
    template?: {
      id?: number | null;
    },
    funder?: string | null;
    title: string;
    description?: string;
    lastRevisedBy?: string | null;
    lastUpdated?: string | null;
    publishStatus?: string | null;
    publishDate?: string | null;
    visibility?: string | null;
    hasAdditionalGuidance?: boolean;
  }
}

function TemplateSelectListItem({ item, onSelect }: TemplateSelectListItemProps) {
  const toastState = useToast();

  //Localization keys
  const SelectListItem = useTranslations('TemplateSelectListItem');
  const Global = useTranslations('Global');

  // Create unique IDs for ARIA relationships
  const headingId = `${item.title.toLowerCase().replace(/\s+/g, '-')}-heading`;

  return (
    <div className={styles.templateItem} role="listitem" data-testid="template-list-item">
      <div className={styles.TemplateItemInner}>
        <div className={styles.TemplateItemContent}>
          <div className={styles.funder}>{item.funder}</div>
          {onSelect ? (
            <h3 className={styles.TemplateItemHeading}>{item.title}</h3>
          ) : (
            <h3 id={headingId}>
              {item.link ? (
                <Link href={item.link} aria-label={`${Global('links.update')} ${item.title}`}
                  className={styles.titleLink}>
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </h3>
          )}
          {item.description &&
            <p className={styles.description}>{item.description}</p>}

          <div className={styles.metadata} data-testid="template-metadata">
            <span>{Global('lastRevisedBy')}: {item.lastRevisedBy}</span>
            <span
              className={styles.separator}>{Global('lastUpdated')}: {item.lastUpdated}
            </span>
            {item.publishStatus && item.publishStatus.length > 0 && (
              <span
                className={styles.separator}>
                {item.publishStatus}
                {item?.publishDate ? ` (${item.publishDate})` : ''}
              </span>
            )}

            <span className={styles.separator}>
              {Global('visibility')}: {item.visibility ? toTitleCase(item.visibility) : ''}
            </span>
          </div>

          {item.hasAdditionalGuidance && (
            <div className={styles.guidance}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" />
                <path d="M6.5 10L9 12.5L13.5 8" stroke="currentColor"
                  strokeLinecap="round" />
              </svg>
              {SelectListItem('messages.additionalGuidance')}
            </div>
          )}
        </div>

        {onSelect ? (
          <Button
            onPress={async () => {
              if (typeof item?.id === 'number') {
                await onSelect(item.id);
              } else {
                toastState.add('Invalid template', { type: 'error' })
              }
            }}
            aria-label={`Select ${item.title}`}
            data-versioned-template-id={item?.id}
          >
            {Global('buttons.select')}
          </Button>
        ) : (
          <div className={styles.TemplateItemActions}>
            {item.link && (
              <Link href={item.link} aria-label={`${Global('links.update')} ${item.title}`}
                className={styles.updateLink}>
                {Global('links.update')}
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default TemplateSelectListItem;
