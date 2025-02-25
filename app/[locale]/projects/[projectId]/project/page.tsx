'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { CalendarDate, parseDate, DateValue } from "@internationalized/date";
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
  ListBoxItem,
  Popover,
} from "react-aria-components";

//GraphQL
import {
  useTopLevelResearchDomainsQuery,
  useProjectQuery
} from '@/generated/graphql';

//Container
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer
} from "@/components/Container";
import {
  FormInput,
  FormSelect,
  RadioGroupComponent
} from "@/components/Form";

import styles from './project.module.scss';

interface ResearchDomainInterface {
  id: string;
  name: string;
}

interface ProjectDetailsFormInterface {
  projectName: string;
  projectAbstract: string;
  startDate: string | CalendarDate | null;
  endDate: string | CalendarDate | null;
  researchDomainId: string | number;
  isTestProject: string | boolean;
}

// Helper function to safely get a CalendarDate value
const getCalendarDateValue = (dateValue: DateValue | string | null) => {
  if (!dateValue) return null;
  return typeof dateValue === 'string' ? parseDate(dateValue) : dateValue;
};

const ProjectsProjectDetail = () => {
  // Get projectId param
  const params = useParams();
  const { projectId } = params; // From route /projects/:projectId

  const [projectData, setProjectData] = useState<ProjectDetailsFormInterface>({
    projectName: '',
    projectAbstract: '',
    startDate: '',
    endDate: '',
    researchDomainId: '',
    isTestProject: 'true'
  });
  const [rDomains, setRDomains] = useState<ResearchDomainInterface[]>([]);

  // Localization keys
  const ProjectOverview = useTranslations('ProjectOverview');
  const ProjectDetail = useTranslations('ProjectsProjectDetail');
  const Global = useTranslations('Global');

  const radioData = {
    radioGroupLabel: "Project Type",
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

  // Get Project using projectId
  const { data, loading } = useProjectQuery(
    {
      variables: { projectId: Number(projectId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Get all Research Domains
  const { data: myResearchDomains } = useTopLevelResearchDomainsQuery();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert any CalendarDate objects to strings before submission
    const submissionData = {
      ...projectData,
      startDate: projectData.startDate instanceof CalendarDate ?
        projectData.startDate.toString() : projectData.startDate,
      endDate: projectData.endDate instanceof CalendarDate ?
        projectData.endDate.toString() : projectData.endDate
    };

    // Convert isTestProject back to boolean
    submissionData.isTestProject = submissionData.isTestProject === 'true';

    console.log('Form submitted', submissionData);
    // Submit the data...

    window.location.href = '/projects/create-project/funding';
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

      console.log(project.isTestProject)
      setProjectData({
        projectName: project.title,
        projectAbstract: project?.abstractText ? project.abstractText : '',
        startDate,
        endDate,
        researchDomainId: project.researchDomain?.id ? project.researchDomain.id : '',
        isTestProject: project.isTestProject ? project.isTestProject.toString() : 'false'
      })
    }
  }, [data])

  useEffect(() => {
    const handleResearchDomains = async () => {
      if (myResearchDomains) {
        const researchDomains = (myResearchDomains?.topLevelResearchDomains || [])
          .filter((domain) => domain !== null)
          .map((domain) => ({
            id: domain.id?.toString() ?? '',
            name: domain.name
          }))
        setRDomains(researchDomains)
      }
    };

    handleResearchDomains();
  }, [myResearchDomains]);

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
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
          <Form onSubmit={handleSubmit}>
            <FormInput
              name="projectName"
              type="text"
              isRequired={true}
              label={ProjectDetail('labels.projectName')}
              value={projectData.projectName}
              onChange={(e) => updateProjectContent('projectName', e.target.value)}
              isInvalid={!projectData?.projectName}
              errorMessage="Project name is required"
            />

            <FormInput
              name="projectAbstract"
              type="text"
              isRequired={false}
              label={ProjectDetail('labels.projectAbstract')}
              value={projectData.projectAbstract}
              onChange={(e) => updateProjectContent('projectAbstract', e.target.value)}
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
                  updateProjectContent('startDate', newDate);
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

            <FormSelect
              label={ProjectDetail('labels.researchDomain')}
              isRequired
              name="researchDomain"
              items={rDomains}
              selectClasses={styles.researchDomainSelect}
              onSelectionChange={selected => setProjectData({ ...projectData, researchDomainId: selected as string })}
              selectedKey={projectData.researchDomainId}
            >
              {rDomains && rDomains.map((domain) => {
                return (
                  <ListBoxItem key={domain.id}>{domain.id}</ListBoxItem>
                )

              })}
            </FormSelect>

            <div className="form-signpost  my-8">
              <div className="form-signpost-inner">
                <div className="">
                  <p className="text-sm">
                    Have a grant already? Not the right project? Use Search
                    projects to find the project. If found key information
                    will be filled in for you.
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
                  <h4>{ProjectDetail('headings.h4MockProject')}</h4>
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
