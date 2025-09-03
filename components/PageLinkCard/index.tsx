import React from 'react';
import Link from 'next/link';
import styles from './PageLinkCard.module.scss';

export interface PageLinkItem {
  title: string;
  description?: string;
  href: string;
  hasNotification?: boolean;
  notificationCount?: number;
}

export interface PageLinkSection {
  title: string;
  description?: string;
  items: PageLinkItem[];
}

interface PageLinkCardProps {
  sections: PageLinkSection[];
}

const PageLinkCard: React.FC<PageLinkCardProps> = ({ sections }) => {
  return (
    <div role="main" aria-label="Page link sections">
      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className={styles.adminSection} aria-labelledby={`section-${sectionIndex}`}>
          <h2 id={`section-${sectionIndex}`}>{section.title}</h2>
          {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
          <div className={styles.sectionGrid}>
            {section.items.map((item, itemIndex) => (
              <Link 
                key={itemIndex} 
                href={item.href} 
                className={styles.adminCard}
                aria-describedby={item.description ? `item-${sectionIndex}-${itemIndex}` : undefined}
              >
                <div className={styles.cardHeader}>
                  <h3>{item.title}</h3>
                  {item.hasNotification && (
                    <span className={styles.notificationBadge}>
                      {item.notificationCount} new notifications
                    </span>
                  )}
                </div>
                {item.description && <p id={`item-${sectionIndex}-${itemIndex}`}>{item.description}</p>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PageLinkCard;
