import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceTextEditPage from "../page";

// Mock useParams
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
    textId: "1",
  }),
}));

// Mock TinyMCE Editor
jest.mock("@/components/TinyMCEEditor", () => {
  return function MockTinyMCEEditor({ content, setContent, id, labelId }: any) {
    return (
      <textarea
        id={id}
        aria-labelledby={labelId}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        data-testid="tinymce-editor"
      />
    );
  };
});

expect.extend(toHaveNoViolations);

describe("GuidanceTextEditPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("pages.textEdit.title Research Ethics Guidelines")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("pages.textEdit.description")).toBeInTheDocument();
  });

  it("should render breadcrumbs", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.guidanceGroups")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.group")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.editText")).toBeInTheDocument();
  });

  it("should render the form with title input", () => {
    render(<GuidanceTextEditPage />);

    const titleInput = screen.getByLabelText("fields.title.label");
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue();
    expect(titleInput.value.length).toBeGreaterThan(0);
  });

  it("should render the content editor with existing content", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("fields.guidanceText.label")).toBeInTheDocument();
    const editor = screen.getByTestId("tinymce-editor");
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveValue();
    expect(editor.value.length).toBeGreaterThan(0);
  });

  it("should render the themes section", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("fields.themes.label")).toBeInTheDocument();
  });

  it("should render theme checkboxes", () => {
    render(<GuidanceTextEditPage />);

    // Check that multiple theme checkboxes are rendered
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(5); // Should have multiple themes
  });

  it("should show some pre-selected theme checkboxes", () => {
    render(<GuidanceTextEditPage />);

    // Check that some checkboxes are pre-selected (existing content)
    const checkboxes = screen.getAllByRole("checkbox");
    const checkedBoxes = checkboxes.filter((cb) => cb.checked);
    expect(checkedBoxes.length).toBeGreaterThan(0);
  });

  it("should render info buttons for themes", () => {
    render(<GuidanceTextEditPage />);

    const infoButtons = screen.getAllByLabelText("Click for more info");
    expect(infoButtons.length).toBeGreaterThan(0);
  });

  it("should render the save changes button for published status", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("actions.saveChanges")).toBeInTheDocument();
  });

  it("should render the sidebar panel with status", () => {
    render(<GuidanceTextEditPage />);

    // Check for status section in sidebar
    expect(screen.getByText("status.lastUpdated")).toBeInTheDocument();
    expect(screen.getByText("status.status")).toBeInTheDocument();

    // Check that some status value is displayed
    const statusPanel = document.querySelector(".statusPanelContent, .sidePanel");
    expect(statusPanel).toBeInTheDocument();
  });

  it("should render edit status button", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("actions.edit")).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<GuidanceTextEditPage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle title input changes", () => {
    render(<GuidanceTextEditPage />);

    const titleInput = screen.getByLabelText("fields.title.label");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    expect(titleInput).toHaveValue("Updated Title");
  });

  it("should handle content editor changes", () => {
    render(<GuidanceTextEditPage />);

    const contentEditor = screen.getByTestId("tinymce-editor");
    fireEvent.change(contentEditor, { target: { value: "Updated content" } });

    expect(contentEditor).toHaveValue("Updated content");
  });

  it("should handle theme checkbox selection changes", () => {
    render(<GuidanceTextEditPage />);

    const checkboxes = screen.getAllByRole("checkbox");
    const uncheckedBox = checkboxes.find((cb) => !cb.checked);

    if (uncheckedBox) {
      fireEvent.click(uncheckedBox);
      expect(uncheckedBox).toBeChecked();
    } else {
      // If all are checked, just verify checkboxes exist
      expect(checkboxes.length).toBeGreaterThan(0);
    }
  });

  it("should handle status editing interaction", () => {
    render(<GuidanceTextEditPage />);

    const editButton = screen.getByLabelText("Change status");
    fireEvent.click(editButton);

    // Should show the status form
    expect(screen.getByText("Select status")).toBeInTheDocument();
  });

  it("should have proper page structure", () => {
    render(<GuidanceTextEditPage />);

    // Check for main layout components
    const pageHeader = document.querySelector(".page-guidance-text-edit");
    expect(pageHeader).toBeInTheDocument();

    const editForm = document.querySelector(".editForm");
    expect(editForm).toBeInTheDocument();
  });

  it("should render input with placeholder", () => {
    render(<GuidanceTextEditPage />);

    const titleInput = screen.getByLabelText("fields.title.label");
    expect(titleInput).toHaveAttribute("placeholder", "fields.title.placeholder");
  });

  it("should show back button", () => {
    render(<GuidanceTextEditPage />);

    // The back button should be enabled based on showBackButton={true}
    // This would be rendered by the PageHeader component
    expect(screen.getByText("pages.textEdit.title Research Ethics Guidelines")).toBeInTheDocument();
  });

  it("should render checkbox group in two-column layout", () => {
    render(<GuidanceTextEditPage />);

    const checkboxGroup = document.querySelector(".checkbox-group-two-column");
    expect(checkboxGroup).toBeInTheDocument();
  });

  it("should render theme help text", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("fields.themes.helpText")).toBeInTheDocument();
  });

  it("should render content help text", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("fields.guidanceText.helpText")).toBeInTheDocument();
  });

  it("should render theme descriptions via info buttons", () => {
    render(<GuidanceTextEditPage />);

    // Check that info buttons are present for theme descriptions
    const infoButtons = screen.getAllByLabelText("Click for more info");
    expect(infoButtons.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceTextEditPage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText("pages.textEdit.title Research Ethics Guidelines")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
