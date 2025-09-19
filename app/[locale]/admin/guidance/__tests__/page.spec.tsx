import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidancePage from "../page";

expect.extend(toHaveNoViolations);

describe("GuidancePage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title", () => {
    render(<GuidancePage />);

    expect(screen.getByText("pages.index.title")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(<GuidancePage />);

    expect(screen.getByText("pages.index.description")).toBeInTheDocument();
  });

  it("should render the create group button", () => {
    render(<GuidancePage />);

    expect(screen.getByText("pages.index.createGroup")).toBeInTheDocument();
  });

  it("should render breadcrumbs", () => {
    render(<GuidancePage />);

    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.guidance")).toBeInTheDocument();
  });

  it("should render guidance groups list", () => {
    render(<GuidancePage />);

    // Check that the list container is present
    const listContainer = screen.getByRole("list");
    expect(listContainer).toBeInTheDocument();
    expect(listContainer).toHaveAttribute("aria-label", "Guidance groups list");
  });

  it("should render guidance group items", () => {
    render(<GuidancePage />);

    // Check that guidance group items are rendered (should have multiple DashboardListItem components)
    const listItems = document.querySelectorAll('[role="listitem"], .guidance-content');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it("should render guidance group metadata", () => {
    render(<GuidancePage />);

    // Check for metadata elements
    expect(screen.getByText("lastRevisedBy")).toBeInTheDocument();
    expect(screen.getByText("lastUpdated")).toBeInTheDocument();
  });

  it("should render guidance group descriptions", () => {
    render(<GuidancePage />);

    // Check that descriptions are rendered (look for description containers)
    const descriptions = document.querySelectorAll(".description");
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it("should render guidance group status information", () => {
    render(<GuidancePage />);

    // Check for status text (Published/Draft)
    expect(screen.getByText("Status: Published")).toBeInTheDocument();
    expect(screen.getByText("Status: Draft")).toBeInTheDocument();
  });

  it("should render multiple guidance groups", () => {
    render(<GuidancePage />);

    // Should render multiple guidance groups based on the fake data
    const guidanceItems = document.querySelectorAll(".guidance-list > *");
    expect(guidanceItems.length).toBeGreaterThan(1);
  });

  it("should have proper page structure", () => {
    render(<GuidancePage />);

    // Check for main layout components
    const pageHeader = document.querySelector(".page-template-list");
    expect(pageHeader).toBeInTheDocument();

    const guidanceList = document.querySelector(".guidance-list");
    expect(guidanceList).toBeInTheDocument();
  });

  it("should render author information in metadata", () => {
    render(<GuidancePage />);

    // Check that author information is present in metadata sections
    const metadata = document.querySelectorAll(".metadata");
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidancePage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText("pages.index.title")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
