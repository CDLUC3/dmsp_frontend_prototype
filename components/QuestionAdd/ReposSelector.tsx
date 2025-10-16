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
  ListBoxItem,
  Modal,
  SearchField,
  Text
} from "react-aria-components";
import {
  FormInput,
  FormSelect,
} from '@/components/Form';
import ExpandButton from "@/components/ExpandButton";

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


const subjectAreas = [
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'biology', name: 'Biology' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'computer-science', name: 'Computer Science' },
  { id: 'geosciences', name: 'Geosciences' },
  { id: 'humanities', name: 'Humanities' },
  { id: 'materials-science', name: 'Materials Science' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'social-sciences', name: 'Social Sciences' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'thermal-engineering', name: 'Thermal Engineering' },
]

const repositoryTypes = [
  { id: 'multidisciplinary', name: 'Generalist (multidisciplinary)' },
  { id: 'disciplinary', name: 'Discipline specific' },
  { id: 'institutional', name: 'Institutional' },
]

interface RepositoryInterface {
  id: number;
  name: string;
  description: string;
  url: string;
  contact: string;
  access: string;
  identifier: string;
  tags: string[];
}

interface RepositoryFieldInterface {
  id: string;
  label: string;
  enabled: boolean;
  placeholder?: string;
  helpText?: string;
  enableSearch?: boolean;
  value?: string;
  repoConfig?: {
    hasCustomRepos: boolean;
    customRepos: string[];
  }
}
const RepositorySelectionSystem = ({
  field,
  handleTogglePreferredRepositories
}: {
  field: RepositoryFieldInterface;
  handleTogglePreferredRepositories: (hasCustomRepos: boolean) => void;
}) => {
  const toastState = useToast();
  const [selectedRepos, setSelectedRepos] = useState<RepositoryInterface[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [subjectArea, setSubjectArea] = useState('');
  const [repoType, setRepoType] = useState('');
  const [customForm, setCustomForm] = useState({ name: '', url: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Translation keys
  const Global = useTranslations("Global");

  // Original sample data - keep this as the source of truth
  const originalRepositories = [
    {
      id: 1105,
      name: "1.2 Meter CO Survey Dataverse",
      description: "The Radio Telescope Data Center (RTDC) reduces, archives, and makes available on its web site data from SMA and the CfA Millimeter-wave Telescope. The whole-Galaxy CO survey presented in Dame et al. (2001) is a composite of 37 separate surveys.",
      url: "https://dataverse.harvard.edu/dataverse/rtdc",
      contact: "Unknown",
      access: "Open",
      identifier: "DOI",
      tags: ["physical sciences", "radio telescope"]
    },
    {
      id: 1280,
      name: "1000 Functional Connectomes Project",
      description: "The FCP entailed the aggregation and public release (via www.nitrc.org) of over 1200 resting state fMRI (R-fMRI) datasets collected from 33 sites around the world.",
      url: "http://fcon_1000.projects.nitrc.org/fcpClassic/FcpTable.html",
      contact: "moderator@nitrc.org",
      access: "Open",
      identifier: "none",
      tags: ["neuroscience", "fMRI"]
    },
    {
      id: 1350,
      name: "Protein Data Bank",
      description: "The Protein Data Bank is a database for the three-dimensional structural data of large biological molecules, such as proteins and nucleic acids.",
      url: "https://www.rcsb.org",
      contact: "info@rcsb.org",
      access: "Open",
      identifier: "PDB ID",
      tags: ["biology", "proteins", "structural biology"]
    },
    {
      id: 1420,
      name: "GenBank",
      description: "GenBank is the NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
      url: "https://www.ncbi.nlm.nih.gov/genbank/",
      contact: "info@ncbi.nlm.nih.gov",
      access: "Open",
      identifier: "Accession Number",
      tags: ["genetics", "DNA", "biology"]
    },
    {
      id: 1501,
      name: "Crystallography Open Database",
      description: "Open-access collection of crystal structures of organic, inorganic, metal-organic compounds and minerals.",
      url: "http://www.crystallography.net",
      contact: "cod@crystallography.net",
      access: "Open",
      identifier: "COD ID",
      tags: ["chemistry", "crystallography", "materials"]
    }
  ];

  // Filtered repositories state
  const [repositories, setRepositories] = useState(originalRepositories);

  const handleSearchInput = (term: string) => {
    setSearchTerm(term);
    setRepositories(originalRepositories);

  };

  const handleSearch = () => {
    //TODO: Implement actual search/filter logic here

    const filtered = originalRepositories.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setRepositories(filtered);
  }

  const searchOnSubjectArea = (subject: string) => {
    console.log('Searching for subject area:', subject);
    //TODO: Implement actual search/filter logic here
    setSubjectArea(subject);
  };

  const searchOnRepositoryType = (type: string) => {
    console.log('Searching for repository type:', type);
    //TODO: Implement actual search/filter logic here
    setRepoType(type);
  };

  const toggleSelection = (repo: RepositoryInterface) => {
    setSelectedRepos(prev => {
      const newSelected = { ...prev };
      if (newSelected[repo.id]) {
        delete newSelected[repo.id];
        toastState.add(`${repo.name} removed`, { type: 'error' });
      } else {
        newSelected[repo.id] = repo;
        toastState.add(`${repo.name} added`, { type: 'success' });
      }
      return newSelected;
    });
  };

  const removeRepo = (repoId: number) => {
    const repo = selectedRepos[repoId];
    setSelectedRepos(prev => {
      const newSelected = { ...prev };
      delete newSelected[repoId];
      return newSelected;
    });
    toastState.add(`${repo.name} removed`, { type: 'error' });
  };

  const removeAllRepos = () => {
    if (window.confirm('Are you sure you want to remove all selected repositories?')) {
      setSelectedRepos([]);
      toastState.add('All repositories removed', { type: 'success' });
    }
  };

  const toggleDetails = (repoId: string | number, prefix: string = '') => {
    setExpandedDetails(prev => ({
      ...prev,
      [`${prefix}${repoId}`]: !prev[`${prefix}${repoId}`]
    }));
  };

  const addCustomRepo = () => {
    const { name, url, description } = customForm;

    if (!name.trim() || !url.trim() || !description.trim()) {
      toastState.add('Please fill in all fields', { type: 'error' });
      return;
    }

    const customRepo = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      contact: 'Custom repository',
      access: 'Unknown',
      identifier: 'N/A',
      tags: ['custom']
    };

    setSelectedRepos(prev => ({ ...prev, [customRepo.id]: customRepo }));
    setCustomForm({ name: '', url: '', description: '' });
    setIsCustomFormOpen(false);
    toastState.add(`${customRepo.name} added successfully`, { type: 'success' });
  };

  const selectedCount = Object.keys(selectedRepos).length;
  const selectedArray = Object.values(selectedRepos);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.prefsOption}>
          <Checkbox
            onChange={() => handleTogglePreferredRepositories(!field.repoConfig?.hasCustomRepos)}
            isSelected={field.repoConfig?.hasCustomRepos || false}
          >
            <div className="checkbox">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <polyline points="1 9 7 14 15 4" />
              </svg>
            </div>
            Create a list of preferred repositories
          </Checkbox>
          {field.repoConfig?.hasCustomRepos && (
            <div className={styles.selectedItems}>
              <div className={styles.selectedItemsHeader}>
                <span className={styles.selectedCount}>
                  {selectedCount} {selectedCount === 1 ? 'repository' : 'repositories'} selected
                </span>
                {selectedCount > 0 && (
                  <Button
                    onClick={removeAllRepos}
                    isDisabled={selectedCount === 0}
                    className="danger medium"
                  >
                    Remove All
                  </Button>
                )}

              </div>

              {selectedCount !== 0 && (
                <div>
                  {selectedArray.map(repo => (
                    <div key={repo.id} className={styles.item}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemContent}>
                          <div className={styles.itemTitle}>{repo.name}</div>
                          <div className={styles.itemMeta}>
                            <span className={`${styles.itemBadge} ${repo.access.toLowerCase() === 'open' ? styles.open : ''}`}>
                              {repo.access}
                            </span>
                            <span className={styles.itemBadge}>{repo.identifier}</span>
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.itemLink}
                            >
                              View repository →
                            </a>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeRepo(repo.id)}
                          className={`${styles.removeBtn} danger small`}
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
                Add a repository
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
                      <Heading slot="title">Repository search{' '}<span className={styles.tag}>{selectedCount} selected</span></Heading>
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
                          <FormSelect
                            selectClasses={styles.formSelect}
                            label="Subject area"
                            placeholder="Select a subject area"
                            ariaLabel="Select a subject area"
                            isRequired={false}
                            name="status"
                            items={subjectAreas}
                            onChange={(value) => searchOnSubjectArea(value)}
                            selectedKey={subjectArea}
                          >
                            {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                          </FormSelect>
                        </div>

                        <div className={styles.filterGroup}>
                          <FormSelect
                            selectClasses={styles.formSelect}
                            label="Repository type"
                            placeholder="Select a repository type"
                            ariaLabel="Select a repository type"
                            isRequired={false}
                            name="status"
                            items={repositoryTypes}
                            onChange={(value) => searchOnRepositoryType(value)}
                            selectedKey={repoType}
                          >
                            {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                          </FormSelect>
                        </div>
                      </div>

                      <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                          <div className={styles.searchWrapper}>

                            <SearchField className={styles.searchRepos}>
                              <Label>Search term</Label>
                              <Input
                                id="search-term"
                                value={searchTerm}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder='e.g. DNA, titanium, FAIR, etc.'
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
                                Add new repo
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isCustomFormOpen && (
                      <div className={styles.customRepoForm}>
                        <h4>Add a new repository for your Template</h4>
                        <FormInput
                          name="repo-name"
                          type="text"
                          isRequired={true}
                          label="Name"
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                        />
                        <FormInput
                          name="repo-url"
                          type="url"
                          isRequired={true}
                          label="Url"
                          value={customForm.url}
                          onChange={(e) => setCustomForm({ ...customForm, url: e.target.value })}
                        />
                        <FormInput
                          name="repo-description"
                          type="text"
                          isRequired={true}
                          label="Description"
                          value={customForm.description}
                          onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                        />

                        <div className={styles.formActions}>
                          <Button
                            onClick={addCustomRepo}
                            className={`${styles.applyFilterBtn} primary medium`}
                          >
                            Add repository to your Template
                          </Button>
                          <Button
                            onClick={() => {
                              setIsCustomFormOpen(false);
                              setCustomForm({ name: '', url: '', description: '' });//Reset fields
                            }}
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
                          Displaying repositories 1 - 10 of 4372 in total
                        </span>
                        <Pagination {...paginationProps} />
                      </div>

                      {repositories.map((repo, index) => {
                        const isSelected = selectedRepos[repo.id];
                        return (
                          <div
                            key={repo.id}
                            className={`${styles.searchResultItem} ${isSelected ? styles.selected : ''}`}
                          >
                            <div className={styles.searchResultHeader}>
                              <div className={styles.searchResultTitle}>{repo.name}</div>
                              <Button
                                onClick={() => toggleSelection(repo)}
                                className={`small ${isSelected ? 'danger' : 'primary'}`}
                              >
                                {isSelected ? 'Remove' : 'Select'}
                              </Button>
                            </div>
                            <div className={styles.itemDescription}>{repo.description}</div>
                            <div className={styles.tags}>
                              {repo.tags.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                              ))}
                            </div>
                            <ExpandButton
                              collapseLabel='Less info'
                              expandLabel='More info'
                              className={`${styles.moreInfoToggle} link`}
                              aria-label={expandedDetails[`modal-${repo.id}`] ? 'Less info' : 'More info'}
                              expanded={expandedDetails[`modal-${repo.id}`]}
                              setExpanded={() => toggleDetails(repo.id, 'modal-')}
                            />
                            {expandedDetails[`modal-${repo.id}`] && (
                              <div className={styles.repoDetails}>
                                <dl>
                                  <dt>Repository URL</dt>
                                  <dd>
                                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                      {repo.url}
                                    </a>
                                  </dd>
                                  <dt>Contact</dt>
                                  <dd>{repo.contact}</dd>
                                  <dt>Data access</dt>
                                  <dd>{repo.access}</dd>
                                  <dt>Persistent identifier</dt>
                                  <dd>{repo.identifier}</dd>
                                </dl>
                              </div>
                            )}
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

export default RepositorySelectionSystem;