'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  useProjectFundingsQuery,
  useAddPlanFundingMutation,
  PlanFundingErrors,
} from '@/generated/graphql';

import { routePath } from '@/utils/routes';
import logECS from '@/utils/clientLogger';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  Text,
} from "react-aria-components";

import PageHeader from "@/components/PageHeader";
import ErrorMessages from "@/components/ErrorMessages";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";


const ProjectsProjectPlanAdjustFunding = () => {
  const global = useTranslations('Global');
  const t = useTranslations('PlanFunding');

  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const [addPlanFunding] = useAddPlanFundingMutation({});

  const path = usePathname();
  const router = useRouter();
  const params = useParams();

  // NOTE:
  // The dmpid here comes with a lowercase I (dmpid instead of dmpId).
  // This is because the folder is named lowercased.
  // We might create a ticket to rename the folder to sentence-cased in future,
  // But a discussion is required as well.
  const { projectId, dmpid: dmpId } = params;

  const {data: funders} = useProjectFundingsQuery({
    variables: {
      projectId: Number(projectId),
    }
  });

  /**
   * Handle specific errors that we care about in this component.
   * @param {ProjectFunderErrors} errs - The errors from the graphql response
   */
  function checkErrors(errs: PlanFundingErrors): string[] {
    const typedKeys: (keyof PlanFundingErrors)[] = [
      "ProjectFundingId",
      "general",
      "projectId",
    ];
    const newErrors: string[] = [];

    for (const k of typedKeys) {
      const errVal = errs[k];
      if (errVal) {
        newErrors.push(errVal);
      }
    }

    return newErrors
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const NEXT_URL = routePath('projects.dmp.show', {
      projectId: projectId as string,
      dmpId: dmpId as string,
    });

    const formData = new FormData(e.currentTarget);
    const projectFundingId = formData.get("funding");

    addPlanFunding({
      variables: {
        planId: Number(dmpId),
        projectFundingId: Number(projectFundingId),
      },
    }).then((result) => {
        const errs = checkErrors(result?.data?.addPlanFunding?.errors as PlanFundingErrors);
        if (errs.length > 0) {
          setErrors(errs);
        } else {
          router.push(NEXT_URL);
        }
    }).catch(err => {
      logECS('error', 'addPlanFunding', {
        error: err.message,
        url: { path }
      });
    });
  }

  return (
    <>
      <PageHeader
        title={t('headerTitle')}
        description={t('headerDescription')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{global('breadcrumbs.projects')}</Link></Breadcrumb>
            {projectId && dmpId && (
              <>
                <Breadcrumb>
                  <Link href={routePath('projects.show', {projectId: String(projectId)})}>
                    {global('breadcrumbs.project')}
                  </Link>
                </Breadcrumb>
                <Breadcrumb>
                  <Link href={routePath('projects.dmp.show', {
                    projectId: String(projectId),
                    dmpId: String(dmpId)
                  })}>
                    {global('breadcrumbs.planOverview')}
                  </Link>
                </Breadcrumb>
              </>
            )}
            <Breadcrumb>
              {global('breadcrumbs.planFunding')}
            </Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-fundings"
      />
      <LayoutContainer>
        <ContentContainer>
          <ErrorMessages errors={errors} ref={errorRef} />
          <Form onSubmit={handleSubmit}>
            <RadioGroup name="funding">
              <Label>{t('fundingLabel')}</Label>
              <Text slot="description" className="help">
                {t('fundingDescription')}
              </Text>

              {funders?.projectFundings && funders.projectFundings.map((funder, index) => (
                <Radio
                  key={index}
                  value={String(funder?.id)}
                >
                  {funder?.affiliation?.displayName}
                </Radio>
              ))}

            </RadioGroup>

            <p>
              <strong>{t('changeWarning')}</strong>
            </p>

            <Button type="submit">{global('buttons.save')}</Button>
          </Form>

          <h2 className="heading-3 mt-8">{t('addSourceTitle')}</h2>
          <p>{t('addSourceNote')}</p>
          <Link href={routePath('projects.fundings.search', {projectId: String(projectId)})}>
            {t('addSourceLink')}
          </Link>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectPlanAdjustFunding;
