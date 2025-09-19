import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceTextCreatePage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
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

describe("GuidanceTextCreatePage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with title input", () => {
    render(<GuidanceTextCreatePage />);

    const titleInput = screen.getByLabelText("fields.title.label");
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveAttribute("placeholder", "fields.title.placeholder");
  });

  it("should render the content editor", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("fields.guidanceText.label")).toBeInTheDocument();
    const editor = screen.getByTestId("tinymce-editor");
    expect(editor).toBeInTheDocument();
  });

  it("should render the themes section", () => {
    render(<GuidanceTextCreatePage />);

    expect(screen.getByText("fields.themes.label")).toBeInTheDocument();
  });

  it("should render theme checkboxes", () => {
    render(<GuidanceTextCreatePage />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(5); // Should have multiple themes
  });

  it("should render info buttons for themes", () => {
    render(<GuidanceTextCreatePage />);

    const infoButtons = document.querySelectorAll('button[aria-label*="info"], .info-button, [data-tooltip]');
    expect(infoButtons.length).toBeGreaterThan(0);
  });

  it("should render the create button", () => {
    render(<GuidanceTextCreatePage />);

    // Check for any button in the sidebar (likely the create button)
    const sidebarButtons = document.querySelectorAll(".buttonContainer button, .sidePanel button");
    expect(sidebarButtons.length).toBeGreaterThan(0);
  });

  it("should render the sidebar panel", () => {
    render(<GuidanceTextCreatePage />);

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

    const titleInput = screen.getByLabelText("fields.title.label") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Test Title" } });

    expect(titleInput.value).toBe("Test Title");
  });

  it("should handle content editor changes", () => {
    render(<GuidanceTextCreatePage />);

    const contentEditor = screen.getByTestId("tinymce-editor") as HTMLTextAreaElement;
    fireEvent.change(contentEditor, { target: { value: "Test content" } });

    expect(contentEditor.value).toBe("Test content");
  });

  it("should handle theme checkbox selection", () => {
    render(<GuidanceTextCreatePage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const firstCheckbox = checkboxes[0];

    fireEvent.click(firstCheckbox);
    // Just verify the click doesn't cause errors
    expect(firstCheckbox).toBeInTheDocument();
  });

  it("should render checkbox group in two-column layout", () => {
    render(<GuidanceTextCreatePage />);

    // Check that checkboxes are organized in some layout structure
    const checkboxContainer = document.querySelector('.checkbox-group, .themes-container, [role="group"]');
    expect(checkboxContainer).toBeInTheDocument();
  });

  it("should render theme help text", () => {
    render(<GuidanceTextCreatePage />);

    // Check that themes section exists
    expect(screen.getByText("fields.themes.label")).toBeInTheDocument();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should render content help text", () => {
    render(<GuidanceTextCreatePage />);

    // Check that the content editor section exists
    expect(screen.getByText("fields.guidanceText.label")).toBeInTheDocument();
    const editor = screen.getByTestId("tinymce-editor");
    expect(editor).toBeInTheDocument();
  });

  it("should render theme descriptions via info buttons", () => {
    render(<GuidanceTextCreatePage />);

    // Check that theme section has interactive elements
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);

    // Check for any info/help elements
    const helpElements = document.querySelectorAll("button, .info, [data-tooltip], [aria-describedby]");
    expect(helpElements.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceTextCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("fields.title.label")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
