import styles from './subHeader.module.scss';

function SubHeader() {
    return (
        <div className={styles['c-subheader']}>
            <a className={`${styles['c-logo-org']} ${styles['has-new-window-popup-info']}`} href="http://cdlib.org/services/uc3" target="_blank">
                <img alt="University of California, Office of the President (UCOP) logo" width="104" height="39" src="https://dmptool.org/media/W1siZiIsIjIwMjQvMDkvMDkvMDkvMDkvNTEvOWJkOTNhZTMtNzRiOC00ODU5LThhNTEtOTk5YTI5M2U3Y2YwL1VDLWxvZ28tY2Fyb3VzZWwuanBnIl1d/UC-logo-carousel.jpg?sha=dc2b558efad1abac" />
                <span className={styles['new-window-popup-info']}>Opens in a new window</span></a>

            <ul className={styles['c-links-org']}>

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
