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
                className={styles.cLinksOrgUcop}
                target="_blank"
                rel="noreferrer"
                aria-label="UCOP homepage - Opens in a new window"
              >
                UCOP homepage
              </a>
            </li>

            <li>
              <a
                href="mailto:dmptool@ucop.edu"
                className={styles.cLinksOrgUc3Helpdesk}
                aria-label="Contact UC3 Helpdesk via email"
              >
                UC3 Helpdesk
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default SubHeader;
