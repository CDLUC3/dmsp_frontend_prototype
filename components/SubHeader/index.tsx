import Image from "next/image";
import styles from "./subHeader.module.scss";

function SubHeader() {
  return (
    <div className={styles.cSubheader}>
      <div className={styles.cSubheaderInner}>
        <a
          className={`${styles.cLogoOrg} ${styles.hasNewWindowPopupInfo}`}
          href="http://cdlib.org/services/uc3"
          target="_blank"
          rel="noreferrer"
          aria-label="University of California, Office of the President - Opens in a new window"
        >
          <Image
            alt="University of California, Office of the President (UCOP) logo"
            width="104"
            height="39"
            src="/images/logo-cdl.png"
            priority /*to preload large image */
          />
          <span className={styles.newWindowPopupInfo}>Opens in a new window</span>
        </a>

        <nav aria-label="Organization links">
          <ul className={styles.cLinksOrg}>
            <li>
              <a
                href="http://www.ucop.edu/"
                className={styles.cLinksOrgHomepage}
                target="_blank"
                rel="noreferrer"
                aria-label="UCOP homepage - Opens in a new window"
              >
                UCOP Homepage
              </a>
            </li>

            <li>
              <a
                href="http://www.ucop.edu/services/"
                className={styles.cLinksOrgIntranet}
                target="_blank"
                rel="noreferrer"
                aria-label="UCOP services - Opens in a new window"
              >
                Services
              </a>
            </li>

            <li>
              <a
                href="http://www.ucop.edu/uc-library/"
                className={styles.cLinksOrgLibrary}
                target="_blank"
                rel="noreferrer"
                aria-label="UCOP library - Opens in a new window"
              >
                UC Library
              </a>
            </li>

            <li>
              <a
                href="mailto:dmptool@ucop.edu"
                className={styles.cLinksOrgHelpdesk}
                aria-label="Contact UC3 Helpdesk via email"
              >
                Helpdesk
              </a>
            </li>

            <li>
              <a
                href="http://www.ucop.edu/academic-affairs/"
                className={styles.cLinksOrgPolicies}
                target="_blank"
                rel="noreferrer"
                aria-label="UCOP Academic Affairs - Opens in a new window"
              >
                Academic Affairs
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default SubHeader;
