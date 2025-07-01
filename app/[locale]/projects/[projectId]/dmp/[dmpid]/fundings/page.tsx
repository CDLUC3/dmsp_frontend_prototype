'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';

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
      // TODO::
      // Ask in developer meeting regarding the casing for this?
      // Everything else starts with lowercase, but the first key here
      // start with Uppercase
      // I cannot change this to start with lowercase, since I have to do
      // it in the mutation, and apollo will fail to generate cause it wants
      // it this way.
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
        title="Project Funding"
        description="Manage funding sources for your project"
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
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
              <Label>
                Select funding sources for this plan
              </Label>
              <Text slot="description" className="help">
                This funding list comes from the funding list attached to the project.
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
              <strong>
                Note: Changing the funding sources may require a template change. Only
                change if you are sure.
              </strong>
            </p>

            <Button
              type="submit"
            >
              Save
            </Button>
          </Form>


          <h2 className="heading-3 mt-8">
            Adding a funding source?
          </h2>
          <p>
            If you want to add new funding information, you can add funding at the
            project level. This project can have multiple funding sources, whereas each
            plan can only have a single source of funding as we match it to the required
            template.
          </p>
          <a href={"/projects/proj_2425/fundings/"} >
            Add a new funding source
          </a>

        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectPlanAdjustFunding;
