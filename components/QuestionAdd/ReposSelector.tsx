'use client';

import { useEffect, useState } from 'react';
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
} from "react-aria-components";
import {
  FormInput,
  FormSelect,
} from '@/components/Form';
import ExpandButton from "@/components/ExpandButton";

import Pagination from '@/components/Pagination';
import { useToast } from '@/context/ToastContext';

import {
  RepositoryInterface,
  RepositoryFieldInterface
} from '@/app/types';
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


// Original sample data - keep this as the source of truth
const originalRepositories = [
  {
    id: 1105,
    name: "1.2 Meter CO Survey Dataverse",
    description: "The Radio Telescope Data Center (RTDC) reduces, archives, and makes available on its web site data from SMA and the CfA Millimeter-wave Telescope. The whole-Galaxy CO survey presented in Dame et al. (2001) is a composite of 37 separate surveys.",
    uri: "https://dataverse.harvard.edu/dataverse/rtdc",
    contact: "Unknown",
    access: "Open",
    identifier: "DOI",
    tags: ["physical sciences", "radio telescope"]
  },
  {
    id: 1280,
    name: "1000 Functional Connectomes Project",
    description: "The FCP entailed the aggregation and public release (via www.nitrc.org) of over 1200 resting state fMRI (R-fMRI) datasets collected from 33 sites around the world.",
    uri: "http://fcon_1000.projects.nitrc.org/fcpClassic/FcpTable.html",
    contact: "moderator@nitrc.org",
    access: "Open",
    identifier: "none",
    tags: ["neuroscience", "fMRI"]
  },
  {
    id: 1350,
    name: "Protein Data Bank",
    description: "The Protein Data Bank is a database for the three-dimensional structural data of large biological molecules, such as proteins and nucleic acids.",
    uri: "https://www.rcsb.org",
    contact: "info@rcsb.org",
    access: "Open",
    identifier: "PDB ID",
    tags: ["biology", "proteins", "structural biology"]
  },
  {
    id: 1420,
    name: "GenBank",
    description: "GenBank is the NIH genetic sequence database, an annotated collection of all publicly available DNA sequences.",
    uri: "https://www.ncbi.nlm.nih.gov/genbank/",
    contact: "info@ncbi.nlm.nih.gov",
    access: "Open",
    identifier: "Accession Number",
    tags: ["genetics", "DNA", "biology"]
  },
  {
    id: 1501,
    name: "Crystallography Open Database",
    description: "Open-access collection of crystal structures of organic, inorganic, metal-organic compounds and minerals.",
    uri: "http://www.crystallography.net",
    contact: "cod@crystallography.net",
    access: "Open",
    identifier: "COD ID",
    tags: ["chemistry", "crystallography", "materials"]
  }
];

