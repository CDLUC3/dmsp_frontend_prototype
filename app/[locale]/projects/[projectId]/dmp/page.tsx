'use client';

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDate, DateValue, parseDate } from "@internationalized/date";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
  Radio,
  Text
} from "react-aria-components";

//GraphQL
import {
  ProjectErrors,
  useProjectQuery,
  useUpdateProjectMutation,
} from '@/generated/graphql';

//Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import {
  FormInput,
  FormTextArea,
  DateComponent,
  RadioGroupComponent
} from "@/components/Form";

import ErrorMessages from '@/components/ErrorMessages';
import ResearchDomainCascadingDropdown
  from '@/components/ResearchDomainCascadingDropdown';

import { getCalendarDateValue } from "@/utils/dateUtils";
import { scrollToTop } from '@/utils/general';
import { logECS, routePath } from '@/utils/index';
import { useToast } from '@/context/ToastContext';
import Loading from '@/components/Loading';


const ProjectsProjectPlanNew = () => {
  const toastState = useToast(); // Access the toast state from context

  // Get projectId param
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.projectId); // From route /projects/:projectId

  const REDIRECT_TO_DMP_CREATE = routePath('projects.dmp.create', { projectId });
  const REDIRECT_TO_DMP_UPLOAD = routePath('projects.dmp.upload', { projectId });

  // Localization keys
  const t = useTranslations('ProjectsProjectPlanNew');
  const Global = useTranslations('Global');

  const [dmpPlan, setDmpPlan] = useState({
    startNewPlan: 'true',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateProjectContent = (
    key: string,
    value: string
  ) => {
    setDmpPlan((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
  };

  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    updateProjectContent('startNewPlan', value);
  };

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if (dmpPlan.startNewPlan === 'true') {
      router.push(REDIRECT_TO_DMP_CREATE);
    } else {
      router.push(REDIRECT_TO_DMP_UPLOAD);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <PageHeader
            title={t('title')}
            description=""
            showBackButton={false}
            breadcrumbs={
              <Breadcrumbs>
                <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
                <Breadcrumb><Link
                  href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
                <Breadcrumb><Link
                  href={`/projects/${projectId}`}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
                <Breadcrumb>{t('title')}</Breadcrumb>
              </Breadcrumbs>
            }
            actions={null}
            className="page-project-list"
          />
          <LayoutContainer>
            <ContentContainer>
              <Form onSubmit={handleFormSubmit} className="project-detail-form">
                <div className="project-type-section">
                  <RadioGroupComponent
                    name="projectType"
                    value={dmpPlan.startNewPlan}
                    radioGroupLabel={t('labels.startNewOrUploadExisting')}
                    onChange={handleRadioChange}
                  >
                    <div>
                      <Radio value="true">{t('labels.startNewPlan')}</Radio>
                    </div>

                    <div>
                      <Radio value="false">{t('labels.uploadExistingPlan')}</Radio>
                    </div>
                  </RadioGroupComponent>
                </div>

                <Button type="submit" className="submit-button">{Global('buttons.save')}</Button>
              </Form>
            </ContentContainer>
          </LayoutContainer >
        </>
      )}
    </>
  );
};

export default ProjectsProjectPlanNew;
