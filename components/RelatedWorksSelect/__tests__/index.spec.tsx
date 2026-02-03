import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { useQuery } from "@apollo/client/react";
import { NextIntlClientProvider } from "next-intl";

import { ProjectDocument } from "@/generated/graphql";
import { ProjectPlanSelect, RelatedWorksSelect } from "@/components/RelatedWorksSelect";


jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = jest.mocked(useQuery);

const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider
    locale="en"
    messages={{}}
  >
    {children}
  </NextIntlClientProvider>
);

describe("ProjectPlanSelect", () => {
  it("renders registered plans only", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === ProjectDocument) {
        return {
          data: {
            project: {
              plans: [
                { id: 1, title: "Registered Plan", registered: "2024-01-01" },
                { id: 2, title: "Unregistered Plan", registered: null },
              ],
            },
          },
          loading: false,
          error: undefined,
        } as any;
      }
      return { data: null, loading: false, error: undefined };
    });

    const setSelectedKey = jest.fn();

    render(
      <TestProviders>
        <ProjectPlanSelect
          projectId={1}
          selectedKey={null}
          setSelectedKey={setSelectedKey}
        />
      </TestProviders>,
    );

    // Open select
    await userEvent.click(screen.getByRole("button"));

    const options = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((o) => o.textContent);

    expect(options).toContain("Registered Plan");
    expect(options).not.toContain("Unregistered Plan");
  });
});

describe("RelatedWorksSelect", () => {
  it("renders items and allows selection", async () => {
    const setSelectedKey = jest.fn();

    render(
      <RelatedWorksSelect
        placeholder="Select item"
        selectedKey={null}
        setSelectedKey={setSelectedKey}
        items={[
          { id: 1, label: "Item One" },
          { id: 2, label: "Item Two" },
        ]}
      />,
    );

    // Open select
    await userEvent.click(screen.getByRole("button"));

    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["Item One", "Item Two"]);

    await userEvent.click(options[1]);
    expect(setSelectedKey).toHaveBeenCalledWith(2);
  });

  it("supports empty value selection", async () => {
    const setSelectedKey = jest.fn();

    render(
      <RelatedWorksSelect
        placeholder="Select item"
        selectedKey={1}
        setSelectedKey={setSelectedKey}
        includeEmptyValue
        items={[{ id: 1, label: "Item One" }]}
      />,
    );

    await userEvent.click(screen.getByRole("button"));

    const options = within(screen.getByRole("listbox")).getAllByRole("option");

    // Empty placeholder option
    await userEvent.click(options[0]);
    expect(setSelectedKey).toHaveBeenCalledWith(null);
  });
});
