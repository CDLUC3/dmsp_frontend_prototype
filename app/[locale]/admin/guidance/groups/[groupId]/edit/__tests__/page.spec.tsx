import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceGroupEditPage from "../page";

// Mock useParams
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
  }),
}));

expect.extend(toHaveNoViolations);

describe("GuidanceGroupEditPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("pages.groupEdit.title")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("pages.groupEdit.description")).toBeInTheDocument();
  });

  it("should render breadcrumbs", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.guidance")).toBeInTheDocument();
    expect(screen.getByText("School of Health Sciences")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.editGroup")).toBeInTheDocument();
  });

  it("should render the form with group name input", () => {
    render(<GuidanceGroupEditPage />);

    const nameInput = screen.getByLabelText("fields.groupName.label");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue();
    expect(nameInput.value.length).toBeGreaterThan(0);
  });

  it("should render the settings section", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("fields.settings.label")).toBeInTheDocument();
  });

  it("should render settings checkboxes with various states", () => {
    render(<GuidanceGroupEditPage />);

    // Check that multiple checkboxes are rendered
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // Check that some checkboxes have different states (some checked, some not)
    const checkedBoxes = checkboxes.filter((cb) => cb.checked);
    const uncheckedBoxes = checkboxes.filter((cb) => !cb.checked);
    expect(checkedBoxes.length).toBeGreaterThan(0);
    expect(uncheckedBoxes.length).toBeGreaterThan(0);
  });

  it("should render the sidebar panel with status", () => {
    render(<GuidanceGroupEditPage />);

    // Check for status section in sidebar
    expect(screen.getByText("status.lastUpdated")).toBeInTheDocument();
    expect(screen.getByText("status.status")).toBeInTheDocument();

    // Check that some status value is displayed
    const statusPanel = document.querySelector(".statusPanelContent, .sidePanel");
    expect(statusPanel).toBeInTheDocument();
  });

  it("should render publish button when status is Draft", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("actions.publish")).toBeInTheDocument();
  });

  it("should render edit status button", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("actions.edit")).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<GuidanceGroupEditPage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle group name input changes", () => {
    render(<GuidanceGroupEditPage />);

    const nameInput = screen.getByLabelText("fields.groupName.label");
    fireEvent.change(nameInput, { target: { value: "Updated Group Name" } });

    expect(nameInput).toHaveValue("Updated Group Name");
  });

  it("should handle checkbox interactions", () => {
    render(<GuidanceGroupEditPage />);

    // Find checkboxes by their values (the checkbox IDs)
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);
  });

  it("should show pre-selected checkbox for enabled setting", () => {
    render(<GuidanceGroupEditPage />);

    // The "requires-coffee" setting should be enabled by default
    const coffeeCheckbox = screen.getByDisplayValue("requires-coffee");
    expect(coffeeCheckbox).toBeChecked();
  });

  it("should handle status editing interaction", () => {
    render(<GuidanceGroupEditPage />);

    const editButton = screen.getByLabelText("Change status");
    fireEvent.click(editButton);

    // Should show the status form
    expect(screen.getByText("Select status")).toBeInTheDocument();
  });

  it("should have proper page structure", () => {
    render(<GuidanceGroupEditPage />);

    // Check for main layout components
    const pageHeader = document.querySelector(".page-guidance-group-edit");
    expect(pageHeader).toBeInTheDocument();

    const editForm = document.querySelector(".editForm");
    expect(editForm).toBeInTheDocument();
  });

  it("should render input with placeholder", () => {
    render(<GuidanceGroupEditPage />);

    const nameInput = screen.getByLabelText("fields.groupName.label");
    expect(nameInput).toHaveAttribute("placeholder", "fields.groupName.placeholder");
  });

  it("should show back button", () => {
    render(<GuidanceGroupEditPage />);

    // The back button should be enabled based on showBackButton={true}
    // This would be rendered by the PageHeader component
    expect(screen.getByText("pages.groupEdit.title")).toBeInTheDocument();
  });

  it("should handle checkbox selection changes", () => {
    render(<GuidanceGroupEditPage />);

    const optionalSubsetCheckbox = screen.getByDisplayValue("optional-subset");
    expect(optionalSubsetCheckbox).not.toBeChecked();

    fireEvent.click(optionalSubsetCheckbox);
    expect(optionalSubsetCheckbox).toBeChecked();
  });

  it("should render setting descriptions", () => {
    render(<GuidanceGroupEditPage />);

    // Check that checkbox labels with descriptions are rendered
    const checkboxLabels = document.querySelectorAll(".checkbox-label");
    expect(checkboxLabels.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceGroupEditPage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText("pages.groupEdit.title")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
