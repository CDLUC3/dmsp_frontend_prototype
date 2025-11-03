import React from "react";
import { Button } from "react-aria-components";
import { useTranslations } from "next-intl";
import { OrcidIcon } from "@/components/Icons/orcid/";
import styles from "./ProjectMemberListItem.module.scss";

interface ProjectMemberInterface {
  id: number | null;
  fullName: string;
  affiliation: string;
  orcid: string;
  role: string;
}

interface ProjectMemberListItemProps {
  member: ProjectMemberInterface;
  onEdit?: (memberId: number | null) => void;
  className?: string;
}

const ProjectMemberListItem: React.FC<ProjectMemberListItemProps> = ({ member, onEdit, className = "" }) => {
  const ProjectMemberListItem = useTranslations("ProjectMemberListItem");

  const handleEdit = () => {
    if (onEdit) {
      onEdit(member.id);
    }
  };

  return (
    <div
      className={`${styles.memberItem} ${className}`}
      role="listitem"
      aria-label={`Project member: ${member.fullName}`}
      data-testid="project-member-list-item"
    >
      <div className={styles.memberItemWrapper}>
        <div className={styles.memberItemInner}>
          <div className={styles.memberItemContent}>
            <h3 className={styles.memberNameHeading}>{member.fullName}</h3>
            {member.orcid && (
              <div className={styles.orcid}>
                <span aria-hidden="true">
                  <OrcidIcon
                    icon="orcid"
                    classes={styles.orcidLogo}
                  />
                </span>
                <a
                  href={`https://orcid.org/${member.orcid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ProjectMemberListItem("ariaLabels.orcidProfile", { name: member.fullName })}
                >
                  {member.orcid}
                </a>
              </div>
            )}
          </div>

          <div className={styles.memberRole}>
            <p className={styles.role}>{member.role}</p>
          </div>

          {onEdit && (
            <div className={styles.memberItemActions}>
              <Button
                onPress={handleEdit}
                className="secondary"
                aria-label={ProjectMemberListItem("ariaLabels.editMember", { name: member.fullName })}
              >
                {ProjectMemberListItem("buttons.edit")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectMemberListItem;
export type { ProjectMemberInterface, ProjectMemberListItemProps };
