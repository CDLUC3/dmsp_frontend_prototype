import styles from "./RelatedWorksList.module.scss";
import RelatedWorksListItem from "@/components/RelatedWorksListItem";
import Pagination from "@/components/Pagination";
import LinkFilter from "@/components/LinkFilter";
import React, { useState } from "react";
import { Button, FieldError, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import { RelatedWork } from "@/app/types";

interface RelatedWorksListProps {
  works: RelatedWork[];
}

export const RelatedWorksList = ({ works }: RelatedWorksListProps) => {
  const [whatMatched, setWhatMatched] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <FilterByConfidence />
        <FilterByType />
        <WhatMatched
          whatMatched={whatMatched}
          setWhatMatched={setWhatMatched}
        />
      </div>

      <div className={styles.list}>
        {works.map((work) => (
          <RelatedWorksListItem
            key={work.work.doi}
            item={work}
            whatMatched={whatMatched}
          />
        ))}
      </div>
      <div className={styles.footer}>
        <Pagination
          currentPage={1}
          totalPages={10}
          hasPreviousPage={false}
          hasNextPage={true}
          handlePageClick={(page: number) => {}}
        />
      </div>
    </div>
  );
};

interface FilterByConfidenceProps {}

const FilterByConfidence = ({}: FilterByConfidenceProps) => {
  const categories = [
    { label: "All", id: "all" },
    { label: "High", id: "high", count: 1 },
    { label: "Medium", id: "medium", count: 1 },
    { label: "Low", id: "low", count: 1 },
  ];
  return (
    <LinkFilter
      label={"Filter by Confidence"}
      categories={categories}
    />
  );
};

interface FilterByTypeProps {}

const FilterByType = ({}: FilterByTypeProps) => {
  // TODO: probably want the displayed types to change based on what types have been returned to user
  const workTypes = [
    { label: "Article", id: "article" },
    { label: "Audio Visual", id: "audio-visual" },
    { label: "Book", id: "book" },
    { label: "Book Chapter", id: "book-chapter" },
    { label: "Collection", id: "collection" },
    { label: "Data Paper", id: "data-paper" },
    { label: "Dataset", id: "dataset" },
    { label: "Dissertation", id: "dissertation" },
    { label: "Editorial", id: "editorial" },
    { label: "Erratum", id: "erratum" },
    { label: "Event", id: "event" },
    { label: "Grant", id: "grant" },
    { label: "Image", id: "image" },
    { label: "Interactive Resource", id: "interactive-resource" },
    { label: "Letter", id: "letter" },
    { label: "Libguides", id: "libguides" },
    { label: "Model", id: "model" },
    { label: "Other", id: "other" },
    { label: "Paratext", id: "paratext" },
    { label: "Peer Review", id: "peer-review" },
    { label: "Physical Object", id: "physical-object" },
    { label: "Preprint", id: "preprint" },
    { label: "Reference Entry", id: "reference-entry" },
    { label: "Report", id: "report" },
    { label: "Retraction", id: "retraction" },
    { label: "Review", id: "review" },
    { label: "Service", id: "service" },
    { label: "Software", id: "software" },
    { label: "Sound", id: "sound" },
    { label: "Standard", id: "standard" },
    { label: "Supplementary Materials", id: "supplementary-materials" },
    { label: "Text", id: "text" },
    { label: "Workflow", id: "workflow" },
  ];
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const placeholder = "Filter by Type";

  return (
    <div className={styles.filterByType}>
      <Select
        placeholder={placeholder}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          setSelectedKey(key !== "" ? (key as string) : null);
        }}
      >
        <Label>Filter by Type</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem
              id=""
              style={{ fontStyle: "italic" }}
            >
              {placeholder}
            </ListBoxItem>
            {workTypes.map((workType) => (
              <ListBoxItem
                key={workType.id}
                id={workType.id}
              >
                {workType.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
        <FieldError />
      </Select>
    </div>
  );
};

interface WhatMatchedProps {
  whatMatched: string | null;
  setWhatMatched: (whatMatched: string | null) => void;
}

const WhatMatched = ({ whatMatched, setWhatMatched }: WhatMatchedProps) => {
  const placeholder = "What Matched";

  return (
    <div className={styles.whatMatched}>
      <Select
        placeholder={placeholder}
        selectedKey={whatMatched}
        onSelectionChange={(key) => {
          setWhatMatched(key !== "" ? (key as string) : null);
        }}
      >
        <Label>What Matched?</Label>
        <Button>
          <SelectValue />
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem
              id=""
              style={{ fontStyle: "italic" }}
            >
              {placeholder}
            </ListBoxItem>
            <ListBoxItem id="highlight">Highlight</ListBoxItem>
            <ListBoxItem id="matched-only">Matched Only</ListBoxItem>
          </ListBox>
        </Popover>
        <FieldError />
      </Select>
    </div>
  );
};
