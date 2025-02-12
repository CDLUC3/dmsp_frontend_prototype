import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from 'react-aria-components';
import { ProjectItemProps } from '@/app/types';
import styles from './projectList.module.scss';


function ProjectListItem({ item }: { item: ProjectItemProps }) {
  const [expanded, setExpanded] = useState<boolean>(item.defaultExpanded);
  const t = useTranslations('OrganizationTemplates');
  const toggleExpand = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  console.log("***ITEM", item)

  // Create unique IDs for ARIA relationships
  const expandedContentId = `${item.title.toLowerCase().replace(/\s+/g, '-')}-content`;
  const headingId = `${item.title.toLowerCase().replace(/\s+/g, '-')}-heading`;

  return (
    <div className={styles.templateItem} role="listitem">
      <div className={styles.TemplateItemInner}>
        <div className={styles.TemplateItemHeading}>
          <div className="project-overview">
            <section
              className="project-overview-item project-header"
              aria-labelledby="project-title">
              <h2 id="project-title">Project</h2>
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
            </section>
          </div>
          <div className="project-overview">
            <section
              className="project-overview-item project-header"
              aria-labelledby="project-title">
              <h2 id="project-title">Project details</h2>
              <div className={styles.container}>
                <div className={styles.section}>
                  <h2 id="project-title">Dates</h2>
                  <p>{item.startDate} to {item.endDate}</p>
                </div>
                <div className={styles.section}>
                  <h2 id="project-title">Collaborators</h2>
                  {item.collaborators.map((collaborator, index) => (
                    <p key={index}>{collaborator.name}{collaborator.roles.length > 0 ? `(${collaborator.roles})` : ''}</p>
                  ))}

                </div>
                <div className={styles.section}>
                  <h2 id="project-title">Funding</h2>
                  <p>Content for section 3.</p>
                </div>
                <div className={styles.section}>
                  <h2 id="project-title">Research outputs</h2>
                  <p>Content for section 4.</p>
                </div>
              </div>
            </section>
          </div>
          <div className="template-content">
            <div className={styles.statusInfo}>
              {item.funder && (
                <>
                  <span className="sr-only">Funder:</span> {item.funder}
                </>
              )}
              {item.lastUpdated && (
                <>
                  {item.funder && <span className={styles.separator}>|</span>}
                  <span
                    className="sr-only">Last Updated:</span> {item.lastUpdated}
                </>
              )}
              {item.publishStatus && (
                <>
                  {(item.funder || item.lastUpdated) &&
                    <span className={styles.separator}>|</span>}
                  <span
                    className="sr-only">Publish Status:</span> {item.publishStatus}
                </>
              )}
            </div>



          </div>
        </div>

        <div className={styles.TemplateItemActions}>
          {item.link && (
            <Link href={item.link} aria-label={`${t('linkUpdate')} ${item.title}`}
              className={styles.updateLink}>
              {t('linkUpdate')}
            </Link>
          )}

          <Button
            aria-expanded={expanded}
            aria-controls={expandedContentId}
            aria-label={`${expanded ? t('linkCollapse') : t('linkExpand')} details for ${item.title}`}
            onPress={toggleExpand}
            className={styles.expandButton}
          >
            <span>{expanded ? t('linkCollapse') : t('linkExpand')}</span>
            <span className="sr-only">{t('details')}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 32 32"
              fill="none"
              className={`${styles.expandIcon} ${expanded ? styles.expanded : ''}`}
              aria-hidden="true"
            >
              <path
                d="M16.0002 19.9667C15.8225 19.9667 15.6504 19.9333 15.4842 19.8667C15.3171 19.8 15.178 19.7111 15.0669 19.6L8.93356 13.4667C8.68912 13.2222 8.56689 12.9111 8.56689 12.5333C8.56689 12.1556 8.68912 11.8444 8.93356 11.6C9.17801 11.3556 9.48912 11.2333 9.86689 11.2333C10.2447 11.2333 10.5558 11.3556 10.8002 11.6L16.0002 16.8L21.2002 11.6C21.4447 11.3556 21.7558 11.2333 22.1336 11.2333C22.5113 11.2333 22.8224 11.3556 23.0669 11.6C23.3113 11.8444 23.4336 12.1556 23.4336 12.5333C23.4336 12.9111 23.3113 13.2222 23.0669 13.4667L16.9336 19.6C16.8002 19.7333 16.6558 19.8276 16.5002 19.8827C16.3447 19.9387 16.178 19.9667 16.0002 19.9667Z"
                fill="black"
              />
            </svg>
          </Button>
        </div>
      </div>

      {expanded && (
        <div
          id={expandedContentId}
          className={styles.templateExpandedContent}
          role="region"
          aria-labelledby={headingId}
        >
          <p>{t('additionalInfo')}</p>
          <div>
            {item.content}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectListItem;
