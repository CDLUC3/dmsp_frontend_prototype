//import {DMPTOOL_NAME, DMPTOOL_URL} from '@/tmp';
import Image from 'next/image';
import dmptoolLogo from '@/public/images/dmptool_logo_u166.svg';

const DMPTOOL_NAME = 'DMPTool';
const DMPTOOL_URL = 'https://dmptool-dev.cdlib.org';

export function DmptoolLink(props: any) {
  if (props.withLogo === 'true') {
    const logo = <Image src={dmptoolLogo} alt={`${DMPTOOL_NAME} logo`} />;

    return (
      <Link href={DMPTOOL_URL} remote='true' label={logo} />
    );
  } else {
    return (
      <Link href={DMPTOOL_URL} label={DMPTOOL_NAME} remote='true' />
    );
  }
}

export function Link(props) {
  const index = props?.index || '';
  const label = props?.label || '';
  const href = props?.href || '';
  let key = `${index}-${label}-${href}`;
  if (props?.remote === 'true') {
    return (
      <a href={props.href ? props.href : '#'} target="_blank" rel="noreferrer" key={key} className={props?.className}>
        {props.label ? props.label : props.href}
      </a>
    );
  } else {
    return (
      <a href={props.href ? props.href : '#'} key={key} className={props?.className}>
        {props.label ? props.label : props.href}
      </a>
    );
  }
}
