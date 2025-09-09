import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProjectItemProps } from '@/app/types';
import styles from './projectList.module.scss';
import ExpandButton from "@/components/ExpandButton";


function ProjectListItem({ item }: { item: ProjectItemProps }) {
  const [expanded, setExpanded] = useState<boolean>(item.defaultExpanded);
  const t = useTranslations('ProjectOverview');
  const Global = useTranslations('Global')

  // Create unique IDs for ARIA relationships
  const expandedContentId = `${item.title.toLowerCase().replace(/\s+/g, '-')}-content`;
  const headingId = `${item.title.toLowerCase().replace(/\s+/g, '-')}-heading`;

  return (
    <div className={styles.projectItem} role="listitem">
      <div className={styles.projectItemInner}>
        <div className={styles.projectItemHeading}>
          <div className="project-overview">
            <section
              className="project-overview-item project-header"
              aria-labelledby="project-title">
              <h2 id="project-title">{t('project')}</h2>
              <h3 id={headingId}>
                {item.link ? (
                  <Link href={item.link} aria-label={`${Global('buttons.linkUpdate')} ${item.title}`}
                    className={styles.titleLink}>
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}
              </h3>
            </section>
          </div>

        </div>

        <div className={styles.projectItemActions}>
          {item.link && (
            <Link href={item.link} aria-label={`${Global('buttons.linkUpdate')} ${item.title}`}
              className={styles.updateLink}>
              {Global('buttons.linkUpdate')}
            </Link>
          )}

          <ExpandButton
              aria-controls={expandedContentId}
              collapseLabel={Global('buttons.linkCollapse')}
              expandLabel={Global('buttons.linkExpand')}
              aria-label={`${expanded ? Global('buttons.linkCollapse') : Global('buttons.linkExpand')} details for ${item.title}`}
              screenReaderText={t('projectDetails')}
              expanded={expanded}
              setExpanded={setExpanded}
          />
        </div>
      </div>

      {expanded && (
        <div
          id={expandedContentId}
          className={styles.projectExpandedContent}
          role="region"
          aria-labelledby={headingId}
        >
          <div className={`project-overview ${styles.overview}`}>
            <section
              className="project-overview-item project-header"
              aria-labelledby="project-title">
              <h2 id="project-title" className={styles.projectDetails}>{t('projectDetails')}</h2>
              <div className={styles.container}>
                <div className={styles.section}>
                  <h3 id="project-title">{t('dates')}</h3>
                  <p>{item.startDate} to {item.endDate}</p>
                </div>
                <div className={styles.section}>
                  <h3 id="project-title">{t('collaborators')}</h3>
                  {item.members?.map((member, index) => (
                    <p key={index}>{member.name} {member.roles.length > 0 ? `(${member.roles})` : ''}</p>
                  ))}

                </div>
                <div className={styles.section}>
                  <h3 id="project-title">{t('funding')}</h3>
                  <p>{item.funding}</p>
                  {item?.grantId ? (
                    <p>{t('grantId')}: {item.grantId}</p>
                  ) : null}

                </div>
                <div className={styles.section}>
                  <h3 id="project-title">{t('researchOutputs')}</h3>
                  <p>TBD</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectListItem;
