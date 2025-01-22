import React from "react";
import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils';
import {
  useArchiveTemplateMutation,
  useCreateTemplateVersionMutation,
  useTemplateQuery
} from '@/generated/graphql';

import { useParams } from 'next/navigation';
import TemplateEditPage from '../page';

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useTemplateQuery: jest.fn(),
  useArchiveTemplateMutation: jest.fn(),
  useCreateTemplateVersionMutation: jest.fn(),
  TemplateVersionType: { Draft: 'DRAFT', Published: 'PUBLISHED' }
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

// Create a mock for scrollIntoView and focus
const mockScrollIntoView = jest.fn();

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

const mockTemplateData = {
  "name": "DMP Template from Dataverse",
  "description": "DMP Template from Dataverse",
  "errors": null,
  "latestPublishVersion": "v1",
  "latestPublishDate": "1648835084000",
  "created": "1412980160000",
  "sections": [
    {
      "id": 67,
      "displayOrder": 1,
      "name": "Data description",
      "questions": [
        {
          "errors": null,
          "displayOrder": 1,
          "guidanceText": "<p><br><a href=\"http://thedata.org/book/data-management-plan\">Dataverse page on DMPs</a></p>",
          "id": 67,
          "questionText": "<p>Briefly describe nature &amp; scale of data {simulated, observed, experimental information; samples; publications; physical collections; software; models} generated or collected.</p>"
        }
      ]
    },
  ]
};

describe("TemplateEditPage", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
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
      render(
        <TemplateEditPage />
      );
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('DMP Template from Dataverse');
    const versionText = screen.getByText(/Version: v1/i); // Use a regex for partial match
    expect(versionText).toBeInTheDocument();
    const heading2 = screen.getByRole('heading', { level: 2, name: 'labels.section 1 Data description' });
    expect(heading2).toBeInTheDocument();
    const questionText = screen.getByText('Briefly describe nature & scale of data {simulated, observed, experimental information; samples; publications; physical collections; software; models} generated or collected.', { selector: 'p' });
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
});
