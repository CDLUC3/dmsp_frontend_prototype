import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { axe, toHaveNoViolations } from "jest-axe";
import RelatedWorks from "../page";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

expect.extend(toHaveNoViolations);

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

function RelatedWorksHarness() {
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
    expect(screen.getByText("Quantum-Tuned Perception Systems for Next-Gen Robots")).toBeInTheDocument();
    expect(screen.getByText("Synthetic Empathy: Emotional Intelligence in Autonomous Agents")).toBeInTheDocument();
    expect(screen.getByText("NeuroSynthetics: Toward Biologically-Inspired Cognitive Robotics")).toBeInTheDocument();
  });

  it("should render related research outputs", async () => {
    render(<RelatedWorksHarness />);

    // Click related tab
    await userEvent.click(screen.getByRole("tab", { name: "tabs.accepted" }));

    expect(screen.getByText("Real-Time Sim2Real Transfer for Bipedal Robot Gait Adaptation")).toBeInTheDocument();
    expect(screen.getByText("Multisensory Feedback Loops for Dexterous Robotic Manipulation")).toBeInTheDocument();
  });

  it("should render discarded research outputs", async () => {
    render(<RelatedWorksHarness />);

    // Click discarded tab
    await userEvent.click(screen.getByRole("tab", { name: "tabs.rejected" }));

    expect(
      screen.getByText("Stellar Cartography and the Dynamic Mapping of Interstellar Gas Clouds"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cryovolcanic Activity on Enceladus: Implications for Subsurface Habitability"),
    ).toBeInTheDocument();
  });

  it("should render the add related work button", () => {
    render(<RelatedWorksHarness />);
    const addButton = screen.getByRole("button", { name: "buttons.addRelatedWorkManually" });
    expect(addButton).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<RelatedWorksHarness />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
