"use client";

import RelatedWorksListItem from "@/components/RelatedWorksListItem";
import styles from './RelatedWorksList.module.scss';

// interface RelatedWork {
//   doi: string;
//   publicationDate: string;
//   // TODO: need a venue / journal etc
//   type: string;
//   title: string;
//   authors: Author[];
//   institutions: Institution[];
//   funders: Funder[];
//   awards: Award[];
//   sources: Source[];
//   score: number;
//
//   // : {
//   //   name: string; // openalex, datacite, crossref
//   //   work_id: string; // openalex / datacite id
//   //   url: string; //
//   // },
//   match: {
//     doi: {
//       score: number;
//     },
//     authors: {
//       score: number;
//       entities: {
//         score: number;
//         orcid: Match;
//         surname: Match;
//       }
//     },
//     institutions: {
//       score: number;
//     },
//     funders: {
//       score: number;
//     },
//     awards: {
//       score: number;
//     },
//     content: {
//       score: number;
//     }
//   }

export default function Pending() {
  const works = [
    {
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
      affiliations: [
        { id: "042nb2s44", name: "Massachusetts Institute of Technology" },
        { id: "05x2bcf33", name: "Carnegie Mellon University" },
      ],
      funders: [
        { id: "021nxhr62", name: "U.S. National Science Foundation" },
        { id: "01cwqze88", name: "National Institutes of Health" },
      ],
      awardIds: ["2357894", "R01 HL201245-02"],
      dateFound: new Date(2025, 7, 21),
      defaultExpanded: false,
    },
    {
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
      affiliations: [
        { id: "00f54p054", name: "Stanford University" },
        { id: "01an7q238", name: "University of California, Berkeley" },
      ],
      funders: [{ id: "021nxhr62", name: "U.S. National Science Foundation" }],
      awardIds: ["2145023"],
      dateFound: new Date(2025, 7, 21),
      defaultExpanded: false,
    },
    {
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
      ],
      affiliations: [
        { id: "05dxps055", name: "California Institute of Technology" },
        { id: "00jmfr291", name: "University of Michigan" },
      ],
      funders: [
        { id: "021nxhr62", name: "U.S. National Science Foundation" },
        { id: "01cwqze88", name: "National Institutes of Health" },
      ],
      awardIds: ["2139987", "R01 NS987654-01"],
      dateFound: new Date(2025, 7, 21),
      defaultExpanded: false,
    },
  ];

  return (
    <div className={styles.listContainer}>
      {works.sort(work => work.score).reverse().map((work) => (
        <RelatedWorksListItem
          key={work.doi}
          item={work}
        />
      ))}
    </div>
  );
}
