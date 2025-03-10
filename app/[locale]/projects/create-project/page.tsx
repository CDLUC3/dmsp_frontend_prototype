'use client';

import { useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from "react-aria-components";

//GraphQL
import {
  useAddProjectMutation,
  ProjectErrors
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import {
  RadioGroupComponent,
  CheckboxGroupComponent,
  FormInput
} from '@/components/Form';
import ErrorMessages from '@/components/ErrorMessages';

//Other
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';

interface CreateProjectResponse {
  id?: number | null;
  errors?: ProjectErrors | null;
}
interface CreateProjectInterface {
  projectName: string;
  radioGroup?: string;
  checkboxGroup?: string[];
}

interface CreateProjectErrorsInterface {
  projectName: string;
  radioGroup?: string;
  checkboxGroup?: string;
}

const ProjectsCreateProject = () => {
  const toastState = useToast();
  const router = useRouter();
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [fieldErrors, setFieldErrors] = useState<CreateProjectErrorsInterface>({
    projectName: '',
    radioGroup: '',
    checkboxGroup: '',
  });
  const [formData, setFormData] = useState<CreateProjectInterface>({
    projectName: '',
    radioGroup: '',
    checkboxGroup: [],
  })
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // localization keys
  const Global = useTranslations('Global');
  const CreateProject = useTranslations('ProjectsCreateProject');

  const radioData = {
    radioGroupLabel: CreateProject('form.newOrExisting'),
    radioButtonData: [
      {
        value: 'previous',
        label: CreateProject('form.radioExistingLabel'),
        description: CreateProject('form.radioExistingHelpText'),
      },
      {
        value: 'new',
        label: CreateProject('form.radioNewLabel'),
        description: CreateProject('form.radioNewHelpText')
      }
    ]
  }

  const checkboxData = [
    {
      value: 'checkboxGroup',
      label: CreateProject('form.checkboxLabel'),
      description: CreateProject('form.checkboxHelpText')
    }
  ]

  // Initialize addProjectMutation
  const [addProjectMutation] = useAddProjectMutation();


  // Update form data
  const handleUpdate = (name: string, value: string | string[]) => {
    setFormSubmitted(false);
    setFormData({ ...formData, [name]: value });
  };

  // Handle any changes to form field values
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleUpdate(name, value);
  };

  // Handle changes from RadioGroup
  const handleRadioChange = (value: string) => {
    handleUpdate('radioGroup', value);
  };

  // Handle changes from CheckboxGroup
  const handleCheckboxChange = (value: string[]) => {
    setFormSubmitted(false);
    setFormData((prev) => ({
      ...prev,
      checkboxGroup: value
    }))
  };

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = CreateProject('messages.success');
    toastState.add(successMessage, { type: 'success' });
  }


  // Client-side validation of fields
  const validateField = (name: keyof CreateProjectInterface, value: string | string[]) => {
    switch (name) {
      case 'projectName':
        if (!value || value.length <= 2) {
          return CreateProject('messages.errors.titleLength')
        }
        break;
    }
    return '';
  }

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    const errors: CreateProjectErrorsInterface = {
      projectName: '',
      radioGroup: '',
      checkboxGroup: '',
    };

    let hasError = false;

    // Validate all fields and collect errors
    Object.keys(formData).forEach((key) => {
      const name = key as keyof CreateProjectInterface;
      const value = formData[name];
      const error = validateField(name, value ? value : '');

      if (error) {
        hasError = true;
        errors[name] = error as string;
      }
    });

    // Update state with all errors
    setFieldErrors(errors);
    if (errors) {
      setErrors(Object.values(errors).filter((e) => e)); // Store only non-empty error messages
    }

    return !hasError;
  };

  // Make GraphQL mutation request to update section
  const createProject = async (): Promise<CreateProjectResponse> => {
    try {
      const response = await addProjectMutation({
        variables: {
          title: formData.projectName,
          isTestProject: formData.checkboxGroup ? formData.checkboxGroup.includes('checkboxGroup') : false
        }
      });

      if (response.data?.addProject) {
        return response.data.addProject;
      }
      setFormSubmitted(true)
    } catch (error) {
      logECS('error', 'updateSection', {
        error,
        url: { path: '/template/[templateId]/section/[sectionid]' }
      });
      if (error instanceof ApolloError) {
        setErrors(prevErrors => [...prevErrors, error.message]);
      } else {
        setErrors(prevErrors => [...prevErrors, CreateProject('messages.errors.createProjectError')]);
      }
    }
    return {};
  };

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous error messages
    setErrors([]);

    if (isFormValid()) {

      // Create new section
      const response = await createProject();

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (response.errors && Object.values(response.errors).filter((err) => err && err !== 'ProjectErrors').length > 0) {
        setFieldErrors(prev => ({ ...prev, projectName: response.errors?.title || '' }));

        setErrors([response.errors.general || CreateProject('messages.errors.createProjectError')]);

      } else {
        // Show success message
        showSuccessToast();
        router.push(`/projects/${response.id}/project-funding`);
      }
    }
  };

  return (
    <>
      <PageHeader
        title={CreateProject('pageTitle')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb>{CreateProject('pageTitle')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-create-project"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <ErrorMessages errors={errors} ref={errorRef} />
          <Form onSubmit={handleFormSubmit}>
            <FormInput
              name="projectName"
              type="text"
              value={formData.projectName}
              label={CreateProject('form.projectTitle')}
              description={CreateProject('form.projectTitleHelpText')}
              isRequired={true}
              onChange={handleInputChange}
              isInvalid={(!formData.projectName || !!fieldErrors.projectName) && formSubmitted}
              errorMessage={fieldErrors.projectName.length > 0 ? fieldErrors.projectName : CreateProject('messages.errors.title')}
              id="projectName"
            />

            <RadioGroupComponent
              name="radioGroup"
              value={formData.radioGroup ?? ''}
              radioGroupLabel={radioData.radioGroupLabel}
              radioButtonData={radioData.radioButtonData}
              onChange={handleRadioChange}
            />

            <CheckboxGroupComponent
              name="checkboxGroup"
              value={formData.checkboxGroup || []}
              checkboxGroupLabel={CreateProject('form.checkboxGroupLabel')}
              checkboxGroupDescription={CreateProject('form.checkboxGroupHelpText')}
              checkboxData={checkboxData}
              onChange={handleCheckboxChange}
            />

            <Button
              type="submit"
              className=""
              onPress={() => { setFormSubmitted(true) }}
            >{Global('buttons.continue')}

            </Button>

          </Form>

        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>


    </>
  );
};
export default ProjectsCreateProject;