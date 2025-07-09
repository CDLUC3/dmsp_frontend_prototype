'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  usePlanFundingsLazyQuery,
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
  Link,
} from "react-aria-components";

import { RadioButtonInterface } from '@/app/types';
import { RadioGroupComponent } from '@/components/Form';
import { useToast } from '@/context/ToastContext';

import PageHeader from "@/components/PageHeader";
import ErrorMessages from "@/components/ErrorMessages";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";


const ProjectsProjectPlanAdjustFunding = () => {
  const Global = useTranslations('Global');
  const t = useTranslations('PlanFunding');
  const Messaging = useTranslations('Messaging');

  const [radioData, setRadioData] = useState<RadioButtonInterface[]>([])
  const [fundingChoice, setFundingChoice] = useState<string>("");
  const [fetchPlanFundings, { }] = usePlanFundingsLazyQuery({});

  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const [addPlanFunding] = useAddPlanFundingMutation({});

  const toastState = useToast();
  const path = usePathname();
  const router = useRouter();
  const params = useParams();

  // NOTE:
  // The dmpid here comes with a lowercase I (dmpid instead of dmpId).
  // This is because the folder is named lowercased.
  // We might create a ticket to rename the folder to sentence-cased in future,
  // But a discussion is required as well.
  const { projectId, dmpid: dmpId } = params;

  const { data: funders } = useProjectFundingsQuery({
    variables: {
      projectId: Number(projectId),
    }
  });

  useEffect(() => {
    if (dmpId) {
      // Now that we have a dmpId from the params, fetch the existing funding
      // selection for the plan. We use this to set the initial value in the
      // options.
      fetchPlanFundings({
        variables: {
          planId: Number(dmpId)
        }
      }).then(({ data }) => {
        if (data?.planFundings && data?.planFundings?.length > 0) {
          const current = data.planFundings[0]?.projectFunding?.id;
          setFundingChoice(String(current));
        } else {
          setFundingChoice("");
        }
      });
    }
  }, [dmpId]);


  // Once we have the list of funders, we need to prepare the radio button
  // data for the RadioGroupComponent
  useEffect(() => {
    if (funders?.projectFundings) {
      const dataMap: RadioButtonInterface[] = [];
      funders.projectFundings.forEach((funder) => {
        const displayName = funder?.affiliation?.displayName;

        if (funder && displayName) {
          dataMap.push({
            value: String(funder.id),
            label: displayName!,
          });
        }
      });
      setRadioData(dataMap);
    }
  }, [funders]);


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
        const msg = Messaging('successfullyUpdated');
        toastState.add(msg, { type: 'success' });
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
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            {projectId && dmpId && (
              <>
                <Breadcrumb>
                  <Link href={routePath('projects.show', { projectId: String(projectId) })}>
                    {Global('breadcrumbs.project')}
                  </Link>
                </Breadcrumb>
                <Breadcrumb>
                  <Link href={routePath('projects.dmp.show', {
                    projectId: String(projectId),
                    dmpId: String(dmpId)
                  })}>
                    {Global('breadcrumbs.planOverview')}
                  </Link>
                </Breadcrumb>
              </>
            )}
            <Breadcrumb>
              {Global('breadcrumbs.planFunding')}
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
            <RadioGroupComponent
              name="funding"
              value={fundingChoice}
              onChange={setFundingChoice}
              description={t('fundingDescription')}
              radioGroupLabel={t('fundingLabel')}
              radioButtonData={radioData}
            />

            <p>
              <strong>{t('changeWarning')}</strong>
            </p>

            <Button type="submit">{Global('buttons.save')}</Button>
          </Form>

          <h2 className="heading-3 mt-8">{t('addSourceTitle')}</h2>
          <p>{t('addSourceNote')}</p>
          <Link href={routePath('projects.fundings.search', { projectId: String(projectId) })}>
            {t('addSourceLink')}
          </Link>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectPlanAdjustFunding;
