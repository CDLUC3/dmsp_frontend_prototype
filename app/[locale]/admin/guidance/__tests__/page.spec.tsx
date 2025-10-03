import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidancePage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

expect.extend(toHaveNoViolations);

describe("GuidancePage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the create group button", () => {
    render(<GuidancePage />);

    expect(screen.getByText("pages.index.createGroup")).toBeInTheDocument();
  });

  it("should render guidance groups list", () => {
    render(<GuidancePage />);

    const listContainer = screen.getByLabelText("Guidance groups list");
    expect(listContainer).toBeInTheDocument();
    expect(listContainer).toHaveAttribute("role", "list");
  });

  it("should render guidance group items", () => {
    render(<GuidancePage />);

    const listItems = document.querySelectorAll('[role="listitem"], .guidance-content');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it("should render guidance group metadata", () => {
    render(<GuidancePage />);

    const lastRevisedElements = screen.getAllByText(/lastRevisedBy/);
    const lastUpdatedElements = screen.getAllByText(/lastUpdated/);
    expect(lastRevisedElements.length).toBeGreaterThan(0);
    expect(lastUpdatedElements.length).toBeGreaterThan(0);
  });

  it("should render guidance group descriptions", () => {
    render(<GuidancePage />);

    const descriptions = document.querySelectorAll(".description");
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it("should render guidance group status information", () => {
    render(<GuidancePage />);

    const publishedElements = screen.getAllByText(/status\.status\s*:\s*Published/);
    const draftElements = screen.getAllByText(/status\.status\s*:\s*Draft/);
    expect(publishedElements.length).toBeGreaterThan(0);
    expect(draftElements.length).toBeGreaterThan(0);
  });

  it("should render multiple guidance groups", () => {
    render(<GuidancePage />);

    const guidanceItems = document.querySelectorAll(".guidance-list > *");
    expect(guidanceItems.length).toBeGreaterThan(1);
  });

  it("should have guidance-specific structure", () => {
    render(<GuidancePage />);

    const guidanceList = document.querySelector(".guidance-list");
    expect(guidanceList).toBeInTheDocument();
  });

  it("should render author information in metadata", () => {
    render(<GuidancePage />);

    const metadata = document.querySelectorAll(".metadata");
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidancePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Guidance groups list")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
