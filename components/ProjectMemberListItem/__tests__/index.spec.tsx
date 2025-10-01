import React, { ReactNode } from "react";
import { act, fireEvent, render, screen } from "@/utils/test-utils";
import { axe, toHaveNoViolations } from "jest-axe";
import { RichTranslationValues } from "next-intl";
import ProjectMemberListItem from "../index";

expect.extend(toHaveNoViolations);

type MockUseTranslations = {
  (key: string, ...args: unknown[]): string;
  rich: (key: string, values?: RichTranslationValues) => ReactNode;
};

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => {
    const mockUseTranslations: MockUseTranslations = ((key: string) => key) as MockUseTranslations;

    mockUseTranslations.rich = (key, values) => {
      const p = values?.p;
      if (typeof p === "function") {
        return p(key); // Can return JSX
      }
      return key; // fallback
    };

    return mockUseTranslations;
  }),
}));

const mockOnEdit = jest.fn();

const mockMember = {
  id: 1,
  fullName: "Dr. Jane Smith",
  affiliation: "University of Example",
  orcid: "0000-0001-2345-6789",
  role: "Principal Investigator",
};

const props = {
  member: mockMember,
  onEdit: mockOnEdit,
};

describe("ProjectMemberListItem", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    HTMLElement.prototype.scrollIntoView = jest.fn();
    mockOnEdit.mockClear();
  });

  it("should render the main content", async () => {
    await act(async () => {
      render(
        <ProjectMemberListItem
          member={props.member}
          onEdit={props.onEdit}
        />,
      );
    });

    const role = screen.getByRole("listitem");
    const name = screen.getByText("Dr. Jane Smith");
    const memberRole = screen.getByText("Principal Investigator");
    const editButton = screen.getByRole("button");
    const orcidLink = screen.getByRole("link", { name: /ariaLabels\.orcidProfile/i });

    expect(role).toBeInTheDocument();
    expect(name).toBeInTheDocument();
    expect(memberRole).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
    expect(orcidLink).toBeInTheDocument();
    expect(orcidLink).toHaveAttribute("href", "https://orcid.org/0000-0001-2345-6789");
  });

  it("should render without ORCID when not provided", async () => {
    const memberWithoutOrcid = {
      ...mockMember,
      orcid: "",
    };

    await act(async () => {
      render(
        <ProjectMemberListItem
          member={memberWithoutOrcid}
          onEdit={props.onEdit}
        />,
      );
    });

    const name = screen.getByText("Dr. Jane Smith");
    const orcidLink = screen.queryByRole("link", { name: /ariaLabels\.orcidProfile/i });

    expect(name).toBeInTheDocument();
    expect(orcidLink).not.toBeInTheDocument();
  });

  it("should render without edit button when onEdit is not provided", async () => {
    await act(async () => {
      render(<ProjectMemberListItem member={props.member} />);
    });

    const name = screen.getByText("Dr. Jane Smith");
    const editButton = screen.queryByRole("button", { name: /ariaLabels\.editMember/i });

    expect(name).toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
  });

  it("should call onEdit method when user clicks the edit button", async () => {
    await act(async () => {
      render(
        <ProjectMemberListItem
          member={props.member}
          onEdit={props.onEdit}
        />,
      );
    });

    const editButton = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(editButton);
    });

    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  it("should pass accessibility tests", async () => {
    /*Need to wrap the component in a div with role='list' to prevent
    an accessibility error because the component uses role = 'listitem' */
    const { container } = render(
      <div role="list">
        <ProjectMemberListItem
          member={props.member}
          onEdit={props.onEdit}
        />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
