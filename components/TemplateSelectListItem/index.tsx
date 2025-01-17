import { useRouter } from 'next/navigation';
import { Button } from 'react-aria-components';
import styles from './TemplateSelectListItem.module.scss';

interface TemplateSelectListItemProps {
  templateId: number | null;
  item: {
    funder?: string | undefined;
    title: string;
    description?: string;
    lastRevisedBy?: number;
    lastUpdated?: string | null;
    hasAdditionalGuidance?: boolean;
  },
}

function TemplateSelectListItem({ item, templateId }: TemplateSelectListItemProps) {
  const router = useRouter();
  const handleClick = (templateId: string) => {
    router.push(`/template/${templateId}`)
  }
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
          onPress={() => handleClick(templateId ? templateId.toString() : '')}
          aria-label={`Select ${item.title}`}
        >
          Select
        </Button>
      </div>
    </div>
  );
}

export default TemplateSelectListItem;
