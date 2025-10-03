import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceGroupIndexPage from "../page";

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

expect.extend(toHaveNoViolations);

describe("GuidanceGroupIndexPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render action buttons", () => {
    render(<GuidanceGroupIndexPage />);

    expect(screen.getByText("pages.groupIndex.editGroup")).toBeInTheDocument();
    expect(screen.getByText("pages.groupIndex.createText")).toBeInTheDocument();
  });

  it("should render guidance texts list", () => {
    render(<GuidanceGroupIndexPage />);

    const listContainer = screen.getByLabelText("Guidance texts list");
    expect(listContainer).toBeInTheDocument();
    expect(listContainer).toHaveAttribute("role", "list");
  });

  it("should render guidance text items", () => {
    render(<GuidanceGroupIndexPage />);

    const textItems = document.querySelectorAll('.guidance-texts-list > *, [role="listitem"]');
    expect(textItems.length).toBeGreaterThan(0);
  });

  it("should render guidance text metadata", () => {
    render(<GuidanceGroupIndexPage />);

    expect(screen.getAllByText(/lastRevisedBy/)).toHaveLength(3);
    expect(screen.getAllByText(/lastUpdated/)).toHaveLength(3);
  });

  it("should render guidance text authors", () => {
    render(<GuidanceGroupIndexPage />);

    const metadata = document.querySelectorAll(".metadata");
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("should render guidance text status information", () => {
    render(<GuidanceGroupIndexPage />);

    expect(screen.getAllByText(/status\.status\s*:\s*Published/)).toHaveLength(2);
    expect(screen.getByText(/status\.status\s*:\s*Draft/)).toBeInTheDocument();
  });

  it("should render multiple guidance texts", () => {
    render(<GuidanceGroupIndexPage />);

    const textItems = document.querySelectorAll(".guidance-texts-list > *");
    expect(textItems.length).toBeGreaterThan(1);
  });

  it("should have group-specific structure", () => {
    render(<GuidanceGroupIndexPage />);

    const textsList = document.querySelector(".guidance-texts-list");
    expect(textsList).toBeInTheDocument();
  });

  it("should render date information", () => {
    render(<GuidanceGroupIndexPage />);

    const metadata = document.querySelectorAll(".metadata");
    expect(metadata.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceGroupIndexPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Guidance texts list")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
