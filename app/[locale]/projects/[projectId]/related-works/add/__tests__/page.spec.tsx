import React from "react";
import { useRouter } from "next/navigation";
import {render, screen, waitFor, within} from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import AddRelatedWorkProjectPage from "../page";
import {
  FindWorkByIdentifierDocument,
  ProjectDocument,
  RelatedWorkSearchResult,
} from "@/generated/graphql";
import { useQuery } from "@apollo/client/react";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(() => ({
    projectId: "1",
    dmpid: "1",
  })),
}));

jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/app/actions/upsertRelatedWorkAction", () => ({
  upsertRelatedWorkAction: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

const mockUseQuery = jest.mocked(useQuery);

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupMocks = (items: RelatedWorkSearchResult[], project: null | any, refetch = jest.fn()) => {
  mockUseQuery.mockImplementation((document) => {
    if (document === ProjectDocument) {
      return {
        data: {
          project,
        },
        loading: false,
        error: undefined,
        refetch
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } as any;
    }

    if (document === FindWorkByIdentifierDocument) {
      return {
        data: {
          findWorkByIdentifier: {
            items,
          },
        },
        loading: false,
        error: undefined,
        refetch
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined,
    };
  });
};

describe("AddRelatedWorkPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title and description", () => {
    setupMocks([], null);
    render(<AddRelatedWorkProjectPage />);
    expect(screen.getByRole("heading", { name: /title/i })).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("should render the breadcrumb links", () => {
    setupMocks([], null);
    render(<AddRelatedWorkProjectPage />);
    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.projects")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.projectOverview")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.relatedWorks")).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    setupMocks([], { plans: [{id: 1, title: "Plan 1", registered: 1234}]});
    const { container } = render(<AddRelatedWorkProjectPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
