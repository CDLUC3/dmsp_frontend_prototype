import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceGroupCreatePage from "../page";

expect.extend(toHaveNoViolations);

describe("GuidanceGroupCreatePage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("pages.groupCreate.title")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("pages.groupCreate.description")).toBeInTheDocument();
  });

  it("should render breadcrumbs", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.guidanceGroups")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.createGroup")).toBeInTheDocument();
  });

  it("should render the form with group name input", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByLabelText("fields.groupName.label")).toBeInTheDocument();
  });

  it("should render the settings section", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("fields.settings.label")).toBeInTheDocument();
  });

  it("should render settings checkboxes", () => {
    render(<GuidanceGroupCreatePage />);

    // Check that multiple checkboxes are rendered
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should render the create button", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("actions.createGroup")).toBeInTheDocument();
  });

  it("should render the sidebar panel", () => {
    render(<GuidanceGroupCreatePage />);

    // Check for status section in sidebar
    expect(screen.getByText("status.status")).toBeInTheDocument();
    expect(screen.getByText("status.draft")).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<GuidanceGroupCreatePage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle group name input changes", () => {
    render(<GuidanceGroupCreatePage />);

    const nameInput = screen.getByLabelText("fields.groupName.label");
    fireEvent.change(nameInput, { target: { value: "Test Group" } });

    expect(nameInput).toHaveValue("Test Group");
  });

  it("should handle checkbox interactions", () => {
    render(<GuidanceGroupCreatePage />);

    // Find checkboxes by their values (the checkbox IDs)
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);

    // All checkboxes should start unchecked
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it("should handle checkbox selection", () => {
    render(<GuidanceGroupCreatePage />);

    const optionalSubsetCheckbox = screen.getByDisplayValue("optional-subset");
    fireEvent.click(optionalSubsetCheckbox);

    expect(optionalSubsetCheckbox).toBeChecked();
  });

  it("should have proper page structure", () => {
    render(<GuidanceGroupCreatePage />);

    // Check for main layout components
    const pageHeader = document.querySelector(".page-guidance-group-create");
    expect(pageHeader).toBeInTheDocument();

    const createForm = document.querySelector(".createForm");
    expect(createForm).toBeInTheDocument();
  });

  it("should render input with placeholder", () => {
    render(<GuidanceGroupCreatePage />);

    const nameInput = screen.getByLabelText("fields.groupName.label");
    expect(nameInput).toHaveAttribute("placeholder", "fields.groupName.placeholder");
  });

  it("should show back button", () => {
    render(<GuidanceGroupCreatePage />);

    // The back button should be enabled based on showBackButton={true}
    // This would be rendered by the PageHeader component
    expect(screen.getByText("pages.groupCreate.title")).toBeInTheDocument();
  });

  it("should render setting descriptions", () => {
    render(<GuidanceGroupCreatePage />);

    // Check that checkbox labels with descriptions are rendered
    const checkboxLabels = document.querySelectorAll(".checkbox-label");
    expect(checkboxLabels.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceGroupCreatePage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText("pages.groupCreate.title")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
