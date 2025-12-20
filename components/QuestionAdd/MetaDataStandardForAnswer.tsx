'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Dialog,
  Heading,
  Input,
  Label,
  Link,
  Modal,
  SearchField,
} from "react-aria-components";


// GraphQL queries and mutations
import {
  useMetadataStandardsLazyQuery,
} from '@/generated/graphql';

import {
  addMetaDataStandardsAction
} from "./actions";

// Utilities/Other
import { routePath } from "@/utils/routes";
import { extractErrors } from "@/utils/errorHandler";
import logECS from "@/utils/clientLogger";

// Components
import {
  FormInput,
} from '@/components/Form';
import Pagination from '@/components/Pagination';
import ErrorMessages from '../ErrorMessages';
import { useToast } from '@/context/ToastContext';

import {
  MetaDataStandardInterface,
  MetaDataStandardFieldInterface
} from '@/app/types';
import styles from './Selector.module.scss';

const LIMIT = 5;

type AddMetaDataStandardsErrors = {
  general?: string;
  name?: string;
};

const MetaDataStandardForAnswer = ({
  value = [],
  onMetaDataStandardsChange
}: {
  value?: MetaDataStandardInterface[];
  onMetaDataStandardsChange: (standards: MetaDataStandardInterface[]) => void;
}) => {
  // Derive selected standards from value prop
  const selectedStandards = useMemo(() => {
    return (value || []).reduce((acc, std) => {
      if (std.uri !== undefined) {
        acc[std.uri] = std;
      }
      return acc;
    }, {} as { [uri: string]: MetaDataStandardInterface });
  }, [value]);

  const toastState = useToast();
  const params = useParams();
  const router = useRouter();
  // Get tempateId from the URL
  const templateId = String(params.templateId);


  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [customForm, setCustomForm] = useState({ name: '', uri: '', description: '' });
  const [errors, setErrors] = useState<string[]>([]);

  // Search related states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean | null>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean | null>(false);

  // Translation keys
  const Global = useTranslations("Global");
  const QuestionAdd = useTranslations("QuestionAdd");

  // Filtered metadata standards state
  /*eslint-disable @typescript-eslint/no-explicit-any */
  const [metaDataStandards, setMetaDataStandards] = useState<any[]>([]);

  // Metadata standards lazy query
  const [fetchMetaDataStandardsData, { data: metaDataStandardsData }] = useMetadataStandardsLazyQuery();


  // Fetch metadata standards based on search term criteria
  const fetchMetaDataStandards = async ({
    page,
    searchTerm = ''
  }: {
    page?: number;
    searchTerm?: string;
  }): Promise<void> => {
    let offsetLimit = 0;
    if (page) {
      setCurrentPage(page);
      offsetLimit = (page - 1) * LIMIT;
    }

    await fetchMetaDataStandardsData({
      variables: {
        paginationOptions: {
          offset: offsetLimit,
          limit: LIMIT,
          type: "OFFSET",
          sortDir: "DESC",
        },
        term: searchTerm,
      }
    });
  };

  // Handle pagination page click
  const handlePageClick = async (page: number) => {
    await fetchMetaDataStandards({
      page,
      searchTerm
    });
  };

  const handleSearchInput = (term: string) => {
    setSearchTerm(term);
  };

  // Handle search for metadata standards
  const handleSearch = async (term: string) => {
    setErrors([]); // Clear previous errors
    setSearchTerm(term);

    // Reset to first page on new search
    setCurrentPage(1);

    await fetchMetaDataStandards({ searchTerm: term });
  }


  const toggleSelection = (std: MetaDataStandardInterface) => {
    if (std.uri === undefined) return; // Guard: skip if no id

    const isSelected = !!selectedStandards[std.uri];
    let newSelected: MetaDataStandardInterface[];
    if (isSelected) {
      newSelected = (Object.values(selectedStandards) as MetaDataStandardInterface[]).filter(s => s.uri !== std.uri);
    } else {
      const formattedStd = {
        id: std.uri,
        name: std.name,
        uri: std.uri,
        description: std.description,
      };
      newSelected = [...(Object.values(selectedStandards) as MetaDataStandardInterface[]), formattedStd];
    }
    onMetaDataStandardsChange?.(newSelected);

    // Call toasts AFTER state update completes
    if (isSelected) {
      toastState.add(`${std.name} removed`, { type: 'success' });
    } else {
      toastState.add(`${std.name} added`, { type: 'success' });
    }
  };

  // Remove single standard from selected list
  const removeStandard = (stdId: string) => {
    const std = selectedStandards[stdId];
    const newSelected = (Object.values(selectedStandards) as MetaDataStandardInterface[])
      .filter(s => s.id !== undefined && String(s.id) !== stdId);
    onMetaDataStandardsChange?.(newSelected);
    toastState.add(`${std.name} removed`, { type: 'success' });
  };

  // Remove all selected standards
  const removeAllStandards = () => {
    if (window.confirm(QuestionAdd('researchOutput.metaDataStandards.messages.confirmRemovalAll'))) {
      onMetaDataStandardsChange?.([]);
      toastState.add(QuestionAdd('researchOutput.metaDataStandards.messages.allRemoved'), { type: 'success' });
    }
  };
  const handleAddCustomStandard = useCallback(async () => {
    setErrors([]);
    const { name, description, uri } = customForm;

    if (!name.trim() || !uri.trim() || !description.trim()) {
      toastState.add(QuestionAdd('researchOutput.metaDataStandards.messages.fillInAllFields'), { type: 'error' });
      return;
    };

    const response = await addMetaDataStandardsAction({
      name: name.trim(),
      description: description.trim(),
      uri: uri.trim()
    });

    if (response.redirect) {
      router.push(response.redirect);
      return;
    }

    if (!response.success) {
      setErrors(
        response.errors?.length ? response.errors : [Global("messaging.somethingWentWrong")]
      )
      logECS("error", "adding metadata standard", {
        errors: response.errors,
        url: { path: routePath("template.q.new", { templateId }) },
      });
      return;
    } else {
      if (response?.data?.errors) {
        const errs = extractErrors<AddMetaDataStandardsErrors>(response?.data?.errors, ["general", "name"]);

        if (errs.length > 0) {
          setErrors(errs);
          logECS("error", "adding metadata standard", {
            errors: errs,
            url: { path: routePath("template.q.new", { templateId }) },
          });
          return; // Don't proceed to success message if there are errors
        }
      }

      // Add the newly created standard to selected standards
      const newStandard: MetaDataStandardInterface = {
        id: uri.trim(), // Using URI as ID for custom standards
        name: name.trim(),
        uri: uri.trim(),
        description: description.trim(),
      };

      onMetaDataStandardsChange?.([...(Object.values(selectedStandards) as MetaDataStandardInterface[]), newStandard]);
      setCustomForm({ name: '', uri: '', description: '' });
      setIsCustomFormOpen(false);
      setIsModalOpen(false); //close modal after adding custom standard
      const successMessage = QuestionAdd('researchOutput.metaDataStandards.messages.addedSuccessfully', { name: name.trim() });
      toastState.add(successMessage, { type: "success" });
    }
  }, [customForm, templateId, Global, router]);

  // Process repositoriesData changes
  useEffect(() => {
    // If user navigates away while request is in flight, and the network response arrives,
    // can't perform state update on unmounted component. So we track if component is mounted.
    let isMounted = true; // Track if component is still mounted

    const processMetaDataStandardsData = () => {
      if (metaDataStandardsData?.metadataStandards?.items) {

        if (isMounted) {
          // Filter out null items
          const validStandards = metaDataStandardsData.metadataStandards.items.filter(item => item !== null);
          setMetaDataStandards(validStandards);
          setTotalCount(metaDataStandardsData.metadataStandards.totalCount ?? 0);
          setTotalPages(Math.ceil((metaDataStandardsData.metadataStandards.totalCount ?? 0) / LIMIT));
          setHasNextPage(metaDataStandardsData.metadataStandards.hasNextPage ?? false);
          setHasPreviousPage(metaDataStandardsData.metadataStandards.hasPreviousPage ?? false);
        }
      } else {
        if (isMounted) {
          setMetaDataStandards([]);
        }
      }
    };
    processMetaDataStandardsData();

    return () => {
      isMounted = false; // Mark as unmounted
    };

  }, [metaDataStandardsData]);

  useEffect(() => {
    // On initial load, fetch all metadata standards
    fetchMetaDataStandards({ page: 1 });
  }, []);


  const selectedCount = Object.keys(selectedStandards).length;
  const selectedArray = Object.values(selectedStandards);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.prefsOption}>
          <div className={styles.selectedItems}>
            <div className={styles.selectedItemsHeader}>
              <span className={styles.selectedCount}>
                {selectedCount} {selectedCount === 1 ? QuestionAdd('researchOutput.metaDataStandards.singleMetaData') : QuestionAdd('researchOutput.metaDataStandards.multipleMetaData')} selected
              </span>
              {selectedCount > 0 && (
                <Button
                  onClick={removeAllStandards}
                  isDisabled={selectedCount === 0}
                  className="secondary medium"
                >
                  {Global('buttons.removeAll')}
                </Button>
              )}
            </div>

            {selectedCount !== 0 && (
              <div>
                {selectedArray.map(std => (
                  <div key={std.id || std.name} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemContent}>
                        <div className={styles.itemTitle}>{std.name}</div>
                      </div>
                      <Button
                        onClick={() => removeStandard(std.id ? String(std.id) : '')}
                        className="secondary small"
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
              {QuestionAdd('researchOutput.metaDataStandards.buttons.add')}
            </Button>

          </div>

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
                      <Heading slot="title">{QuestionAdd('researchOutput.metaDataStandards.headings.dialogHeading')}{' '}<span className={styles.tag}>{QuestionAdd('researchOutput.metaDataStandards.selectedCount', { count: selectedCount })}</span></Heading>
                    </div>
                    <Button
                      type="button"
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
                          <div className={styles.searchWrapper}>

                            <SearchField className={styles.searchRepos}>
                              <Label>{Global('labels.searchTerm')}</Label>
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
                                  handleSearch(searchTerm);
                                }}
                              >
                                {Global('buttons.applyFilter')}
                              </Button>
                              <Button
                                onClick={() => setIsCustomFormOpen(!isCustomFormOpen)}
                                className="secondary medium"
                              >
                                {QuestionAdd('researchOutput.metaDataStandards.buttons.add')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isCustomFormOpen && (
                      <div className={styles.customRepoForm}>
                        <ErrorMessages
                          errors={errors}
                          ref={errorRef}
                        />
                        <h4>{QuestionAdd('researchOutput.metaDataStandards.headings.addCustomHeading')}</h4>
                        <FormInput
                          name="std-name"
                          data-testid="form-input-std-name"
                          type="text"
                          isRequired={true}
                          label={Global('labels.name')}
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                        />
                        <FormInput
                          name="std-url"
                          data-testid="form-input-std-url"
                          type="url"
                          isRequired={true}
                          label={Global('labels.url')}
                          value={customForm.uri}
                          helpMessage={QuestionAdd('researchOutput.metaDataStandards.help.uri')}
                          onChange={(e) => setCustomForm({ ...customForm, uri: e.target.value })}
                        />
                        <FormInput
                          name="std-description"
                          data-testid="form-input-std-description"
                          type="text"
                          isRequired={true}
                          label={Global('labels.description')}
                          value={customForm.description}
                          onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                        />

                        <div className={styles.formActions}>
                          <Button
                            onClick={handleAddCustomStandard}
                            data-testid="add-custom-std-btn"
                            className={`${styles.applyFilterBtn} primary medium`}
                          >
                            {QuestionAdd('researchOutput.metaDataStandards.buttons.addToTemplate')}
                          </Button>
                          <Button
                            onClick={() => setIsCustomFormOpen(false)}
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
                          Displaying standards {metaDataStandards.length} of {totalCount} in total
                        </span>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          hasPreviousPage={hasPreviousPage}
                          hasNextPage={hasNextPage}
                          handlePageClick={handlePageClick}
                        />
                      </div>

                      {metaDataStandards?.map((std) => {
                        const isSelected = selectedStandards[std.uri];
                        return (
                          <div
                            key={std.id}
                            className={`${styles.searchResultItem} ${isSelected ? styles.selected : ''}`}
                          >
                            <div className={styles.searchResultHeader}>
                              <div>
                                <p className={styles.searchResultTitle}>{std.name}</p>
                                <p>{std.description}</p>
                              </div>
                              <Button
                                onClick={() => toggleSelection(std)}
                                className={`small ${isSelected ? 'secondary' : 'primary'}`}
                              >
                                {isSelected ? Global('buttons.remove') : Global('buttons.select')}
                              </Button>
                            </div>
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

export default MetaDataStandardForAnswer;