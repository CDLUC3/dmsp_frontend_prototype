'use client'

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel,
} from '@/components/Container';
import { FormInput } from '@/components/Form';
import {
  Button,
  DropZone,
  FileTrigger,
  Link
} from "react-aria-components";

import { useTranslations } from 'next-intl';
import styles from './organizationDetails.module.scss';

interface OrganizationUrl {
  id: string;
  url: string;
  label: string;
}

const OrganizationDetailsPage: React.FC = () => {
  const t = useTranslations('OrganizationDetails');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  const [fileName, setFileName] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  const [showUpload, setShowUpload] = useState(false);
  const [organizationUrls, setOrganizationUrls] = useState<OrganizationUrl[]>([
    { id: '1', url: '', label: '' }
  ]);

  const handleAddUrl = () => {
    if (organizationUrls.length < 5) {
      const newId = (organizationUrls.length + 1).toString();
      setOrganizationUrls([...organizationUrls, { id: newId, url: '', label: '' }]);
    }
  };

  const handleRemoveUrl = (id: string) => {
    if (organizationUrls.length > 1) {
      setOrganizationUrls(organizationUrls.filter(url => url.id !== id));
    }
  };

  const handleUrlChange = (id: string, field: 'url' | 'label', value: string) => {
    setOrganizationUrls(organizationUrls.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDrop = (e: any) => {
    // Stubbed out - just set the filename
    // TODO: Properly type this when implementing actual file handling
    if (e.files && e.files.length > 0) {
      setFileName(e.files[0].name);
    }
  };

  const handleFileSelect = (file: File) => {
    // Stubbed out - just set the filename
    setFileName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit');
  };

  return (
    <>
      <PageHeader
        title={t('title')}
        showBackButton={true}
        className="page-organization-details-header"
      />

      <LayoutWithPanel className={"page-organization-details"}>
        <ContentContainer>
          <form onSubmit={handleSubmit}>
            {/* Edit organization details section */}
            <div className={styles.sectionHeader}>
              <h2>{t('sections.organizationDetails.title')}</h2>
            </div>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <FormInput
                  name="organizationName"
                  label={t('fields.organizationName.label')}
                  placeholder={t('fields.organizationName.placeholder')}
                  isRequired={true}
                />
                <FormInput
                  name="organizationAbbr"
                  label={t('fields.organizationAbbr.label')}
                  placeholder={t('fields.organizationAbbr.placeholder')}
                  isRequired={true}
                />
                <div className={styles.organizationTypeRow}>
                  <div className={styles.label} id="organization-type-label">{t('fields.organizationType.label')}</div>
                  <div className={styles.content}>
                    <span className={"mr-3"} aria-labelledby="organization-type-label">Institution</span>
                    <Link href="/contact" className={`react-aria-Link ${styles.requestChangeLink}`}>
                      {t('actions.requestChange')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrator contact section */}
            <div className={styles.sectionHeader}>
              <h2>{t('sections.administratorContact.title')}</h2>
            </div>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                  <FormInput
                  name="contactEmail"
                  label={t('fields.contactEmail.label')}
                  type="email"
                  placeholder={t('fields.contactEmail.placeholder')}
                  isRequired={true}
                />

                <FormInput
                  name="linkText"
                  label={t('fields.linkText.label')}
                  placeholder={t('fields.linkText.placeholder')}
                  isRequired={true}
                />
              
              </div>
            </div>

            {/* Branding section */}
            <div className={styles.sectionHeader}>
              <h2>{t('sections.branding.title')}</h2>
            </div>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <div className={styles.logoSection}>
                  <div className={styles.logoRow}>
                    <div className={styles.logoUpload}>
                      <div className={styles.uploadArea}>
                        <DropZone
                          onDrop={handleDrop}
                          aria-label={t('upload.dropZone.ariaLabel')}
                          className={styles.dropZone}
                        >
                          <div className={styles.dropZoneContent}>
                            <div className={styles.uploadIcon}>
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16L12 8M12 8L15 11M12 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 15V16C3 18.8284 3 20.2426 3.87868 21.1213C4.75736 22 6.17157 22 9 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className={styles.uploadText}>
                              <h3>{t('upload.title')}</h3>
                              <p>{t('upload.description')}</p>
                              <p className={styles.fileTypes}>{t('upload.fileTypes')}</p>
                            </div>
                            <FileTrigger
                              allowsMultiple={false}
                              onSelect={(files) => {
                                if (files && files[0]) {
                                  const selectedFile = files[0];
                                  handleFileSelect(selectedFile);
                                }
                              }}
                            >
                              <Button className={styles.browseButton}>{t('upload.browseButton')}</Button>
                            </FileTrigger>
                          </div>
                        </DropZone>
                      </div>
                    </div>
                    
                
                  </div>
                </div>
              </div>
            </div>

            {/* Organization URLs section */}
            <div className={styles.sectionHeader}>
              <h2>{t('sections.organizationUrls.title')}</h2>
            </div>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <p className={styles.urlDescription}>
                  {t('sections.organizationUrls.description')}
                </p>
                
                {organizationUrls.map((urlItem, _index) => (
                  <div key={urlItem.id} className={styles.urlItem}>
                    <div className={styles.urlHeader}>
                      {organizationUrls.length > 1 && (
                        <button
                          onClick={() => handleRemoveUrl(urlItem.id)}
                          className={styles.removeUrlLink}
                          type="button"
                          aria-label={`${t('actions.removeUrl')} ${urlItem.label || t('fields.url.label')} ${urlItem.id}`}
                        >
                          {t('actions.removeUrl')}
                        </button>
                      )}
                    </div>
                    <div className={styles.urlFields}>
                      <FormInput
                        name={`url_${urlItem.id}`}
                        label={t('fields.url.label')}
                        placeholder={t('fields.url.placeholder')}
                        value={urlItem.url}
                        onChange={(e) => handleUrlChange(urlItem.id, 'url', e.target.value)}
                      />
                      <FormInput
                        name={`label_${urlItem.id}`}
                        label={t('fields.urlLinkText.label')}
                        placeholder={t('fields.urlLinkText.placeholder')}
                        value={urlItem.label}
                        onChange={(e) => handleUrlChange(urlItem.id, 'label', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                {organizationUrls.length < 5 && (
                  <Button
                    onPress={handleAddUrl}
                    className="react-aria-Button react-aria-Button--secondary"
                  >
                    {t('actions.addAnotherUrl')}
                  </Button>
                )}
              </div>
            </div>

            {/* Identifiers section */}
            <div className={styles.sectionHeader}>
              <h2>{t('sections.identifiers.title')}</h2>
            </div>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <div className={styles.identifierField}>
                  <div className={styles.content}>
                    <FormInput
                      name="fundRef"
                      label={t('fields.fundRef.label')}
                      value="100014576"
                      disabled={true}
                      inputClasses={styles.readOnlyInput}
                    />
                    <Button 
                      className="react-aria-Button react-aria-Button--secondary"
                      aria-label={`${t('actions.requestChange')} ${t('fields.fundRef.label')}`}
                    >
                      {t('actions.requestChange')}
                    </Button>
                  </div>
                </div>

                <div className={styles.identifierField}>
                  <div className={styles.content}>
                    <FormInput
                      name="ror"
                      label={t('fields.ror.label')}
                      value="00dmfq477"
                      disabled={true}
                      inputClasses={styles.readOnlyInput}
                    />
                    <Button 
                      className="react-aria-Button react-aria-Button--secondary"
                      aria-label={`${t('actions.requestChange')} ${t('fields.ror.label')}`}
                    >
                      {t('actions.requestChange')}
                    </Button>
                  </div>
                </div>

                <div className={styles.identifierField}>
                  <div className={styles.content}>
                    <FormInput
                      name="shibboleth"
                      label={t('fields.shibboleth.label')}
                      value="urn:mace:incommon:ucop.edu"
                      disabled={true}
                      inputClasses={styles.readOnlyInput}
                    />
                    <Button 
                      className="react-aria-Button react-aria-Button--secondary"
                      aria-label={`${t('actions.requestChange')} ${t('fields.shibboleth.label')}`}
                    >
                      {t('actions.requestChange')}
                    </Button>
                  </div>
                </div>

                <div className={styles.identifierField}>
                  <div className={styles.content}>
                    <FormInput
                      name="domains"
                      label={t('fields.domains.label')}
                      value="universityofcalifornia.edu, ucop.edu, ucp.edu"
                      disabled={true}
                      inputClasses={styles.readOnlyInput}
                    />
                    <Button 
                      className="react-aria-Button react-aria-Button--secondary"
                      aria-label={`${t('actions.requestChange')} ${t('fields.domains.label')}`}
                    >
                      {t('actions.requestChange')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className={styles.saveButton}>
              <Button type="submit">{t('buttons.save')}</Button>
            </div>

          
          </form>
        </ContentContainer>

        <SidebarPanel>
          <div>
            {/* TODO: Add sidebar content */}
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  )
}

export default OrganizationDetailsPage;
