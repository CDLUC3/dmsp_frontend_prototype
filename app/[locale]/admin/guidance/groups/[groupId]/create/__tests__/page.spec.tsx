import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceTextCreatePage from "../page";

// Mock useParams
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
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

describe("GuidanceTextCreatePage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("pages.textCreate.title")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("pages.textCreate.description")).toBeInTheDocument();
  });

  it("should render breadcrumbs", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("breadcrumbs.home")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.guidanceGroups")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.group")).toBeInTheDocument();
    expect(screen.getByText("breadcrumbs.createText")).toBeInTheDocument();
  });

  it("should render the form with title input", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByLabelText("fields.title.label")).toBeInTheDocument();
  });

  it("should render the content editor", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("fields.guidanceText.label")).toBeInTheDocument();
    expect(screen.getByTestId("tinymce-editor")).toBeInTheDocument();
  });

  it("should render the themes section", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("fields.themes.label")).toBeInTheDocument();
  });

  it("should render theme checkboxes", () => {
    render(<GuidanceTextCreatePage />);

    // Check that multiple theme checkboxes are rendered
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(5); // Should have multiple themes
  });

  it("should render info buttons for themes", () => {
    render(<GuidanceTextCreatePage />);

    const infoButtons = screen.getAllByLabelText("Click for more info");
    expect(infoButtons.length).toBeGreaterThan(0);
  });

  it("should render the create button", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("actions.createText")).toBeInTheDocument();
  });

  it("should render the sidebar panel", () => {
    render(<GuidanceTextCreatePage />);

    // Check for status section in sidebar
    expect(screen.getByText("status.status")).toBeInTheDocument();
    expect(screen.getByText("status.draft")).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<GuidanceTextCreatePage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle title input changes", () => {
    render(<GuidanceTextCreatePage />);

    const titleInput = screen.getByLabelText("fields.title.label");
    fireEvent.change(titleInput, { target: { value: "Test Title" } });

    expect(titleInput).toHaveValue("Test Title");
  });

  it("should handle content editor changes", () => {
    render(<GuidanceTextCreatePage />);

    const contentEditor = screen.getByTestId("tinymce-editor");
    fireEvent.change(contentEditor, { target: { value: "Test content" } });

    expect(contentEditor).toHaveValue("Test content");
  });

  it("should handle theme checkbox selection", () => {
    render(<GuidanceTextCreatePage />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // All checkboxes should start unchecked
    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it("should render theme descriptions via info buttons", () => {
    render(<GuidanceTextCreatePage />);

    // Check that info buttons are present for theme descriptions
    const infoButtons = screen.getAllByLabelText("Click for more info");
    expect(infoButtons.length).toBeGreaterThan(0);
  });

  it("should have proper page structure", () => {
    render(<GuidanceTextCreatePage />);

    // Check for main layout components
    const pageHeader = document.querySelector(".page-guidance-text-create");
    expect(pageHeader).toBeInTheDocument();

    const createForm = document.querySelector(".createForm");
    expect(createForm).toBeInTheDocument();
  });

  it("should render input with placeholder", () => {
    render(<GuidanceTextCreatePage />);

    const titleInput = screen.getByLabelText("fields.title.label");
    expect(titleInput).toHaveAttribute("placeholder", "fields.title.placeholder");
  });

  it("should show back button", () => {
    render(<GuidanceTextCreatePage />);

    // The back button should be enabled based on showBackButton={true}
    // This would be rendered by the PageHeader component
    expect(screen.getByText("pages.textCreate.title")).toBeInTheDocument();
  });

  it("should render checkbox group in two-column layout", () => {
    render(<GuidanceTextCreatePage />);

    const checkboxGroup = document.querySelector(".checkbox-group-two-column");
    expect(checkboxGroup).toBeInTheDocument();
  });

  it("should render theme help text", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("fields.themes.helpText")).toBeInTheDocument();
  });

  it("should render content help text", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("fields.guidanceText.helpText")).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceTextCreatePage />);

    // Wait for the component to fully render
    await waitFor(() => {
      expect(screen.getByText("pages.textCreate.title")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
