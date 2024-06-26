import { Link } from '@/components/link/link';

const INVESTIGATOR_ROLE_REGEX = /https?:\/\/credit\.niso\.org\/contributor-roles\/investigation/i;

function currentYear() {
  new Date().getFullYear();
}

function investigatorNames(persons:any) {
  let names = persons.filter((item:any) => item?.role?.some((e:any) => INVESTIGATOR_ROLE_REGEX.test(e))).map((item:any) => item.name);
  return names.join(', ')
}

function Citation(props:any) {
  let dmp_id = props?.dmp_id || {};
  let title = props?.title;
  let created = props?.created;
  let persons = props?.persons || [];
  let primary = props?.primary;
  let dmptoolName = props?.dmptoolName || 'DMPTool';

  let year = created === undefined ? currentYear() : new Date(Date.parse(created))?.toDateString()?.split(' ')[3];

  if (dmp_id !== undefined && title !== undefined && year !== undefined && (primary !== undefined || (Array.isArray(persons) && persons.length > 0))) {
    let investigators = investigatorNames(persons);

    return (
      <div className="t-step__content">
        <h2>Citation</h2>

        {investigators.length > 0 &&
          <ul className="landing-list citation">
            <li><strong>When citing this DMP use:</strong></li>
            <li className="margin10 period-separated">
              <span>{investigators}</span>
              <span>({year})</span>
              <span>{`"${title}"`}</span>
              <span>[Data Management Plan]</span>
              <span>{dmptoolName}</span>
              <Link href={dmp_id}/>
            </li>
          </ul>
        }
        <ul className="landing-list">
          <li>
            <strong>When connecting to this DMP to related project outputs (such as datasets) use the ID:</strong><br/>
            <Link href={dmp_id}/>
          </li>
        </ul>
      </div>
    );
  }
}

export default Citation;
