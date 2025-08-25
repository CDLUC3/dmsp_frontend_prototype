"use client";

import { RelatedWorksList } from "@/components/RelatedWorksList";
import React from "react";
import { Status } from "@/app/types";

const DISCARDED = [
  {
    dmpDoi: "",
    work: {
      doi: "10.3847/fake.2025.245187",
      type: "article",
      score: 0.1,
      title: "Stellar Cartography and the Dynamic Mapping of Interstellar Gas Clouds",
      publicationDate: new Date(2025, 3, 20),
      containerTitle: "Astrophysical Journal Letters",
      authors: [
        {
          firstInitial: "C",
          givenName: "Clara",
          middleInitial: null,
          middleName: null,
          surname: "Montague",
          full: null,
          orcid: "0000-0003-7890-1122",
        },
        {
          firstInitial: "A",
          givenName: "Arjun",
          middleInitial: null,
          middleName: null,
          surname: "Desai",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "E",
          givenName: "Elena",
          middleInitial: null,
          middleName: null,
          surname: "Ng",
          full: null,
          orcid: "0000-0002-4545-1212",
        },
        {
          firstInitial: "M",
          givenName: "Mateo",
          middleInitial: null,
          middleName: null,
          surname: "Vargas",
          full: null,
          orcid: null,
        },
      ],
      institutions: [
        { ror: "01an7q238", name: "Carnegie Mellon University" },
        { ror: "02y2hzk54", name: "Massachusetts Institute of Technology" },
      ],
      funders: [{ ror: "021nxhr62", name: "U.S. National Science Foundation" }],
      awardIds: ["2451873"],
      source: { name: "OpenAlex", url: "https://openalex.org/works/w2060245136" },
    },
    dateFound: new Date(2025, 7, 1),
    status: Status.Discarded,
    match: {
      doi: false,
      title: null,
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
      doi: "10.1016/fake.2025.998877",
      type: "article",
      score: 0.15,
      title: "Cryovolcanic Activity on Enceladus: Implications for Subsurface Habitability",
      publicationDate: new Date(2025, 5, 12),
      containerTitle: "Planetary Science Journal",
      authors: [
        {
          firstInitial: "J",
          givenName: "Julian",
          middleInitial: null,
          middleName: null,
          surname: "Foster",
          full: null,
          orcid: "0000-0001-1122-3344",
        },
        {
          firstInitial: "R",
          givenName: "Rina",
          middleInitial: null,
          middleName: null,
          surname: "Takahashi",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "B",
          givenName: "Blake",
          middleInitial: null,
          middleName: null,
          surname: "O'Connor",
          full: null,
          orcid: "0000-0009-8888-7777",
        },
      ],
      institutions: [{ ror: "00b0x6745", name: "California Institute of Technology" }],
      funders: [
        { ror: "021nxhr62", name: "U.S. National Science Foundation" },
        { ror: "02e2c6t66", name: "National Institutes of Health" },
      ],
      awardIds: ["2501482", "R01 AI302114-01"],
      source: { name: "OpenAlex", url: "https://openalex.org/works/w2060245136" },
    },
    dateFound: new Date(2025, 7, 1),
    status: Status.Discarded,
    match: {
      doi: false,
      title: null,
      abstract: [],
      awardIds: [],
      authors: [],
      institutions: [],
      funders: [0],
    },
  },
];

export default function Discarded() {
  const sortedWorks = DISCARDED;
  sortedWorks.sort((a, b) => {
    if (a.work.score > b.work.score) {
      return -1;
    } else if (a.work.score < b.work.score) {
      return 1;
    }
    return 0;
  });

  return <RelatedWorksList works={sortedWorks} />;
}
