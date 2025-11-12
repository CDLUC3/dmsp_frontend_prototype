'use client';

import { useTranslations } from 'next-intl';

import {
  Checkbox,
  Link,
} from "react-aria-components";
import { MemberRole } from '@/generated/graphql';
import { CheckboxGroupComponent } from "@/components/Form";

// Utils
import styles from './ProjectsProjectMembers.module.scss';

interface RolesInterface {
  roles: string[];
  handleCheckboxChange: (newValues: string[]) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  memberRoles: MemberRole[];
}

const ProjectRoles = ({ roles, handleCheckboxChange, isInvalid, errorMessage, memberRoles }: RolesInterface) => {
  // Translation keys
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectMembersSearch');

  // Description for the member roles checkbox radio group
  const rolesDescription = t.rich('memberRolesDescription', {
    p: (chunks) => <p>{chunks}</p>,
    link: (chunks) => (
      <Link href="https://credit.niso.org/" target="_blank" rel="noopener noreferrer">
        {chunks}
        <span className="hidden-accessibly">({Global('opensInNewTab')})</span>
      </Link>
    )
  });

  return (
    <>
      <div className={styles.memberRoles}>
        <CheckboxGroupComponent
          name="memberRoles"
          value={roles}
          checkboxGroupLabel={t('labels.definedRole')}
          checkboxGroupDescription={rolesDescription}
          onChange={(newValues) => handleCheckboxChange(newValues)}
          isRequired={false}
          isInvalid={isInvalid}
          errorMessage={errorMessage}
        >
          {memberRoles.map((role, index) => (
            <Checkbox key={role?.id ?? index} value={role?.id?.toString() ?? ''} aria-label={t('labels.ariaMemberRoles')}>
              <div className="checkbox">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              </div>
              <div className="">
                <span>
                  {role.label}
                </span>

              </div>
            </Checkbox>
          ))}
        </CheckboxGroupComponent>

      </div>

    </>
  );
};

export default ProjectRoles;
