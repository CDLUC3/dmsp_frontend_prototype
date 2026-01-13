import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams, useRouter } from "next/navigation";
import { axe, toHaveNoViolations } from "jest-axe";
import RelatedWorks from "../page";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { useQuery } from '@apollo/client/react';
import { RelatedWorksByPlanDocument } from "@/generated/graphql";
import {
  MOCK_ACCEPTED_WORKS,
  MOCK_PENDING_WORKS,
  MOCK_REJECTED_WORKS,
} from "@/components/RelatedWorksList/__tests__/index.spec";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));


const mockUseRouter = useRouter as jest.Mock;
const mockUseParams = useParams as jest.Mock;


// Cast with jest.mocked utility
const mockUseQuery = jest.mocked(useQuery);

const setupMocks = () => {
  mockUseQuery.mockImplementation((document) => {
    if (document === RelatedWorksByPlanDocument) {
      return {
        data: {
          relatedWorksByPlan: {
            items: MOCK_PENDING_WORKS,
          },
        },
        loading: false,
        error: undefined,
        refetch: jest.fn()
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined
    };
  });
};

function RelatedWorksHarness() {
  mockUseParams.mockReturnValue({ dmpid: "1" });

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
    setupMocks();
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with correct title and description", () => {
    render(<RelatedWorksHarness />);
    expect(screen.getByText("header.title")).toBeInTheDocument();
    expect(screen.getByText("header.description")).toBeInTheDocument();
  });

  it("should render the breadcrumb links", () => {
    render(<RelatedWorksHarness />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("should render tabs", () => {
    render(<RelatedWorksHarness />);

    expect(screen.getByRole("tab", { name: "tabs.pending" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "tabs.accepted" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "tabs.rejected" })).toBeInTheDocument();
  });

  it("should render pending research outputs", () => {
    render(<RelatedWorksHarness />);
    expect(screen.getByText("Synthetic Empathy: Emotional Intelligence in Autonomous Agents")).toBeInTheDocument();
    expect(screen.getByText("NeuroSynthetics: Toward Biologically-Inspired Cognitive Robotics")).toBeInTheDocument();
  });

  it("should render related research outputs", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksByPlanDocument) {
        return {
          data: {
            relatedWorksByPlan: {
              items: MOCK_ACCEPTED_WORKS,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<RelatedWorksHarness />);

    // Click related tab
    await userEvent.click(screen.getByRole("tab", { name: "tabs.accepted" }));

    expect(screen.getByText("Real-Time Sim2Real Transfer for Bipedal Robot Gait Adaptation")).toBeInTheDocument();
    expect(screen.getByText("Multisensory Feedback Loops for Dexterous Robotic Manipulation")).toBeInTheDocument();
  });

  it("should render discarded research outputs", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksByPlanDocument) {
        return {
          data: {
            relatedWorksByPlan: {
              items: MOCK_REJECTED_WORKS,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<RelatedWorksHarness />);

    // Click discarded tab
    await userEvent.click(screen.getByRole("tab", { name: "tabs.rejected" }));

    expect(
      screen.getByText("Stellar Cartography and the Dynamic Mapping of Interstellar Gas Clouds"),
    ).toBeInTheDocument();
  });

  it("should render the add related work button", () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksByPlanDocument) {
        return {
          data: {
            relatedWorksByPlan: {
              items: MOCK_PENDING_WORKS,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(<RelatedWorksHarness />);
    const addButton = screen.getByRole("button", { name: "buttons.addRelatedWorkManually" });
    expect(addButton).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksByPlanDocument) {
        return {
          data: {
            relatedWorksByPlan: {
              items: MOCK_PENDING_WORKS,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });
    const { container } = render(<RelatedWorksHarness />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
