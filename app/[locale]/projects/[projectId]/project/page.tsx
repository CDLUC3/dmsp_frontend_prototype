'use client';

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  CalendarDate,
  parseDate,
  DateValue
} from "@internationalized/date";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  Form,
  Group,
  Heading,
  Label,
  Link,
  Popover,
} from "react-aria-components";

//GraphQL
import {
  useProjectQuery,
  useUpdateProjectMutation,
  ProjectErrors,
} from '@/generated/graphql';

//Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer
} from "@/components/Container";
import {
  FormInput,
  RadioGroupComponent
} from "@/components/Form";
import ErrorMessages from '@/components/ErrorMessages';
import ResearchDomainCascadingDropdown from '@/components/ResearchDomainCascadingDropdown';

import { getCalendarDateValue } from "@/utils/dateUtils";
import { scrollToTop } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';

interface ProjectFormErrorsInterface {
  projectName: string;
  projectAbstract: string;
}

interface ProjectDetailsFormInterface {
  projectName: string;
  projectAbstract: string;
  startDate: string | CalendarDate | null;
  endDate: string | CalendarDate | null;
  researchDomainId: string | number;
  isTestProject: string | boolean;
  parentResearchDomainId: string | number;
}

const ProjectsProjectDetail = () => {
  const toastState = useToast(); // Access the toast state from context

  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [projectData, setProjectData] = useState<ProjectDetailsFormInterface>({
    projectName: '',
    projectAbstract: '',
    startDate: '',
    endDate: '',
    researchDomainId: '',
    isTestProject: 'true',
    parentResearchDomainId: ''
  });
  const [fieldErrors, setFieldErrors] = useState<ProjectFormErrorsInterface>({
    projectName: '',
    projectAbstract: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Localization keys
  const ProjectOverview = useTranslations('ProjectOverview');
  const ProjectDetail = useTranslations('ProjectsProjectDetail');
  const Global = useTranslations('Global');

  const radioData = {
    radioGroupLabel: ProjectDetail('labels.projectType'),
    radioButtonData: [
      {
        value: 'true',
        label: ProjectDetail('labels.mockProject')
      },
      {
        value: 'false',
        label: ProjectDetail('labels.realProject')
      }
    ]
  }

  // Initialize useUpdateProjectMutation
  const [updateProjectMutation] = useUpdateProjectMutation();

  // Get Project using projectId
  const { data, loading } = useProjectQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      projectName: '',
      projectAbstract: ''
    });
  }


  // Client-side validation of fields
  /*eslint-disable @typescript-eslint/no-explicit-any */
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'projectName':
        if (!value || value.length <= 2) {
          return ProjectDetail('messages.errors.projectName');
        }
        break;
    }
    return '';
  };

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    const errors: ProjectFormErrorsInterface = {
      projectName: '',
      projectAbstract: ''
    };

    let hasError = false;

    // Validate all fields and collect errors
    Object.keys(projectData).forEach((key) => {
      const name = key as keyof ProjectFormErrorsInterface;
      const value = projectData[name];
      const error = validateField(name, value);

      if (error) {
        hasError = true;
        errors[name] = error;
      }
    });

    // Update state with all errors
    setFieldErrors(errors);
    if (errors) {
      setErrors(Object.values(errors).filter((e) => e)); // Store only non-empty error messages
    }

    return !hasError;
  };

  const updateProjectContent = (
    key: string,
    value: string | DateValue | boolean | number
  ) => {
    setProjectData((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
  };

  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    updateProjectContent('isTestProject', value);
  };

  // Make GraphQL mutation request to update section
  const updateProject = async (): Promise<ProjectErrors> => {
    // Convert any CalendarDate objects to strings before submission
    const submissionData = {
      startDate: projectData.startDate instanceof CalendarDate ?
        projectData.startDate.toString() : projectData.startDate,
      endDate: projectData.endDate instanceof CalendarDate ?
        projectData.endDate.toString() : projectData.endDate,
      isTestProject: projectData.isTestProject === 'true'
    };

    try {
      const response = await updateProjectMutation({
        variables: {
          input: {
            id: Number(projectId),
            title: projectData.projectName,
            abstractText: projectData.projectAbstract,
            researchDomainId: projectData.researchDomainId ? Number(projectData.researchDomainId) : null,
            ...submissionData
          }
        }

      });

      if (response.data?.updateProject?.errors) {
        return response.data.updateProject.errors;
      }
    } catch (error) {
      logECS('error', 'updateProjectMutation', {
        error,
        url: { path: '/projects/[projectId]/project' }
      });
      if (error instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, error.message]);
      } else {
        setErrors(prevErrors => [...prevErrors, "Error updating project"]);
      }
    }
    return {};
  };

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = ProjectDetail('messages.success.projectUpdated');
    toastState.add(successMessage, { type: 'success' });
    // Scroll to top of page
    scrollToTop(topRef);
  }


  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous error messages
    clearAllFieldErrors();
    setErrors([]);

    if (isFormValid()) {
      // Create new section
      const errors = await updateProject();

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors && Object.values(errors).filter((err) => err && err !== 'ProjectErrors').length > 0) {
        setFieldErrors({
          projectName: errors.title || '',
          projectAbstract: errors.abstractText || '',
        });

        setErrors([errors.general || ProjectDetail('messages.errors.projectUpdateFailed')]);
      } else {
        // Show success message
        showSuccessToast();
      }
    }
  };

  useEffect(() => {
    // Update project values from data results
    if (data?.project) {
      const project = data.project;
      // Convert string dates to CalendarDate objects when setting initial state
      const startDate = project.startDate ?
        (typeof project.startDate === 'string' ? parseDate(project.startDate) : project.startDate) :
        null;

      const endDate = project.endDate ?
        (typeof project.endDate === 'string' ? parseDate(project.endDate) : project.endDate) :
        null;

      setProjectData({
        projectName: project.title,
        projectAbstract: project?.abstractText ? project.abstractText : '',
        startDate,
        endDate,
        researchDomainId: project.researchDomain?.id ? project.researchDomain.id : '',
        parentResearchDomainId: project.researchDomain?.parentResearchDomain?.id ? project.researchDomain.parentResearchDomain.id : '',
        isTestProject: project.isTestProject ? project.isTestProject.toString() : 'false'
      })
    }
  }, [data])

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <div ref={topRef} />
      <PageHeader
        title={ProjectDetail('title')}
        description={ProjectDetail('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs aria-label={ProjectOverview('navigation')}>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link
              href={`/projects/${projectId}`}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb>{ProjectDetail('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className="page-project-list"
      />
      <LayoutContainer>
        <ContentContainer>
          <ErrorMessages errors={errors} ref={errorRef} />
          <Form onSubmit={handleFormSubmit} className="project-detail-form">
            <FormInput
              name="projectName"
              type="text"
              isRequired={true}
              label={ProjectDetail('labels.projectName')}
              value={projectData.projectName}
              onChange={(e) => updateProjectContent('projectName', e.target.value)}
              isInvalid={(!projectData.projectName || !!fieldErrors.projectName)}
              errorMessage={fieldErrors.projectName.length > 0 ? fieldErrors.projectName : ProjectDetail('messages.errors.projectName')}
            />

            <FormInput
              name="projectAbstract"
              type="text"
              isRequired={false}
              label={ProjectDetail('labels.projectAbstract')}
              value={projectData.projectAbstract}
              onChange={(e) => updateProjectContent('projectAbstract', e.target.value)}
              isInvalid={!!fieldErrors.projectAbstract}
              errorMessage={fieldErrors.projectAbstract.length > 0 ? fieldErrors.projectAbstract : ProjectDetail('messages.errors.projectAbstract')}
            />

            <div className="date-range-group">
              <DatePicker
                name="startDate"
                value={getCalendarDateValue(projectData.startDate)}
                onChange={(newDate) => {
                  // Store the CalendarDate object directly
                  updateProjectContent('startDate', newDate);
                }}
              >
                <Label>{Global('labels.startDate')}</Label>
                <Group>
                  <DateInput>
                    {(segment) => <DateSegment segment={segment} />}
                  </DateInput>
                  <Button>▼</Button>
                </Group>
                <Popover>
                  <Dialog>
                    <Calendar>
                      <header>
                        <Button slot="previous">◀</Button>
                        <Heading />
                        <Button slot="next">▶</Button>
                      </header>
                      <CalendarGrid>
                        {(date) => <CalendarCell date={date} />}
                      </CalendarGrid>
                    </Calendar>
                  </Dialog>
                </Popover>
              </DatePicker>

              <DatePicker
                name="endDate"
                value={getCalendarDateValue(projectData.endDate)}
                onChange={(newDate) => {
                  // Store the CalendarDate object directly
                  updateProjectContent('endDate', newDate);
                }}
              >
                <Label>{Global('labels.endDate')}</Label>
                <Group>
                  <DateInput>
                    {(segment) => <DateSegment segment={segment} />}
                  </DateInput>
                  <Button>▼</Button>
                </Group>
                <Popover>
                  <Dialog>
                    <Calendar>
                      <header>
                        <Button slot="previous">◀</Button>
                        <Heading className={"text-sm"} />
                        <Button slot="next">▶</Button>
                      </header>
                      <CalendarGrid>
                        {(date) => <CalendarCell date={date} />}
                      </CalendarGrid>
                    </Calendar>
                  </Dialog>
                </Popover>
              </DatePicker>
            </div>

            <ResearchDomainCascadingDropdown projectData={projectData} setProjectData={setProjectData} />

            <div className="form-signpost  my-8">
              <div className="form-signpost-inner">
                <div className="">
                  <p className="text-sm">
                    {ProjectDetail('paragraphs.para1')}
                  </p>
                </div>
                <div className="form-signpost-button">
                  <Button
                    className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800"
                    onPress={() => window.location.href = '/projects/search'}
                  >
                    {ProjectDetail('buttons.searchProjects')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="project-type-section">
              {projectData.isTestProject === 'true' && (
                <>
                  <h2>{ProjectDetail('headings.h2MockProject')}</h2>
                  <p className={"help"}>
                    {ProjectDetail('paragraphs.mockProject')}
                  </p>
                </>
              )}

              <p className={"help"}>
                <strong>{ProjectDetail('mockProject')}: </strong>
                {ProjectDetail('paragraphs.mockProjectDescription')}
              </p>
              <p className={"help"}>
                <strong>{ProjectDetail('realProject')}: </strong>
                {ProjectDetail('paragraphs.realProjectDescription')}
              </p>

              <RadioGroupComponent
                name="projectType"
                value={projectData.isTestProject.toString()}
                radioGroupLabel={radioData.radioGroupLabel}
                radioButtonData={radioData.radioButtonData}
                onChange={handleRadioChange}
              />
            </div>

            <Button type="submit" className="submit-button">{Global('buttons.save')}</Button>
          </Form>
        </ContentContainer>
      </LayoutContainer >
    </>
  )
    ;
};

export default ProjectsProjectDetail;
