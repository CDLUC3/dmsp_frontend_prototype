import {Button} from 'react-aria-components';
import {useTranslations} from 'next-intl';

import styles from './TemplateSelectListItem.module.scss';
import {useToast} from '@/context/ToastContext';

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
  }
}

function TemplateSelectListItem({item, onSelect}: TemplateSelectListItemProps) {
  const toastState = useToast();

  //Localization keys
  const SelectListItem = useTranslations('TemplateSelectListItem');
  const Global = useTranslations('Global');

  return (
    <div className={styles.templateItem} role="listitem">
      <div className={styles.TemplateItemInner}>
        <div className={styles.TemplateItemContent}>
          <div className={styles.funder}>{item.funder}</div>
          <h3 className={styles.TemplateItemHeading}>{item.title}</h3>
          {item.description &&
            <p className={styles.description}>{item.description}</p>}

          <div className={styles.metadata}>
            <span>{Global('lastRevisedBy')}: {item.lastRevisedBy}</span>
            <span
              className={styles.separator}>{Global('lastUpdated')}: {item.lastUpdated}</span>
          </div>

          {item.hasAdditionalGuidance && (
            <div className={styles.guidance}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor"/>
                <path d="M6.5 10L9 12.5L13.5 8" stroke="currentColor"
                      strokeLinecap="round"/>
              </svg>
              {SelectListItem('messages.additionalGuidance')}
            </div>
          )}
        </div>

        <Button
          onPress={async () => {
            if (typeof item?.id === 'number' && typeof item?.template?.id === 'number') {
              await onSelect(item.id);
            } else {
              toastState.add('Invalid template', {type: 'error'})
            }
          }}
          aria-label={`Select ${item.title}`}
          data-versioned-template-id={item?.id}
        >
          {Global('buttons.select')}
        </Button>
      </div>
    </div>
  );
}

export default TemplateSelectListItem;
