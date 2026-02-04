import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { NextIntlClientProvider } from "next-intl";

import { RelatedWorksIdentifierType, RelatedWorkStatus } from "@/generated/graphql";
import { RelatedWorksTabs } from "@/components/RelatedWorksTabs";

// Mock RelatedWorksList as it is already tested elsewhere
jest.mock("@/components/RelatedWorksList", () => ({
  RelatedWorksList: jest.fn(({ status }) => <div data-testid={`related-works-${status}`} />),
}));

const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NextIntlClientProvider
    locale="en"
    messages={{}}
  >
    {children}
  </NextIntlClientProvider>
);

describe("RelatedWorksTabs", () => {
  it("renders all tabs", () => {
    render(
      <TestProviders>
        <RelatedWorksTabs
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
        />
      </TestProviders>,
    );

    expect(screen.getByRole("tab", { name: "tabs.pending" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "tabs.accepted" })).toBeVisible();
    expect(screen.getByRole("tab", { name: "tabs.rejected" })).toBeVisible();
  });

  it("renders pending works by default", () => {
    render(
      <TestProviders>
        <RelatedWorksTabs
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
        />
      </TestProviders>,
    );

    expect(screen.getByTestId(`related-works-${RelatedWorkStatus.Pending}`)).toBeInTheDocument();
  });

  it("switches to accepted tab", async () => {
    render(
      <TestProviders>
        <RelatedWorksTabs
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByRole("tab", { name: "tabs.accepted" }));

    expect(screen.getByTestId(`related-works-${RelatedWorkStatus.Accepted}`)).toBeInTheDocument();
  });

  it("switches to rejected tab", async () => {
    render(
      <TestProviders>
        <RelatedWorksTabs
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
        />
      </TestProviders>,
    );

    await userEvent.click(screen.getByRole("tab", { name: "tabs.rejected" }));

    expect(screen.getByTestId(`related-works-${RelatedWorkStatus.Rejected}`)).toBeInTheDocument();
  });
});
