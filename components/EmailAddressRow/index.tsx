'use client';

import Link from "next/link";
import { DmpIcon } from "@/components/Icons";
import styles from './emailAddressRow.module.scss';

interface DeleteRowInterface {
  email: string;
  isAlias: boolean;
}
export default function EmailAddressRow({ email, isAlias }: DeleteRowInterface) {
  return (
    <div className={styles.emailRow}>
      <div className={styles.emailContent}>
        <p className={styles.emailAddress}>{email}</p>
        {isAlias ? (
          <Link href="#" className={styles.emailLink}>Make primary email address</Link>
        ) : (
          <></>
        )}
      </div>

      <DmpIcon icon="trashcan" />
    </div>
  );
}