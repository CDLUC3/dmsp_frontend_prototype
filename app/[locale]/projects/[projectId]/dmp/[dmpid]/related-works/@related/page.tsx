"use client";

import { RelatedWorksList } from "@/components/RelatedWorksList";
import React from "react";
import { Status } from "@/app/types";

const RELATED = [
  {
    dmpDoi: "",
    work: {
      doi: "10.5555/fake.2025.661100",
      type: "article",
      score: 0.89,
      title: "Real-Time Sim2Real Transfer for Bipedal Robot Gait Adaptation",
      publicationDate: new Date(2025, 7, 5),
      containerTitle: "Frontiers in Robotics and AI",
      authors: [
        {
          firstInitial: "J",
          givenName: "Jordan",
          middleInitial: null,
          middleName: null,
          surname: "Ali",
          full: null,
          orcid: "0000-0006-7890-1234",
        },
        {
          firstInitial: "S",
          givenName: "Samantha",
          middleInitial: null,
          middleName: null,
          surname: "Rogers",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "C",
          givenName: "Carlos",
          middleInitial: "D",
          middleName: "Diego",
          surname: "Ramirez",
          full: null,
          orcid: "0000-0005-5555-6789",
        },
        {
          firstInitial: "L",
          givenName: "Leila",
          middleInitial: null,
          middleName: null,
          surname: "Chen",
          full: null,
          orcid: null,
        },
      ],
      institutions: [{ ror: "05dxps055", name: "California Institute of Technology" }],
      funders: [
        { ror: "021nxhr62", name: "U.S. National Science Foundation" },
        { ror: "01cwqze88", name: "National Institutes of Health" },
      ],
      awardIds: ["2288994", "R01 EB765432-03"],
      source: {
        name: "DataCite",
        url: "https://commons.datacite.org/doi.org/10.5555/fake.2025.661100",
      },
    },
    dateFound: new Date(2025, 7, 21),
    status: Status.Related,
    match: {
      doi: true,
      title: "Real-Time <mark>Sim2Real</mark> Transfer for <mark>Bipedal Robot</mark> <mark>Gait Adaptation</mark>",
      abstract: [
        "We propose a <mark>Sim2Real</mark> transfer technique for enabling dynamic <mark>bipedal robot</mark> locomotion across varying terrain conditions without retraining.",
        "Our results demonstrate improved <mark>gait adaptation</mark> using real-time sensory corrections during transitions between simulated and physical environments.",
      ],
      awardIds: [0],
      authors: [0, 2],
      institutions: [0],
      funders: [0, 1],
    },
  },
  {
    dmpDoi: "",
    work: {
      doi: "10.5555/fake.2025.443322",
      type: "article",
      score: 0.92,
      title: "Multisensory Feedback Loops for Dexterous Robotic Manipulation",
      publicationDate: new Date(2025, 2, 18),
      containerTitle: "IEEE Robotics and Automation Letters",
      authors: [
        {
          firstInitial: "A",
          givenName: "Amira",
          middleInitial: null,
          middleName: null,
          surname: "Nguyen",
          full: null,
          orcid: "0000-0003-2244-5566",
        },
        {
          firstInitial: "T",
          givenName: "Trevor",
          middleInitial: null,
          middleName: null,
          surname: "Shaw",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "D",
          givenName: "Daniel",
          middleInitial: "S",
          middleName: "Scott",
          surname: "Lewis",
          full: null,
          orcid: "0000-0002-1111-3333",
        },
      ],
      institutions: [{ ror: "01an7q238", name: "Carnegie Mellon University" }],
      funders: [{ ror: "021nxhr62", name: "U.S. National Science Foundation" }],
      awardIds: ["2356781"],
      source: {
        name: "DataCite",
        url: "https://commons.datacite.org/doi.org/10.5555/fake.2025.443322",
      },
    },
    dateFound: new Date(2025, 7, 21),
    status: Status.Related,
    match: {
      doi: true,
      title: "<mark>Multisensory</mark> Feedback Loops for <mark>Dexterous</mark> <mark>Robotic Manipulation</mark>",
      abstract: [
        "We present a control architecture that fuses <mark>multisensory</mark> data from tactile, visual, and proprioceptive inputs to enable <mark>dexterous</mark> <mark>robotic manipulation</mark> in unstructured environments.",
        "The loop-based system enhances object interaction stability and allows fine-tuned grasping strategies.",
      ],
      awardIds: [0],
      authors: [0, 2],
      institutions: [0],
      funders: [0],
    },
  },
];

export default function Related() {
  const sortedWorks = RELATED;
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
