import {redirect} from 'next/navigation';
import Image from 'next/image';
import narrativeLogo from '@/public/images/u153.svg';
import { DmpApi } from "../../../api";

import { DmptoolLink, Link } from '@/components/link/link';

import Abstract from "@/components/abstract";
import Citation from "@/components/citation";
import Contributors from "@/components/contributors";
import Footer from "@/components/footer";
import Funding from "@/components/funding";
import Outputs from "@/components/outputs";
import Project from "@/components//project";
import Versions from "@/components/versions";
import Works from "@/components//works";
import '../[...slug]/dmps.scss';



interface RelatedIdentifier {
    descriptor: string;
    work_type: string;
    identifier: string
}

interface ContactInterface {
    name: string
}
interface FormData {
    json_url: string,
    title: string,
    description: string,
    dmp_id: string,
    privacy: string,
    created: string,
    modified: string,
    ethical_issues_exist: string,
    ethical_issues_report: string,

    funder_name: string,
    funder_id: string,
    award_id: string,
    opportunity_number: string,

    project_title: string,
    project_abstract: string,
    project_start: string,
    project_end: string,

    contact: ContactInterface | {},
    contributors: String[],
    datasets: String[],
    related_identifiers: RelatedIdentifier[],
    versions: String[],
}


function getUrl() {
    return "https://api.dmphub.uc3dev.cdlib.net/dmps/10.48321/D1SP4H";
}

async function getData() {
    'use server'
        // Fetch the DMP ID metadata from the DMPHub
        let api = new DmpApi();

        const url = getUrl();
        const options = api.getOptions({});
    try{
        const response = await fetch(url,options);
        api.handleResponse(response);
        const data = await response.json();
        
        if (Array.isArray(data?.items) && data?.items[0] !== null) {
          let dmp = data.items[0].dmp;
          const formData = {
            json_url: url,
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
        } else {
          redirect('/not_found')
        }
      } catch(error:any) {
        return null
      }
}

const Landing = async() => {

    const defaultData = {
        title: "Loading ...",
        description: "",
        dmp_id: "",
        privacy: "private",
        modified: "",
    
        funder_name: "",
        funder_id: "",
        award_id: "",
        opportunity_number: "",
    
        project_title: "",
        project_abstract: "",
        project_start: "",
        project_end: "",
    
        contact: {},
        contributors: [],
        datasets: [],
        related_identifiers: [],
        versions: [],
      }
    const formData = await getData() || defaultData;

  function dmpIdWithoutAddress() {
    return formData.dmp_id?.replace('https://doi.org/', '');
  }

  function FunderLink() {
    let nameUrlRegex = /\s+\(.*\)\s?/i;
    if (formData.funder_id !== '') {
      return (<Link href={formData.funder_id} label={formData.funder_name.replace(nameUrlRegex, '')} remote='true'/> );
    } else {
      return formData.funder_name;
    }
  }
  function isPublic() {
    return formData.privacy === 'public';
  }

  function narrativeUrl() {

    if (Array.isArray(formData.related_identifiers )) {
      let id = formData.related_identifiers.find(id => id.descriptor === 'is_metadata_for' && id.work_type === 'output_management_plan');
      return id?.identifier
    } else {
      return '';
    }
  }
  function filterWorks(works:any) {
    if (works !== undefined) {
      return works.filter((work:any) => work?.work_type !== 'output_management_plan' );
    } else {
      return [];
    }
  }

  return (
    <div id="Dashboard">
      <header className="t_step__landing-header">
        <div className="dmptool-logo">
          <DmptoolLink withLogo='true'/>
        </div>
        <div className="dmp-menu">
          <ul>
            <li><strong>DMP ID:</strong> {dmpIdWithoutAddress()}</li>
            <Versions versions={formData.versions} currentVersion={formData.modified} />
          </ul>
        </div>
      </header>

      <div className="t-step__landing-title">
        <div className={isPublic() ? 'dmp-title' : 'dmp-title-wide'}>
          <p>This page describes a data management plan written for the <FunderLink/> using the <DmptoolLink/>.
             You can access this infomation as <Link href={formData.json_url} label='json' remote='true'/> here.</p>
          <h1>{formData.title === '' ? formData.project_title : formData.title}</h1>
        </div>
        {isPublic() && narrativeUrl() && (
          <div className="dmp-pdf">
            <Link href={narrativeUrl()} remote='true' label={<Image src={narrativeLogo} alt='PDF icon' aria-hidden='true'/>}/>
            <Link href={narrativeUrl()} remote='true' label='Read the data management plan'/>
          </div>
        )}
      </div>

      {(formData.contact !== undefined || (formData.contributors !== undefined && formData.contributors.length > 0)) &&
        <Contributors persons={formData.contributors}
                      primary={formData.contact}/>
      }

      {formData.created !== undefined &&
        <Project datasets={formData.datasets}
                created={formData.created}
                modified={formData.modified}
                project_start={formData.project_start}
                project_end={formData.project_end}
                ethical_issues_exist={formData.ethical_issues_exist}/>
      }

      {formData.created !== undefined &&
        <Citation dmp_id={formData.dmp_id}
                  title={formData.title}
                  created={formData.created}
                  persons={formData.contributors}
                  primary={formData.contact}
                  dmptoolName='DMPTool'/>
      }

      {formData.funder_name !== '' &&
        <Funding funder_link={FunderLink}
                  award_id={formData.award_id}
                  opportunity_number={formData.opportunity_number} />
      }

      {((formData.project_abstract && formData.project_abstract !== '') || (formData.description && formData.description !== '')) &&
        <Abstract project_abstract={formData.project_abstract}
                  description={formData.description}/>
      }

      {(formData.datasets && formData.datasets.length > 0) &&
        <Outputs outputs={formData.datasets}/>
      }

      {(formData.related_identifiers && formData.related_identifiers.length > 0) &&
        <Works works={filterWorks(formData.related_identifiers)}/>
      }

      <Footer/>
    </div>
  );
}

export default Landing;
