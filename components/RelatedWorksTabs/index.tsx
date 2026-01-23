import {
  RelatedWorksIdentifierType,
  RelatedWorkStatus
} from "@/generated/graphql";
import { RelatedWorksList } from "@/components/RelatedWorksList";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import React from "react";
import { useTranslations } from "next-intl";

interface RelatedWorksTabsProps {
  identifierType: RelatedWorksIdentifierType;
  identifier: number;
}

export const RelatedWorksTabs = ({ identifierType, identifier }: RelatedWorksTabsProps) => {
  const t = useTranslations("RelatedWorksTabs");

  return (
    <Tabs>
      <TabList aria-label="View related works">
        <Tab id="pending">
          <h2 className="h3 m-0">{t("tabs.pending")}</h2>
        </Tab>
        <Tab id="related">
          <h2 className="h3 m-0">{t("tabs.accepted")}</h2>
        </Tab>
        <Tab id="discarded">
          <h2 className="h3 m-0">{t("tabs.rejected")}</h2>
        </Tab>
      </TabList>
      <TabPanel id="pending">
        <RelatedWorksList
          identifierType={identifierType}
          identifier={identifier}
          status={RelatedWorkStatus.Pending}
        />
      </TabPanel>
      <TabPanel id="related">
        <RelatedWorksList
          identifierType={identifierType}
          identifier={identifier}
          status={RelatedWorkStatus.Accepted}
        />
      </TabPanel>
      <TabPanel id="discarded">
        <RelatedWorksList
          identifierType={identifierType}
          identifier={identifier}
          status={RelatedWorkStatus.Rejected}
        />
      </TabPanel>
    </Tabs>
  );
};
