import { SanitizeHTML } from '@/utils';

function Abstract(props: any) {
  let abstract = props?.project_abstract || props.description

  return (
    <div className="t-step__content">
      <h2>Project description</h2>

      <ul className="landing-list abstract">
        <li>
          <span><SanitizeHTML html={abstract} options={null} /></span>
        </li>
      </ul>
    </div>
  );
}

export default Abstract;
