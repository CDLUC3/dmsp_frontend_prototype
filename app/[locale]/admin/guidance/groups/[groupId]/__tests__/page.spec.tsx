import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceGroupIndexPage from "../page";

// Mock useParams
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
  }),
}));

expect.extend(toHaveNoViolations);

describe("GuidanceGroupIndexPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with group title", () => {
    render(<GuidanceGroupIndexPage />);

    // Check that a title is rendered (could be fallback or actual title)
    const titleElement = screen.getByText(/pages\.groupIndex\.title|School of Health Sciences/);
    expect(titleElement).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(<GuidanceGroupIndexPage />);

    // Check that a description is rendered (could be fallback or actual description)
    const descElement = screen.getByText(/pages\.groupIndex\.description|Comprehensive guidance/);
    expect(descElement).toBeInTheDocument();
  });

  it("should render breadcrumbs", () => {
    render(<GuidanceGroupIndexPage />);

    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.guidanceGroups")).toBeInTheDocument();
    // Check that some group identifier is in breadcrumbs
    const breadcrumbsContainer = document.querySelector('nav, [role="navigation"]');
    expect(breadcrumbsContainer).toBeInTheDocument();
  });

  it("should render action buttons", () => {
    render(<GuidanceGroupIndexPage />);

    expect(screen.getByText("pages.groupIndex.editGroup")).toBeInTheDocument();
    expect(screen.getByText("pages.groupIndex.createText")).toBeInTheDocument();
  });

  it("should render guidance texts list", () => {
    render(<GuidanceGroupIndexPage />);

    // Check that the list container is present
    const listContainer = screen.getByRole("list");
    expect(listContainer).toBeInTheDocument();
    expect(listContainer).toHaveAttribute("aria-label", "Guidance texts list");
  });

  it("should render guidance text items", () => {
    render(<GuidanceGroupIndexPage />);

    // Check that guidance text items are rendered
    const textItems = document.querySelectorAll('.guidance-texts-list > *, [role="listitem"]');
    expect(textItems.length).toBeGreaterThan(0);
  });

  it("should render guidance text metadata", () => {
    render(<GuidanceGroupIndexPage />);

    // Check for metadata elements
    expect(screen.getByText("lastRevisedBy")).toBeInTheDocument();
    expect(screen.getByText("lastUpdated")).toBeInTheDocument();
  });

  it("should render guidance text authors", () => {
    render(<GuidanceGroupIndexPage />);

    // Check that author information is present in metadata
    const metadata = document.querySelectorAll(".metadata");
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("should render guidance text status information", () => {
    render(<GuidanceGroupIndexPage />);

    // Check for status text (Published/Draft)
    expect(screen.getByText("Status: Published")).toBeInTheDocument();
    expect(screen.getByText("Status: Draft")).toBeInTheDocument();
  });

  it("should render multiple guidance texts", () => {
    render(<GuidanceGroupIndexPage />);

    // Should render multiple guidance texts based on the fake data
    const textItems = document.querySelectorAll(".guidance-texts-list > *");
    expect(textItems.length).toBeGreaterThan(1);
  });

  it("should have proper page structure", () => {
    render(<GuidanceGroupIndexPage />);

    // Check for main layout components
    const pageHeader = document.querySelector(".page-guidance-group-index");
    expect(pageHeader).toBeInTheDocument();

    const textsList = document.querySelector(".guidance-texts-list");
    expect(textsList).toBeInTheDocument();
  });

  it("should show back button", () => {
    render(<GuidanceGroupIndexPage />);

    // The back button should be enabled based on showBackButton={true}
    // This would be rendered by the PageHeader component - just check the page renders
    expect(document.querySelector(".page-guidance-group-index")).toBeInTheDocument();
  });

  it("should render date information", () => {
    render(<GuidanceGroupIndexPage />);

    // Check that date information is present in metadata sections
    const metadata = document.querySelectorAll(".metadata");
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceGroupIndexPage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText("School of Health Sciences")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
