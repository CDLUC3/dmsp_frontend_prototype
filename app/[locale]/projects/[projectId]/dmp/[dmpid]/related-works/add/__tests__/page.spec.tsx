import React from "react";
import { useRouter } from "next/navigation";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import AddRelatedWorkPage from "../page";
import { FindWorkByIdentifierDocument, RelatedWorkSearchResult, RelatedWorkStatus } from "@/generated/graphql";
import {
  MOCK_ACCEPTED_WORKS,
  MOCK_PENDING_WORKS,
  MOCK_REJECTED_WORKS,
} from "@/app/[locale]/projects/[projectId]/dmp/[dmpid]/related-works/mockWorks";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { upsertRelatedWorkAction } from "@/app/[locale]/projects/[projectId]/dmp/[dmpid]/related-works/actions/upsertRelatedWorkAction";
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

jest.mock("@/app/[locale]/projects/[projectId]/dmp/[dmpid]/related-works/actions/upsertRelatedWorkAction", () => ({
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
    render(<AddRelatedWorkPage />);
    expect(screen.getByRole("heading", { name: /title/i })).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("should render the search box and have lookup button", () => {
    setupMocks([]);
    render(<AddRelatedWorkPage />);
    expect(screen.getByText("searchLabel")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("10.1000/182")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "buttons.lookup" })).toBeInTheDocument();
  });

  it("should render the breadcrumb links", () => {
    setupMocks([]);
    render(<AddRelatedWorkPage />);
    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.projects")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.projectOverview")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.planOverview")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.relatedWorks")).toBeInTheDocument();
  });

  it("should display search results (pending)", () => {
    setupMocks([MOCK_PENDING_WORKS[0]]);
    render(
      <NextIntlClientProvider
        locale={"en"}
        timeZone={"UTC"}
        messages={{}}
      >
        <AddRelatedWorkPage />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Synthetic Empathy: Emotional Intelligence in Autonomous Agents")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "buttons.accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "buttons.reject" })).toBeInTheDocument();
  });

  it("should display search results (accepted)", () => {
    setupMocks([MOCK_ACCEPTED_WORKS[0]]);

    render(
      <NextIntlClientProvider
        locale={"en"}
        timeZone={"UTC"}
        messages={{}}
      >
        <AddRelatedWorkPage />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("Real-Time Sim2Real Transfer for Bipedal Robot Gait Adaptation")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "buttons.accept" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "buttons.reject" })).toBeInTheDocument();
  });

  it("should display search results (rejected)", () => {
    setupMocks([MOCK_REJECTED_WORKS[0]]);

    render(
      <NextIntlClientProvider
        locale={"en"}
        timeZone={"UTC"}
        messages={{}}
      >
        <AddRelatedWorkPage />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByText("Stellar Cartography and the Dynamic Mapping of Interstellar Gas Clouds"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "buttons.accept" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "buttons.reject" })).not.toBeInTheDocument();
  });

  it('should display "messaging.noItemsFound" when no results match', async () => {
    const user = userEvent.setup();
    setupMocks([]);

    render(<AddRelatedWorkPage />);

    const input = screen.getByRole("searchbox", { name: /searchLabel/i });
    await user.type(input, "10.1000/123");
    const button = screen.getByRole("button", { name: /buttons.lookup/i });
    await user.click(button);

    expect(screen.getByText("messaging.noItemsFound")).toBeInTheDocument();
  });

  it('should display "invalidDoi" when invalid DOI entered', async () => {
    const user = userEvent.setup();
    setupMocks([]);
    render(<AddRelatedWorkPage />);

    const input = screen.getByRole("searchbox", { name: /searchLabel/i });
    await user.type(input, "123");
    const button = screen.getByRole("button", { name: /buttons.lookup/i });
    await user.click(button);

    expect(screen.getByText("invalidDoi")).toBeInTheDocument();
  });

  it('should handle "Accept" button click for a work', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);
    (upsertRelatedWorkAction as jest.Mock).mockResolvedValue(undefined);
    setupMocks([MOCK_PENDING_WORKS[0]], refetch);

    render(
      <NextIntlClientProvider
        locale={"en"}
        timeZone={"UTC"}
        messages={{}}
      >
        <AddRelatedWorkPage />
      </NextIntlClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "buttons.accept" }));

    await waitFor(() => {
      expect(upsertRelatedWorkAction).toHaveBeenCalledTimes(1);
    });

    expect(upsertRelatedWorkAction).toHaveBeenCalledWith({
      planId: expect.any(Number),
      doi: MOCK_PENDING_WORKS[0].workVersion.work.doi,
      hash: MOCK_PENDING_WORKS[0].workVersion.hash,
      status: RelatedWorkStatus.Accepted,
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('should handle "Reject" button click for a work', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn().mockResolvedValue(undefined);
    (upsertRelatedWorkAction as jest.Mock).mockResolvedValue(undefined);
    setupMocks([MOCK_ACCEPTED_WORKS[0]], refetch);

    render(
      <NextIntlClientProvider
        locale={"en"}
        timeZone={"UTC"}
        messages={{}}
      >
        <AddRelatedWorkPage />
      </NextIntlClientProvider>,
    );

    await user.click(screen.getByRole("button", { name: "buttons.reject" }));

    await waitFor(() => {
      expect(upsertRelatedWorkAction).toHaveBeenCalledTimes(1);
    });

    expect(upsertRelatedWorkAction).toHaveBeenCalledWith({
      planId: expect.any(Number),
      doi: MOCK_ACCEPTED_WORKS[0].workVersion.work.doi,
      hash: MOCK_ACCEPTED_WORKS[0].workVersion.hash,
      status: RelatedWorkStatus.Rejected,
    });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("should pass accessibility tests", async () => {
    setupMocks([]);
    const { container } = render(<AddRelatedWorkPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
