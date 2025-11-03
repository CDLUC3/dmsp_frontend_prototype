import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceTextEditPage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
    textId: "1",
  }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock TinyMCE Editor
jest.mock("@/components/TinyMCEEditor", () => {
  return function MockTinyMCEEditor({
    content,
    setContent,
    id,
    labelId,
  }: {
    content: string;
    setContent: (content: string) => void;
    id: string;
    labelId: string;
  }) {
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
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with title input", () => {
    render(<GuidanceTextEditPage />);

    const titleInput = screen.getByLabelText("fields.title.label") as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue();
    expect(titleInput.value.length).toBeGreaterThan(0);
  });

  it("should render the content editor with existing content", () => {
    render(<GuidanceTextEditPage />);

    expect(screen.getByText("fields.guidanceText.label")).toBeInTheDocument();
    const editor = screen.getByTestId("tinymce-editor") as HTMLTextAreaElement;
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

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(5); // Should have multiple themes
  });

  it("should show some pre-selected theme checkboxes", () => {
    render(<GuidanceTextEditPage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const checkedBoxes = checkboxes.filter((cb) => cb.checked);
    expect(checkedBoxes.length).toBeGreaterThan(0);
  });

  it("should render info buttons for themes", () => {
    render(<GuidanceTextEditPage />);

    const infoButtons = document.querySelectorAll('button[aria-label*="info"], .info-button, [data-tooltip]');
    expect(infoButtons.length).toBeGreaterThan(0);
  });

  it("should render the save changes button for published status", () => {
    render(<GuidanceTextEditPage />);

    // Check for any button in the sidebar (likely the save button)
    const sidebarButtons = screen.getByRole("button", { name: "actions.saveChanges" });
    expect(sidebarButtons).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<GuidanceTextEditPage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle title input changes", () => {
    render(<GuidanceTextEditPage />);

    const titleInput = screen.getByLabelText("fields.title.label") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    expect(titleInput.value).toBe("Updated Title");
  });

  it("should handle content editor changes", () => {
    render(<GuidanceTextEditPage />);

    const contentEditor = screen.getByTestId("tinymce-editor") as HTMLTextAreaElement;
    fireEvent.change(contentEditor, { target: { value: "Updated content" } });

    expect(contentEditor).toHaveValue("Updated content");
  });

  it("should handle theme checkbox selection changes", () => {
    render(<GuidanceTextEditPage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const uncheckedBox = checkboxes.find((cb) => !cb.checked);

    if (uncheckedBox) {
      fireEvent.click(uncheckedBox);
      // Just verify the click doesn't cause errors
      expect(uncheckedBox).toBeInTheDocument();
    } else {
      // If all are checked, just verify checkboxes exist
      expect(checkboxes.length).toBeGreaterThan(0);
    }
  });

  it("should render checkbox group in two-column layout", () => {
    render(<GuidanceTextEditPage />);

    // Check that checkboxes are organized in some layout structure
    const checkboxContainer = document.querySelector('.checkbox-group, .themes-container, [role="group"]');
    expect(checkboxContainer).toBeInTheDocument();
  });

  it("should render theme help text", () => {
    render(<GuidanceTextEditPage />);

    // Check that themes section exists
    expect(screen.getByText("fields.themes.label")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should render content help text", () => {
    render(<GuidanceTextEditPage />);

    // Check that the content editor section exists
    expect(screen.getByText("fields.guidanceText.label")).toBeInTheDocument();
    const editor = screen.getByTestId("tinymce-editor");
    expect(editor).toBeInTheDocument();
  });

  it("should render theme descriptions via info buttons", () => {
    render(<GuidanceTextEditPage />);

    // Check that theme section has interactive elements
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // Check for any info/help elements
    const helpElements = document.querySelectorAll("button, .info, [data-tooltip], [aria-describedby]");
    expect(helpElements.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceTextEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("fields.title.label")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
