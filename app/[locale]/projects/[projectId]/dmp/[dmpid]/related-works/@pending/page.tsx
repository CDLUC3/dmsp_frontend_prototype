"use client";

import RelatedWorksListItem from "@/components/RelatedWorksListItem";
import styles from "./RelatedWorksList.module.scss";
import { Status } from "@/app/types";
import Pagination from "@/components/Pagination";
import React, { useState } from "react";
import { Button, FieldError, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import LinkFilter from "@/components/LinkFilter";

const works = [
  {
    dmpDoi: "",
    work: {
      doi: "10.1126/fake.2025.084512",
      type: "article",
      score: 0.3,
      title: "NeuroSynthetics: Toward Biologically-Inspired Cognitive Robotics",
      publicationDate: new Date(2020, 4, 15),
      containerTitle: "Journal of Future Robotics Research",
      authors: [
        {
          firstInitial: "A",
          givenName: "Alyssa",
          middleInitial: "M",
          middleName: "Marie",
          surname: "Langston",
          full: null,
          orcid: "0000-0003-1234-5678",
        },
        {
          firstInitial: "D",
          givenName: "David",
          middleInitial: null,
          middleName: null,
          surname: "Choi",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "L",
          givenName: "Liam",
          middleInitial: "J",
          middleName: "James",
          surname: "Patel",
          full: null,
          orcid: "0000-0002-9876-5432",
        },
        {
          firstInitial: "N",
          givenName: "Natalie",
          middleInitial: null,
          middleName: null,
          surname: "Martinez",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "S",
          givenName: "Samuel",
          middleInitial: null,
          middleName: null,
          surname: "Okafor",
          full: null,
          orcid: "0000-0001-8765-4321",
        },
        {
          firstInitial: "J",
          givenName: "Jasmine",
          middleInitial: null,
          middleName: null,
          surname: "Reynolds",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "K",
          givenName: "Kieran",
          middleInitial: null,
          middleName: null,
          surname: "Wang",
          full: null,
          orcid: "0000-0004-2299-1122",
        },
        {
          firstInitial: "E",
          givenName: "Emily",
          middleInitial: "R",
          middleName: "Rose",
          surname: "Carter",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "O",
          givenName: "Omar",
          middleInitial: null,
          middleName: null,
          surname: "Hassan",
          full: null,
          orcid: "0000-0005-6677-8899",
        },
        {
          firstInitial: "T",
          givenName: "Talia",
          middleInitial: null,
          middleName: null,
          surname: "Nguyen",
          full: null,
          orcid: null,
        },
      ],
      institutions: [
        { ror: "042nb2s44", name: "Massachusetts Institute of Technology" },
        { ror: "05x2bcf33", name: "Carnegie Mellon University" },
      ],
      funders: [
        { ror: "021nxhr62", name: "U.S. National Science Foundation" },
        { ror: "01cwqze88", name: "National Institutes of Health" },
      ],
      awardIds: ["2357894", "R01 HL201245-02"],
      source: { name: "OpenAlex", url: "https://openalex.org/works/w2060245136" }
    },
    dateFound: new Date(2025, 7, 21),
    status: Status.Pending,
    match: {
      doi: false,
      title: null, //"<mark>NeuroSynthetics</mark>: Toward Biologically-Inspired <mark>Cognitive Robotics</mark>",
      abstract: [],
      awardIds: [],
      authors: [],
      institutions: [1],
      funders: [0],
    },
  },
  {
    dmpDoi: "",
    work: {
      doi: "10.1016/fake.2025.293748",
      type: "article",
      score: 0.6,
      title: "Synthetic Empathy: Emotional Intelligence in Autonomous Agents",
      publicationDate: new Date(2024, 2, 10),
      containerTitle: "Artificial Intelligence & Society",
      authors: [
        {
          firstInitial: "M",
          givenName: "Marcus",
          middleInitial: null,
          middleName: null,
          surname: "Nguyen",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "R",
          givenName: "Rebecca",
          middleInitial: "L",
          middleName: "Lee",
          surname: "Stone",
          full: null,
          orcid: "0000-0001-2233-4455",
        },
        {
          firstInitial: "S",
          givenName: "Sofia",
          middleInitial: null,
          middleName: null,
          surname: "Delgado",
          full: null,
          orcid: "0000-0004-1122-3344",
        },
      ],
      institutions: [
        { ror: "00f54p054", name: "Stanford University" },
        { ror: "01an7q238", name: "University of California, Berkeley" },
      ],
      funders: [{ ror: "021nxhr62", name: "U.S. National Science Foundation" }],
      awardIds: ["2145023"],
      source:
        { name: "OpenAlex", url: "https://openalex.org/works/w2060245136" }
    },
    dateFound: new Date(2025, 7, 21),
    status: Status.Pending,
    match: {
      doi: false,
      title: "<mark>Synthetic Empathy</mark>: <mark>Emotional Intelligence</mark> in <mark>Autonomous Agents</mark>",
      abstract: [
        // "... the need for systems with <mark>emotional intelligence</mark> is critical. We propose a hybrid architecture that enables <mark>autonomous agents</mark> to recognize, model, and simulate empathetic responses.",
        // "Evaluations in human-agent interaction studies reveal that <mark>synthetic empathy</mark> increases user trust and engagement...",
      ],
      awardIds: [],
      authors: [0, 3],
      institutions: [0, 1],
      funders: [0],
    },
  },
  {
    dmpDoi: "",
    work: {
      doi: "10.5555/fake.2025.778899",
      type: "article",
      score: 0.8,
      title: "Quantum-Tuned Perception Systems for Next-Gen Robots",
      publicationDate: new Date(2025, 6, 28),
      containerTitle: "IEEE Transactions on Robotics",
      authors: [
        {
          firstInitial: "K",
          givenName: "Kaitlyn",
          middleInitial: null,
          middleName: null,
          surname: "Zhao",
          full: null,
          orcid: "0000-0003-8765-4321",
        },
        {
          firstInitial: "J",
          givenName: "Jonathan",
          middleInitial: "B",
          middleName: "Benjamin",
          surname: "Harris",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "T",
          givenName: "Travis",
          middleInitial: null,
          middleName: null,
          surname: "Mendoza",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "M",
          givenName: "Maya",
          middleInitial: null,
          middleName: null,
          surname: "Foster",
          full: null,
          orcid: "0000-0009-5555-4444",
        },
        {
          firstInitial: "I",
          givenName: "Isaiah",
          middleInitial: "K",
          middleName: "Kai",
          surname: "Turner",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "B",
          givenName: "Brooklyn",
          middleInitial: null,
          middleName: null,
          surname: "Singh",
          full: null,
          orcid: "0000-0002-7777-3333",
        },
        {
          firstInitial: "G",
          givenName: "Gabriel",
          middleInitial: null,
          middleName: null,
          surname: "Morrison",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "Z",
          givenName: "Zara",
          middleInitial: "L",
          middleName: "Lyn",
          surname: "Kim",
          full: null,
          orcid: "0000-0006-1234-4567",
        },
        {
          firstInitial: "R",
          givenName: "Riley",
          middleInitial: null,
          middleName: null,
          surname: "Bennett",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "C",
          givenName: "Caden",
          middleInitial: null,
          middleName: null,
          surname: "Thomas",
          full: null,
          orcid: "0000-0008-9080-1000",
        },
        {
          firstInitial: "S",
          givenName: "Skylar",
          middleInitial: null,
          middleName: null,
          surname: "Diaz",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "H",
          givenName: "Hudson",
          middleInitial: "J",
          middleName: "Jude",
          surname: "Lee",
          full: null,
          orcid: "0000-0001-5151-6262",
        },
        {
          firstInitial: "F",
          givenName: "Faith",
          middleInitial: null,
          middleName: null,
          surname: "Andrews",
          full: null,
          orcid: null,
        },
      ],
      institutions: [
        { ror: "05dxps055", name: "California Institute of Technology" },
        { ror: "00jmfr291", name: "University of Michigan" },
      ],
      funders: [
        { ror: "021nxhr62", name: "U.S. National Science Foundation" },
        { ror: "01cwqze88", name: "National Institutes of Health" },
      ],
      awardIds: ["2139987", "R01 NS987654-01"],
      source:
        { name: "DataCite", url: "https://commons.datacite.org/doi.org/10.5555/fake.2025.778899" }
    },
    dateFound: new Date(2025, 7, 21),
    status: Status.Pending,
    match: {
      doi: true,
      title: "<mark>Quantum-Tuned</mark> <mark>Perception Systems</mark> for <mark>Next-Gen Robots</mark>",
      abstract: [
        "We present a novel framework that leverages <mark>quantum-tuned</mark> signal processing to enhance <mark>robotic perception systems</mark>. By integrating low-power quantum sensors...",
        "...opening avenues for <mark>next-generation autonomous robotics</mark>.",
      ],
      awardIds: [0],
      authors: [0, 2, 4, 8, 12],
      institutions: [0, 1],
      funders: [0, 1],
    },
  },
];

export default function Pending() {
  const [whatMatched, setWhatMatched] = useState<string | null>(null);

  const sortedWorks = works;
  sortedWorks.sort((a, b) => {
    if (a.work.score > b.work.score) {
      return -1;
    } else if (a.work.score < b.work.score) {
      return 1;
    }
    return 0;
  });

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <FilterByConfidence />
        <FilterByType />
        <WhatMatched whatMatched={whatMatched} setWhatMatched={setWhatMatched} />
      </div>

      <div className={styles.list}>
        {sortedWorks
          .map((work) => (
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
}

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
            <ListBoxItem id="" style={{fontStyle: "italic"}}>{placeholder}</ListBoxItem>
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

const WhatMatched = ({whatMatched, setWhatMatched}: WhatMatchedProps) => {
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
            <ListBoxItem id="" style={{fontStyle: "italic"}}>{placeholder}</ListBoxItem>
            <ListBoxItem id="highlight">Highlight</ListBoxItem>
            <ListBoxItem id="matched-only">Matched Only</ListBoxItem>
          </ListBox>
        </Popover>
        <FieldError />
      </Select>
    </div>
  );
};
