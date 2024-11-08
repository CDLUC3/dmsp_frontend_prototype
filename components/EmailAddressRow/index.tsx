'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import { DmpIcon } from '@/components/Icons';
import {
  Button,
  Tooltip,
  TooltipTrigger
} from 'react-aria-components';
import styles from './emailAddressRow.module.scss';

interface DeleteRowInterface {
  email: string;
  isAlias: boolean;
  additionalClassName?: string;
  tooltip?: boolean;
  toolTipMessage?: string;
  onDeleteSuccess?: Function;
  makePrimaryEmail?: Function;
  deleteEmail?: Function;
}
export default function EmailAddressRow({
  email,
  isAlias,
  additionalClassName,
  tooltip,
  toolTipMessage,
  makePrimaryEmail,
  deleteEmail
}: DeleteRowInterface) {

  const handleMakePrimary = (e: React.MouseEvent<HTMLDivElement>, email: string) => {
    e.preventDefault();
    if (makePrimaryEmail) {
      makePrimaryEmail(email);
    }
  }
  return (

    <div className={classNames(
      styles.emailRow,
      additionalClassName && styles[additionalClassName]
    )}>
      <div className={styles.emailContent}>
        <p className={styles.emailAddress}>{email}</p>
        {isAlias && (
          <div role="button" onClick={e => handleMakePrimary(e, email)} className={styles.emailLink}>Make primary email address</div>
        )}
      </div>

      {tooltip ? (
        <TooltipTrigger delay={0}>
          <Button className={`${styles.tooltipButton} react-aria-Button`}>
            <span className="hidden-accessibly">{toolTipMessage}</span>
            <DmpIcon icon="trashcan" classes={styles.trashcanIcon + ' ' + (additionalClassName ? styles[additionalClassName] : '')} />
          </Button>
          <Tooltip placement="bottom right">{toolTipMessage}</Tooltip>
        </TooltipTrigger>
      ) : (
        <div onClick={() => deleteEmail && deleteEmail(email)}>
          <DmpIcon icon="trashcan" classes={styles.trashcanIcon + ' ' + (additionalClassName ? styles[additionalClassName] : '')} />
        </div>
      )}

    </ div >
  );
}