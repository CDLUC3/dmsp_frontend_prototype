import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {useParams, useRouter} from "next/navigation";
import {axe, toHaveNoViolations} from "jest-axe";
import RelatedWorks from "../page";
import userEvent from "@testing-library/user-event";
import {NextIntlClientProvider} from "next-intl";
import {useRelatedWorksByPlanQuery} from "@/generated/graphql";
import {
  MOCK_ACCEPTED_WORKS,
  MOCK_PENDING_WORKS,
  MOCK_REJECTED_WORKS
} from "@/components/RelatedWorksList/__tests__/index.spec";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseParams = useParams as jest.Mock;

jest.mock("@/generated/graphql", () => ({
  ...jest.requireActual("@/generated/graphql"),
  useRelatedWorksByPlanQuery: jest.fn(),
}));

function RelatedWorksHarness() {
  mockUseParams.mockReturnValue({ dmpid: '1' });

  return (
    <NextIntlClientProvider
      locale={"en"}
      timeZone={"UTC"}
      messages={{}}
    >
      <RelatedWorks />
    </NextIntlClientProvider>
  );
}

describe("RelatedWorks", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with correct title and description", () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);
    expect(screen.getByText("header.title")).toBeInTheDocument();
    expect(screen.getByText("header.description")).toBeInTheDocument();
  });

  it("should render the breadcrumb links", () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("should render tabs", () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);

    expect(screen.getByRole("tab", { name: "tabs.pending" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "tabs.accepted" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "tabs.rejected" })).toBeInTheDocument();
  });

  it("should render pending research outputs", () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);
    expect(screen.getByText("Synthetic Empathy: Emotional Intelligence in Autonomous Agents")).toBeInTheDocument();
    expect(screen.getByText("NeuroSynthetics: Toward Biologically-Inspired Cognitive Robotics")).toBeInTheDocument();
  });

  it("should render related research outputs", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_ACCEPTED_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);

    // Click related tab
    await userEvent.click(screen.getByRole("tab", { name: "tabs.accepted" }));

    expect(screen.getByText("Real-Time Sim2Real Transfer for Bipedal Robot Gait Adaptation")).toBeInTheDocument();
    expect(screen.getByText("Multisensory Feedback Loops for Dexterous Robotic Manipulation")).toBeInTheDocument();
  });

  it("should render discarded research outputs", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_REJECTED_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);

    // Click discarded tab
    await userEvent.click(screen.getByRole("tab", { name: "tabs.rejected" }));

    expect(
      screen.getByText("Stellar Cartography and the Dynamic Mapping of Interstellar Gas Clouds"),
    ).toBeInTheDocument();
  });

  it("should render the add related work button", () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    render(<RelatedWorksHarness />);
    const addButton = screen.getByRole("button", { name: "buttons.addRelatedWorkManually" });
    expect(addButton).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
        },
      },
      loading: false,
      error: null,
    });
    const { container } = render(<RelatedWorksHarness />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
