import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useArchiveTemplateMutation,
  useCreateTemplateVersionMutation,
  useTemplateQuery,
} from '@/generated/graphql';
import { useParams } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import TemplateEditPage from '../page';
import { updateTemplateAction } from '../actions';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useTemplateQuery: jest.fn(),
  useArchiveTemplateMutation: jest.fn(),
  useCreateTemplateVersionMutation: jest.fn(),
  TemplateVersionType: { Draft: 'DRAFT', Published: 'PUBLISHED' },
  TemplateVisibility: { Organization: 'ORGANIZATION', Public: 'PUBLIC' },
}));

jest.mock('../actions/index', () => ({
  updateTemplateAction: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`
}));

jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

const mockArchiveTemplateData = {
  data: {
    archiveTemplate: {
      id: 15,
      name: "Test template",
      errors: {
        general: "Template could not be archived",
        name: null,
        owner: null,
      },
    },
  },
}

const mockTemplateData: {
  name: string;
  id: number | null; // Allow `id` to be `number` or `null`
  visibility: string;
  description: string;
  errors: null;
  latestPublishVersion: string;
  latestPublishDate: string;
  created: string;
  sections: {
    id: number;
    displayOrder: number;
    name: string;
    questions: {
      errors: null;
      displayOrder: number;
      guidanceText: string;
      id: number;
      questionText: string;
    }[];
  }[];
} = {
  name: "DMP Template from Dataverse",
  id: 15,
  visibility: "ORGANIZATION",
  description: "DMP Template from Dataverse",
  errors: null,
  latestPublishVersion: "v1",
  latestPublishDate: "1648835084000",
  created: "1412980160000",
  sections: [
    {
      id: 67,
      displayOrder: 1,
      name: "Data description",
      questions: [
        {
          errors: null,
          displayOrder: 1,
          guidanceText: "<p><br><a href=\"http://thedata.org/book/data-management-plan\">Dataverse page on DMPs</a></p>",
          id: 67,
          questionText: "Briefly describe nature &amp; scale of data {simulated, observed, experimental information; samples; publications; physical collections; software; models} generated or collected."
        }
      ]
    },
  ]
};

describe("TemplateEditPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);
  });

  it("should render loading state", async () => {
    // Mock graphql requests
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it("should render data returned from template query correctly", async () => {
    // Mock the hook for data state
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('DMP Template from Dataverse');

    const versionText = screen.getByText(/version: v1/i);
    expect(versionText).toBeInTheDocument();

    const heading2 = screen.getByRole('heading', {
      level: 2,
      name: 'labels.section 1 Data description',
    });
    expect(heading2).toBeInTheDocument();

    const questionText = screen.getByText(
      (content) => content.includes('Briefly describe nature'),
      { selector: 'p' }
    );

    expect(questionText).toBeInTheDocument();
  });


  it('should close dialog when \'Publish template\' form submitted', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Simulate the user triggering the publishTemplate button
    const publishTemplateButton = screen.getByRole('button', { name: /button.publishtemplate/i });
    fireEvent.click(publishTemplateButton);

    // Locate the textarea using data-testid
    const textarea = screen.getByTestId('changeLog');

    // Simulate user typing into the textarea
    fireEvent.change(textarea, { target: { value: 'This is a test comment.' } });

    const saveAndPublishButton = screen.getByRole('button', { name: /button.saveandpublish/i });
    fireEvent.click(saveAndPublishButton);

    // Wait for mutation response
    await waitFor(() => {
      //Should have hidden the dialog window again
      const modalElement = screen.queryByTestId('modal');
      expect(modalElement).toBeNull();
    });
  })

  it('should update the visibility text when publish visibility changes', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Simulate the user triggering the publishTemplate button
    const publishTemplateButton = screen.getByRole('button', { name: /button.publishtemplate/i });
    fireEvent.click(publishTemplateButton);
    await waitFor(() => {
      expect(screen.getByTestId('visPublic')).toBeInTheDocument();
    });

    const publicOption = screen.getByTestId('visPublic');
    const privateOption = screen.getByTestId('visPrivate');

    expect(publicOption).toBeInTheDocument();
    expect(privateOption).toBeInTheDocument();

    // Test the public option
    fireEvent.click(publicOption);
    await waitFor(() => {
      const visBullet = screen.getByTestId('visText');
      expect(visBullet).toBeInTheDocument();
      expect(visBullet).toHaveTextContent('bullet.publishingTemplate3');
    });

    // Test the Private Option
    fireEvent.click(privateOption);
    await waitFor(() => {
      const visBullet = screen.getByTestId('visText');
      expect(visBullet).toBeInTheDocument();
      expect(visBullet).toHaveTextContent('bullet.publishingTemplate3Private');
    });
  });

  it('should set correct error when useCreate returns error', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn(() => Promise.reject(new Error('Mutation failed'))), // Mock the mutation function
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Simulate the user triggering the publishTemplate button
    const publishTemplateButton = screen.getByRole('button', { name: /button.publishtemplate/i });
    fireEvent.click(publishTemplateButton);

    // Locate the textarea using data-testid
    const textarea = screen.getByTestId('changeLog');

    // Simulate user typing into the textarea
    fireEvent.change(textarea, { target: { value: 'This is a test comment.' } });

    const saveAndPublishButton = screen.getByRole('button', { name: /button.saveandpublish/i });
    fireEvent.click(saveAndPublishButton);

    // Wait for the error to be added to the page
    await waitFor(() => {
      expect(screen.getByText('errors.saveTemplateError')).toBeInTheDocument();
    });
  })

  it('should call useArchiveTemplateMutation when user clicks on the Archive Template button', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    fireEvent.click(archiveTemplateBtn);

    // Wait for the mutation to be called
    await waitFor(() => {
      expect(useArchiveTemplateMutation).toHaveBeenCalled();
    });
  })

  it('should display correct error when archving template fails', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      jest.fn(() => Promise.reject(new Error('Mutation failed'))), // Mock the mutation function
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    fireEvent.click(archiveTemplateBtn);

    // Wait until error is displayed
    await waitFor(() => {
      expect(screen.getByText('errors.archiveTemplateError')).toBeInTheDocument();
    });
  })

  it('should display the general error if it is returned from the archiveTemplateMutation', async () => {

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    const mockArchiveTemplate = jest.fn().mockResolvedValue(mockArchiveTemplateData);

    // Use it in your test:
    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      mockArchiveTemplate,
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    fireEvent.click(archiveTemplateBtn);

    // Wait until error is displayed
    await waitFor(() => {
      expect(screen.getByText('Template could not be archived')).toBeInTheDocument();
    });
  })

  it('should display Template Title input field when user clicks on Edit Template', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });


    const editTemplateButton = screen.getByRole('button', { name: /Edit template name/i });
    fireEvent.click(editTemplateButton);

    // Check if the input field is displayed
    const inputField = screen.getByRole('textbox', { name: /Template title/i });
    expect(inputField).toBeInTheDocument();
  });

  it('should call updateTemplateAction when user enters a new title and clicks save', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
      refetch: jest.fn()
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (updateTemplateAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null,
        },
        id: 15,
        name: 'New Template Title',
        visibility: 'ORGANIZATION',
      },
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Simulate clicking the "Edit template name" button
    const editTemplateButton = screen.getByRole('button', { name: /Edit template name/i });
    await act(async () => {
      fireEvent.click(editTemplateButton);
    });

    // Simulate typing a new title into the input field
    const inputField = screen.getByPlaceholderText('Enter new template title');
    await act(async () => {
      fireEvent.change(inputField, { target: { value: 'New Template Title' } });
    });

    // Simulate clicking the "Save" button
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Wait for the updateTemplateAction to be called
    await waitFor(() => {
      expect(updateTemplateAction).toHaveBeenCalledWith({
        templateId: 15,
        name: 'New Template Title', // Ensure the updated title is passed
        visibility: 'ORGANIZATION',
      });
    });
  });

  it('should log error if updateTemplate is called with no templateId', async () => {
    mockTemplateData.id = null; // Set templateId to null

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (updateTemplateAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null,
        },
        id: 15,
        name: 'New Template Title',
        visibility: 'ORGANIZATION',
      },
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Simulate clicking the "Edit template name" button
    const editTemplateButton = screen.getByRole('button', { name: /Edit template name/i });
    await act(async () => {
      fireEvent.click(editTemplateButton);
    });

    // Simulate typing a new title into the input field
    const inputField = screen.getByPlaceholderText('Enter new template title');
    await act(async () => {
      fireEvent.change(inputField, { target: { value: 'New Template Title' } });
    });

    // Simulate clicking the "Save" button
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Wait for the updateTemplateAction to be called
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updateTemplate',
        expect.objectContaining({
          error: "templateId is null",
          url: { path: '/en-US/template/unknown' },
        })
      )
    })
  });
});

