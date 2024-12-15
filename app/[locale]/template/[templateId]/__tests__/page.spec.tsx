import React from "react";
import { render, screen, act } from '@/utils/test-utils';
import {
  useCreateTemplateVersionMutation,
  useTemplateQuery
} from '@/generated/graphql';

import { useParams } from 'next/navigation';
import TemplateEditPage from '../page';

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useTemplateQuery: jest.fn(),
  useCreateTemplateVersionMutation: jest.fn(),
  TemplateVersionType: { Draft: 'DRAFT', Published: 'PUBLISHED' }
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
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

/*eslint-disable @typescript-eslint/no-explicit-any*/
// Helper function to cast to jest.Mock for TypeScript
const mockHook = (hook: any) => hook as jest.Mock;

const setupMocks = () => {
  // mockHook(useTemplateQuery).mockReturnValue([() => mockTemplateData, { loading: false, error: undefined }]);
  mockHook(useCreateTemplateVersionMutation).mockReturnValue([jest.fn(), { loading: false, error: undefined }]);
};

describe("TemplateEditPage", () => {
  beforeEach(() => {
    setupMocks();
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });
  });

  it("renders loading state", async () => {
    // Mock the hook for loading state
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it.only("renders data state", async () => {
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
  });
});