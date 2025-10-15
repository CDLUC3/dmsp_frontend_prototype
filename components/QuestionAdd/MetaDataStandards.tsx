'use client';

import { useState } from 'react';
import { useTranslations } from "next-intl";

import {
  Button,
  Checkbox,
  Dialog,
  Heading,
  Input,
  Label,
  Modal,
  SearchField,
} from "react-aria-components";
import {
  FormInput,
} from '@/components/Form';

import Pagination from '@/components/Pagination';
import { useToast } from '@/context/ToastContext';
import styles from './Selector.module.scss';

const paginationProps = {
  currentPage: 1,
  totalPages: 10,
  hasPreviousPage: false,
  hasNextPage: true,
  handlePageClick: () => { },
};



const MetaDataStandardsSelector = ({
  field,
  handleToggleMetaDataStandards,
  updateStandardFieldProperty
}) => {
  const toastState = useToast();
  const [selectedStandards, setSelectedStandards] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [subjectArea, setSubjectArea] = useState('');
  const [repoType, setRepoType] = useState('');
  const [customForm, setCustomForm] = useState({ name: '', url: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Translation keys
  const Global = useTranslations("Global");

  // Original sample data - keep this as the source of truth
  const originalMetaDataStandards = [
    {
      id: 1,
      name: "ABCD (Access to Biological Collection Data)",
      description: "<p>The Access to Biological Collections Data (ABCD) Schema is an evolving comprehensive standard for the access to and exchange of data about specimens and observations (a.k.a. primary biodiversity data). The ABCD Schema attempts to be comprehensive and highly structured, supporting data from a wide variety of databases. It is compatible with several existing data standards. Parallel structures exist so that either (or both) atomised data and free-text can be accommodated</p><p>The ABCD Schema was ratified as a standard by the Biodiversity Information Standards Taxonomic Databases Working Group(TDWG) in 2005. It was developed as a community- driven effort, with contributions from CODATA, BioCASE and GBIF among other organizations.</p>",
      url: "https://dataverse.harvard.edu/dataverse/rtdc",
    },
    {
      id: 2,
      name: "ABCD Zoology",
      description: "<p>ABCD Zoology is an application profile of ABCD tailored for use in zoological contexts. It was the first official application profile to use the RDF-based version 3.0 of ABCD.</p>",
      url: "https://abcd.tdwg.org/xml/",
    },
    {
      id: 3,
      name: "AGLS Metadata Profile",
      description: "<p>An application of Dublin Core designed to improve visibility and availability of online resources, originally adapted from the Australian Government Locator Service metadata standard for use in government agencies.</p>",
      url: "http://www.agls.gov.au",
    },
    {
      id: 4,
      name: "Apple Core",
      description: "<p>Darwin Core documentation and recommendations for herbaria.</p>",
      url: "http://code.google.com/p/applecore/wiki/Introduction",
    },
    {
      id: 5,
      name: "CESSDA Data Catalogue DDI Profiles",
      description: "<p>The profiles specify the metadata requirements of the CESSDA Data Catalogue, based on the CESSDA Metadata Model and the DDI specifications.</p>",
      url: "https://cmv.cessda.eu/documentation/profiles.html",
    }
  ];

  // Filtered repositories state
  const [metaStandards, setMetaStandards] = useState(originalMetaDataStandards);

  const handleSearchInput = (term: string) => {
    setSearchTerm(term);
    setMetaStandards(originalMetaDataStandards);
  };

  const handleSearch = () => {
    //TODO: Implement actual search/filter logic here

    const filtered = originalMetaDataStandards.filter(standard =>
      standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      standard.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setMetaStandards(filtered);
  }

  const toggleSelection = (std) => {
    setSelectedStandards(prev => {
      const newSelected = { ...prev };
      if (newSelected[std.id]) {
        delete newSelected[std.id];
        toastState.add(`${std.name} removed`, { type: 'error' });
      } else {
        newSelected[std.id] = std;
        toastState.add(`${std.name} added`, { type: 'success' });
      }
      return newSelected;
    });
  };

  const removeStandard = (stdId) => {
    const std = selectedStandards[stdId];
    setSelectedStandards(prev => {
      const newSelected = { ...prev };
      delete newSelected[stdId];
      return newSelected;
    });
    toastState.add(`${std.name} removed`, { type: 'error' });
  };

  const removeAllStandards = () => {
    if (window.confirm('Are you sure you want to remove all selected metadatastandards?')) {
      setSelectedStandards({});
      toastState.add('All metadata standards removed', { type: 'success' });
    }
  };

  const addCustomMetadataStandard = () => {
    const { name, url, description } = customForm;

    if (!name.trim() || !url.trim() || !description.trim()) {
      toastState.add('Please fill in all fields', { type: 'error' });
      return;
    }

    const customStandard = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
    };

    setSelectedStandards(prev => ({ ...prev, [customStandard.id]: customStandard }));
    setCustomForm({ name: '', url: '', description: '' });
    setIsCustomFormOpen(false);
    toastState.add(`${customStandard.name} added successfully`, { type: 'success' });
  };

  const selectedCount = Object.keys(selectedStandards).length;
  const selectedArray = Object.values(selectedStandards);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.prefsOption}>
          <Checkbox
            onChange={() => handleToggleMetaDataStandards(!field.metaDataConfig?.hasCustomStandards)}
            isSelected={field.metaDataConfig?.hasCustomStandards || false}
          >
            <div className="checkbox">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <polyline points="1 9 7 14 15 4" />
              </svg>
            </div>

            Create a list of preferred metadata standards
          </Checkbox>

          {field.metaDataConfig?.hasCustomStandards && (
            <div className={styles.selectedItems}>
              <div className={styles.selectedItemsHeader}>
                <span className={styles.selectedCount}>
                  {selectedCount} {selectedCount === 1 ? 'metadata standard' : 'metadata standards'} selected
                </span>
                {selectedCount > 0 && (
                  <Button
                    onClick={removeAllStandards}
                    isDisabled={selectedCount === 0}
                    className="danger medium"
                  >
                    Remove All
                  </Button>
                )}
              </div>

              {selectedCount !== 0 && (
                <div>
                  {selectedArray.map(std => (
                    <div key={std.id} className={styles.item}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemContent}>
                          <div className={styles.itemTitle}>{std.name}</div>
                        </div>
                        <Button
                          onClick={() => removeStandard(std.id)}
                          className="danger small"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setIsModalOpen(true)}
                className={styles.addItemBtn}
              >
                Add a metadata standard
              </Button>

            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isDismissable
        onOpenChange={setIsModalOpen}
        isOpen={isModalOpen}
        data-testid="modal"
        className={styles.modalOverlay}
      >
        <Dialog>
          {({ close }) => (
            <>
              <div>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                      <Heading slot="title">Metadata Standard search{' '}<span className={styles.tag}>{selectedCount} selected</span></Heading>
                    </div>
                    <Button
                      onPress={() => {
                        setIsModalOpen(false);
                        close();
                      }}
                      className={styles.closeBtn}
                    >
                      x
                    </Button>
                  </div>

                  <div className={styles.modalBody}>
                    <div className={styles.filterSection}>
                      <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                          <div className={styles.searchWrapper}>

                            <SearchField className={styles.searchRepos}>
                              <Label>Search term</Label>
                              <Input
                                id="search-term"
                                value={searchTerm}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder='e.g. DataCite, Dublin, Biological, etc.'
                              />
                            </SearchField>

                            <div className={styles.filterActions}>
                              <Button
                                className="primary medium"
                                onPress={() => {
                                  handleSearch();
                                }}
                              >
                                Apply filter(s)
                              </Button>
                              <Button
                                onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
                                className="secondary medium"
                              >
                                Add metadata standard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isCustomFormOpen && (
                      <div className={styles.customRepoForm}>
                        <h4>Add a new metadata standard for your Template.</h4>
                        <FormInput
                          name="std-name"
                          type="text"
                          isRequired={true}
                          label="Name"
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                        />
                        <FormInput
                          name="std-url"
                          type="url"
                          isRequired={true}
                          label="Url"
                          value={customForm.url}
                          onChange={(e) => setCustomForm({ ...customForm, url: e.target.value })}
                        />
                        <FormInput
                          name="std-description"
                          type="text"
                          isRequired={true}
                          label="Description"
                          value={customForm.description}
                          onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                        />

                        <div className={styles.formActions}>
                          <Button
                            onClick={addCustomMetadataStandard}
                            className={`${styles.applyFilterBtn} primary medium`}
                          >
                            Add metadata standard to your Template
                          </Button>
                          <Button
                            onClick={() => setIsCustomFormOpen(false)}
                            className="secondary medium"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className={styles.searchResults}>
                      <div className={styles.paginationWrapper}>
                        <span className={styles.paginationInfo}>
                          Displaying standards 1 - 10 of 4372 in total
                        </span>
                        <Pagination {...paginationProps} />
                      </div>

                      {metaStandards?.map((std, index) => {
                        const isSelected = selectedStandards[std.id];
                        return (
                          <div
                            key={std.id}
                            className={`${styles.searchResultItem} ${isSelected ? styles.selected : ''}`}
                          >
                            <div className={styles.searchResultHeader}>
                              <div className={styles.searchResultTitle}>{std.name}</div>
                              <Button
                                onClick={() => toggleSelection(std)}
                                className={`small ${isSelected ? 'danger' : 'primary'}`}
                              >
                                {isSelected ? 'Remove' : 'Select'}
                              </Button>
                            </div>
                            <div className={styles.itemDescription}>{std.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </div >
  );
};

export default MetaDataStandardsSelector;