/* Research Output question's Repository Selection System */
const RepositorySelectionSystem = ({
  field,
  handleTogglePreferredRepositories,
  onRepositoriesChange
}: {
  field: RepositoryFieldInterface;
  handleTogglePreferredRepositories: (hasCustomRepos: boolean) => void;
  onRepositoriesChange?: (repos: RepositoryInterface[]) => void;
}) => {

  // Toast context for notifications
  const toastState = useToast();

  // Translation keys
  const Global = useTranslations("Global");
  const QuestionAdd = useTranslations("QuestionAdd");

  // Selected repositories state - include any customRepos from field config as initial state
  const [selectedRepos, setSelectedRepos] = useState<{ [id: string]: RepositoryInterface }>(() => {
    const initial = field.repoConfig?.customRepos || [];
    // Convert array to object keyed by id
    return initial.reduce((acc: { [id: string]: RepositoryInterface }, repo) => {
      acc[repo.id] = repo;
      return acc;
    }, {});
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [subjectArea, setSubjectArea] = useState('');
  const [repoType, setRepoType] = useState('');
  const [customForm, setCustomForm] = useState({ name: '', url: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  // Filtered repositories state
  const [repositories, setRepositories] = useState(originalRepositories);

  const handleSearchInput = (term: string) => {
    setSearchTerm(term);
    setRepositories(originalRepositories);
  };

  // Handle search for repositories
  const handleSearch = () => {
    //TODO: Implement actual search request to backend with pagination
    // with subjectArea, repoType, and searchTerm as parameters
    const filtered = originalRepositories.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setRepositories(filtered);
  }

  // Set selected subject area
  const searchOnSubjectArea = (subject: string) => {
    setSubjectArea(subject);
  };

  // Set selected repository type
  const searchOnRepositoryType = (type: string) => {
    setRepoType(type);
  };

  // Handle add/removal of repository selections in modal view and display confirmation toasts
  const toggleSelection = (repo: RepositoryInterface) => {
    const isRemoving = selectedRepos[repo.id];

    setSelectedRepos(prev => {
      const newSelected = { ...prev };
      if (newSelected[repo.id]) {
        delete newSelected[repo.id];
      } else {
        newSelected[repo.id] = repo;
      }
      return newSelected;
    });

    // Call toasts AFTER state update completes
    if (isRemoving) {
      toastState.add(QuestionAdd('researchOutput.repoSelector.messages.removedRepo', { name: repo.name }), { type: 'success' });
    } else {
      toastState.add(QuestionAdd('researchOutput.repoSelector.messages.addedRepo', { name: repo.name }), { type: 'success' });
    }
  };

  // Remove a single repository from the non-modal view
  const removeRepo = (repoId: number) => {
    const repo = selectedRepos[repoId];
    setSelectedRepos(prev => {
      const newSelected = { ...prev };
      delete newSelected[repoId];
      return newSelected;
    });
    toastState.add(QuestionAdd('researchOutput.repoSelector.messages.removedRepo', { name: repo.name }), { type: 'success' });
  };
  // Removal of all selected repositories from the non-modal view
  const removeAllRepos = () => {
    if (window.confirm(QuestionAdd('researchOutput.repoSelector.messages.confirmRemoveAll'))) {
      setSelectedRepos({});
      // Uncheck the "Create custom repositories" box as well
      handleTogglePreferredRepositories(false);
      toastState.add(QuestionAdd('researchOutput.repoSelector.messages.allRemoved'), { type: 'success' });
    }
  };

  // Toggle display of additional repository details in modal view
  const toggleDetails = (repoId: string | number, prefix: string = '') => {
    setExpandedDetails(prev => ({
      ...prev,
      [`${prefix}${repoId}`]: !prev[`${prefix}${repoId}`]
    }));
  };

  // Add the custom repository to the selected list
  const addCustomRepo = () => {
    const { name, url, description } = customForm;

    if (!name.trim() || !url.trim() || !description.trim()) {
      toastState.add(QuestionAdd('researchOutput.repoSelector.errors.customRepoError'), { type: 'error' });
      return;
    }

    const customRepo = {
      id: Date.now(),
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
    toastState.add(QuestionAdd('researchOutput.repoSelector.messages.customRepoAdded', { name: customRepo.name }), { type: 'success' });
  };

  useEffect(() => {
    const reposArray = Object.values(selectedRepos);
    onRepositoriesChange?.(reposArray);
  }, [selectedRepos]);


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
            {QuestionAdd('researchOutput.repoSelector.labels.createRepos')}
          </Checkbox>
          {field.repoConfig?.hasCustomRepos && (
            <div className={styles.selectedItems}>
              <div className={styles.selectedItemsHeader}>
                <span className={styles.selectedCount}>
                  {selectedCount} {selectedCount === 1 ? QuestionAdd('researchOutput.repoSelector.repositorySelected') : QuestionAdd('researchOutput.repoSelector.repositoriesSelected')}
                </span>
                {selectedCount > 0 && (
                  <Button
                    onClick={removeAllRepos}
                    isDisabled={selectedCount === 0}
                    className="medium secondary"
                  >
                    {Global('buttons.removeAll')}
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
                            <span className={`${styles.itemBadge} ${repo.access?.toLowerCase() === 'open' ? styles.open : ''}`}>
                              {repo.access}
                            </span>
                            <span className={styles.itemBadge}>{repo.identifier}</span>
                            <a
                              href={repo.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.itemLink}
                            >
                              {QuestionAdd('researchOutput.repoSelector.links.viewRepository')} →
                            </a>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeRepo(repo.id)}
                          className={`${styles.removeBtn} secondary small`}
                        >
                          {Global('buttons.remove')}
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
                {QuestionAdd('researchOutput.repoSelector.buttons.addRepo')}
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
                      <Heading slot="title">{QuestionAdd('researchOutput.repoSelector.headings.repoSearch')}{' '}<span className={styles.tag}>{QuestionAdd('researchOutput.repoSelector.selectedCount', { count: selectedCount })}</span></Heading>
                    </div>
                    <Button
                      onPress={() => {
                        setIsModalOpen(false);
                        close();
                      }}
                      className={styles.closeBtn}
                      aria-label={Global('buttons.closeModal')}
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
                            label={QuestionAdd('researchOutput.repoSelector.labels.subjectArea')}
                            placeholder={QuestionAdd('researchOutput.repoSelector.selectSubjectArea')}
                            ariaLabel={QuestionAdd('researchOutput.repoSelector.selectSubjectArea')}
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
                            label={QuestionAdd('researchOutput.repoSelector.labels.repoType')}
                            placeholder={QuestionAdd('researchOutput.repoSelector.selectRepoType')}
                            ariaLabel={QuestionAdd('researchOutput.repoSelector.selectRepoType')}
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
                              <Label>{Global('labels.searchTerm')}</Label>
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
                                {Global('buttons.applyFilter')}
                              </Button>
                              <Button
                                onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
                                className="secondary medium"
                              >
                                {QuestionAdd('researchOutput.repoSelector.buttons.addCustomRepo')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/**To add Custom repositories- name, url and description fields */}
                    {isCustomFormOpen && (
                      <div className={styles.customRepoForm}>
                        <h4>{QuestionAdd('researchOutput.repoSelector.headings.addNewRepo')}</h4>
                        <FormInput
                          name="repo-name"
                          data-testid="form-input-repo-name"
                          type="text"
                          isRequired={true}
                          label={Global('labels.name')}
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                        />
                        <FormInput
                          name="repo-url"
                          data-testid="form-input-repo-url"
                          type="url"
                          isRequired={true}
                          label={Global('labels.url')}
                          value={customForm.url}
                          onChange={(e) => setCustomForm({ ...customForm, url: e.target.value })}
                        />
                        <FormInput
                          name="repo-description"
                          data-testid="form-input-repo-description"
                          type="text"
                          isRequired={true}
                          label={Global('labels.description')}
                          value={customForm.description}
                          onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                        />

                        <div className={styles.formActions}>
                          <Button
                            onClick={addCustomRepo}
                            className={`${styles.applyFilterBtn} primary medium`}
                          >
                            {QuestionAdd('researchOutput.repoSelector.buttons.addRepository')}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsCustomFormOpen(false);
                              setCustomForm({ name: '', url: '', description: '' });//Reset fields
                            }}
                            className="secondary medium"
                          >
                            {Global('buttons.cancel')}
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

                      {repositories.map((repo) => {
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
                                className={`small ${isSelected ? 'secondary' : 'primary'}`}
                              >
                                {isSelected ? Global('buttons.remove') : Global('buttons.select')}
                              </Button>
                            </div>
                            <div className={styles.itemDescription}>{repo.description}</div>
                            <div className={styles.tags}>
                              {repo.tags.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                              ))}
                            </div>
                            <ExpandButton
                              collapseLabel={Global('buttons.lessInfo')}
                              data-testid="expand-button"
                              expandLabel={Global('buttons.moreInfo')}
                              className={`${styles.moreInfoToggle} link`}
                              aria-label={expandedDetails[`modal-${repo.id}`] ? Global('buttons.lessInfo') : Global('buttons.moreInfo')}
                              expanded={expandedDetails[`modal-${repo.id}`]}
                              setExpanded={() => toggleDetails(repo.id, 'modal-')}
                            />
                            {expandedDetails[`modal-${repo.id}`] && (
                              <div className={styles.repoDetails}>
                                <dl>
                                  <dt>{QuestionAdd('researchOutput.repoSelector.descriptions.repoTitle')}</dt>
                                  <dd>
                                    <a href={repo.uri} target="_blank" rel="noopener noreferrer">
                                      {repo.uri}
                                    </a>
                                  </dd>
                                  <dt>{QuestionAdd('researchOutput.repoSelector.descriptions.contactTitle')}</dt>
                                  <dd>{repo.contact}</dd>
                                  <dt>{QuestionAdd('researchOutput.repoSelector.descriptions.dataAccessTitle')}</dt>
                                  <dd>{repo.access}</dd>
                                  <dt>{QuestionAdd('researchOutput.repoSelector.descriptions.identifierTitle')}</dt>
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