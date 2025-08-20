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


export default function Related() {
    return <p>Related works.</p>;
}