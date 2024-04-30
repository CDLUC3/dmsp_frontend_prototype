import { gql } from '@apollo/client';
import { getClient } from '@/lib/client';

const GET_DATA = gql`
query getDMSP($pk: String!) {
    getDMSP(PK: $pk) {
        contact {
            name
          }
          contributor {
            name
            role
            contributor_id {
              type
              identifier
            }
            dmproadmap_affiliation {
              name
              affiliation_id {
                type
                identifier
              }
            }
          }
          created
          description
          dataset {
            title
            type
            description
            keyword
            issued
            distribution {
              license {
                license_ref
              }
              host {
                url
                title
              }
            }
            metadata {
              metadata_standard_id {
                identifier
              }
              description
            }
          }
          dmp_id {
            identifier
          }
          dmphub_versions {
            timestamp
            url
          }
          dmproadmap_privacy
          dmproadmap_related_identifiers {
            descriptor
            identifier
            type
            work_type
          }
          ethical_issues_exist
          modified
          project {
            description
            end
            funding {
              name
              dmproadmap_opportunity_number
              grant_id {
                identifier
              }
              funder_id {
                identifier
              }
              
            }
            start
            title
          }
          title
    }
    
}`;


export async function getData() {
    try {
        const { data } = await getClient().query({
            query: GET_DATA,
            variables: { pk: "DMP#doi.org/10.48321/D136BA4701" },
            context: {
                fetchOptions: {
                    next: { revalidate: 5 },
                }
            }
        })

        const dmp = data.getDMSP;

        const formData = {

            title: dmp.title || "",
            description: dmp.description || "",
            dmp_id: dmp.dmp_id?.identifier || "",
            privacy: dmp.dmproadmap_privacy || "private",
            created: dmp.created || "",
            modified: dmp.modified || "",
            ethical_issues_exist: dmp.ethical_issues_exits || "unknown",
            ethical_issues_report: dmp.ethical_issues_reports || "",

            funder_name: dmp.project[0]?.funding[0]?.name || "",
            funder_id: dmp.project[0]?.funding[0]?.funder_id?.identifier || "",
            award_id: dmp.project[0]?.funding[0]?.grant_id?.identifier || "",
            opportunity_number: dmp.project[0]?.funding[0]?.dmproadmap_funding_opportunity_id?.identifiergetValue || "",

            project_title: dmp.project[0]?.title || "",
            project_abstract: dmp.project[0]?.description || "",
            project_start: dmp.project[0]?.start || "",
            project_end: dmp.project[0]?.end || "",
            contact: dmp.contact || {},
            contributors: dmp.contributor || [],
            datasets: dmp.dataset || [],
            related_identifiers: dmp.dmproadmap_related_identifiers || [],
            versions: dmp.dmphub_versions || [],
        };
        return formData;
    } catch (error: any) {
        console.log(`Something went wrong: ${error.message}`)
    }
}