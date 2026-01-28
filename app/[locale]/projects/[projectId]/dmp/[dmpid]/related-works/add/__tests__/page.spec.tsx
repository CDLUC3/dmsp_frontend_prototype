import React from "react";
import { useRouter } from "next/navigation";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import AddRelatedWorkPlanPage from "../page";
import { FindWorkByIdentifierDocument, RelatedWorkSearchResult } from "@/generated/graphql";
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

const setupMocks = (items: RelatedWorkSearchResult[], refetch = jest.fn()) => {
  mockUseQuery.mockImplementation((document) => {
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
    setupMocks([]);
    render(<AddRelatedWorkPlanPage />);
    expect(screen.getByRole("heading", { name: /title/i })).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("should render the breadcrumb links", () => {
    setupMocks([]);
    render(<AddRelatedWorkPlanPage />);
    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.projects")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.projectOverview")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.planOverview")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.relatedWorks")).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    setupMocks([]);
    const { container } = render(<AddRelatedWorkPlanPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
