//import { faCloud, faEnvelope } from '@fortawesome/free-solid-svg-icons';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './subHeader.scss';

function SubHeader() {
    return (
        <div className="c-subheader">
            <a className="c-logo-org has-new-window-popup-info" href="http://cdlib.org/services/uc3" target="_blank">
                <img alt="University of California, Office of the President (UCOP) logo" width="104" height="39" src="/images/wordmark.png" />
                <span className="new-window-popup-info">Opens in a new window</span></a>

            <ul className="c-links-org">

                <li>
                    <a href="http://www.ucop.edu/" className="c-links-org__ucop" target="_blank">

                        UCOP homepage
                    </a>
                </li>

                <li>
                    <a href="mailto:dmptool@ucop.edu" className="c-links-org__uc3-helpdesk">

                        UC3 Helpdesk
                    </a>
                </li>
            </ul>
        </div>
    )
}

export default SubHeader;
