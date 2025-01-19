import { useRouter } from 'next/navigation';
import { Button } from 'react-aria-components';

//GraphQL
import { useAddTemplateMutation } from '@/generated/graphql';
import styles from './TemplateSelectListItem.module.scss';

interface TemplateSelectListItemProps {
  onSelect: (versionedTemplateId: number) => Promise<void>;
  item: {
    id?: number | null;
    template?: {
      id?: number | null;
    },
    funder?: string | undefined;
    title: string;
    description?: string;
    lastRevisedBy?: number;
    lastUpdated?: string | null;
    hasAdditionalGuidance?: boolean;
  },
}

function TemplateSelectListItem({ item, onSelect }: TemplateSelectListItemProps) {

  return (
    <div className={styles.templateItem} role="listitem">
      <div className={styles.TemplateItemInner}>
        <div className={styles.TemplateItemContent}>
          <div className={styles.funder}>{item.funder}</div>
          <h3 className={styles.TemplateItemHeading}>{item.title}</h3>
          {item.description && <p className={styles.description}>{item.description}</p>}

          <div className={styles.metadata}>
            <span>Last revised by: {item.lastRevisedBy}</span>
            <span className={styles.separator}>Last updated: {item.lastUpdated}</span>
          </div>

          {item.hasAdditionalGuidance && (
            <div className={styles.guidance}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" />
                <path d="M6.5 10L9 12.5L13.5 8" stroke="currentColor" strokeLinecap="round" />
              </svg>
              Your research organization has additional guidance
            </div>
          )}
        </div>

        <Button
          onPress={async () => {
            if (typeof item?.id === 'number' && typeof item?.template?.id === 'number') {
              await onSelect(item.id);
            } else {
              console.error("item.id is not a valid number");
            }
          }}
          aria-label={`Select ${item.title}`}
          data-versioned-template-id={item?.id}
        >
          Select
        </Button>
      </div>
    </div>
  );
}

export default TemplateSelectListItem;
