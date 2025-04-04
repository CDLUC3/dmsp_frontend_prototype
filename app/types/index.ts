import { ReactNode } from "react";

export interface EmailInterface {
  id?: number | null;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}

export interface LanguageInterface {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface ProfileDataInterface {
  givenName: string;
  surName: string;
  affiliationName: string;
  affiliationId: string;
  otherAffiliationName: string;
  languageId: string;
  languageName: string;
}

export interface TemplateSearchResultInterface {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  visibility?: string | null;
  isDirty?: boolean | null;
  latestPublishVersion?: string | null;
  latestPublishDate?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  modifiedByName?: string | null;
  ownerId?: string | null;
  ownerDisplayName?: string | null;
}


export interface TemplateInterface {
  name: string;
  description?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  id?: number | null;
  isDirty?: boolean;
  owner?: { // Make `owner` optional and nullable
    displayName?: string;
    name?: string;
    searchName?: string;
  } | null;
  visibility?: string;
}

export interface TemplateItemProps {
  id?: number | null;
  template?: {
    id?: number | null;
  },
  title: string;
  content?: JSX.Element | null;
  description?: string;
  link?: LinkHref;
  defaultExpanded: boolean;
  funder?: string | null;
  funderUri?: string;
  lastUpdated?: string | null;
  publishStatus?: string | null;
  bestPractices?: boolean;
}

export interface VersionedTemplateSearchResultInterface {
  id: number;
  name?: string;
  description: string;
  modified: string;
  modifiedById: number;
  modifiedByName: string;
  ownerId: number;
  ownerURI: string;
  ownerDisplayName: string;
  ownerSearchName: string;
  visibility: string;
  bestPractice: boolean;
}

export interface MyVersionedTemplatesInterface {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  versionType?: string | null;
  visibility?: string | null;
  template?: {
    __typename?: string; // Match GraphQL's optional __typename
    id?: number | null;
    owner?: {
      __typename?: string; // Match GraphQL's optional __typename
      id?: number | null;
      displayName?: string; // Make displayName optional
      name?: string; // Make name optional
      searchName?: string; // Make searchName optional
    } | null;
  } | null; // Allow `template` to be null or undefined
}
// Define valid href types for Next.js Link
type Url = string | URL;
type LinkHref = Url | {
  pathname: string;
  query?: Record<string, string | number | string[] | undefined>;
  hash?: string;
};

export interface TemplateVersionInterface {
  name: string;
  version: string;
  versionType?: 'DRAFT' | 'PUBLISHED';
  created?: string | null;
  comment?: string | null;
  id?: number | null;
  modified?: string | null;
  versionedBy?: {
    givenName?: string | null;
    surName?: string | null;
    affiliation?: { displayName: string } | null;
    modified?: string | null;
  } | null;
};

export interface SectionFormInterface {
  sectionName: string;
  sectionIntroduction: string;
  sectionRequirements: string;
  sectionGuidance: string;
  displayOrder?: number;
  bestPractice?: boolean;
  sectionTags?: TagsInterface[];
}

export interface SectionFormErrorsInterface {
  sectionName: string;
  sectionIntroduction: string;
  sectionRequirements: string;
  sectionGuidance: string;
}

export interface TagsInterface {
  id?: number | null;
  name: string;
  description?: string | null;
}

export interface QuestionTypesInterface {
  id: number;
  name: string;
  usageDescription: string;
}

export interface QuestionOptions {
  id?: number | null;
  text: string;
  orderNumber: number;
  isDefault?: boolean | null;
  questionId: number;
}

export interface Question {
  id?: number | null | undefined;
  displayOrder?: number | null;
  questionText?: string | null;
  requirementText?: string | null;
  guidanceText?: string | null;
  sampleText?: string | null;
  useSampleTextAsDefault?: boolean | null;
  required?: boolean;
  questionOptions?: QuestionOptions[] | null;
}

export interface ProjectSearchResultInterface {
  id?: number | null;
  title?: string | null;
  abstractText?: string | null;
  startDate?: string | null;
  isTestProject?: boolean | null;
  researchDomain?: string | null;
  endDate?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  modifiedByName?: string | null;
  created?: string | null;
  createdById?: number | null;
  createdByName?: string | null;
  collaborators?: {
    name?: string | null;
    accessLevel?: string | null;
    orcid?: string | null;
  }[] | null;
  contributors?: {
    name?: string | null;
    role?: string | null;
    orcid?: string | null;
  }[] | null;
  funders?: {
    name?: string | null;
    grantId?: string | null;
  }[] | null;
}

export interface ProjectItemProps {
  id?: number | null;
  title: string;
  description?: string;
  link?: LinkHref;
  defaultExpanded: boolean;
  funder?: string;
  startDate: string;
  endDate: string;
  members: {
    name: string;
    roles: string;
    orcid?: string | null;
  }[];
  grantId?: string | null;
}

export interface ProjectContributor {
  id?: number | null;
  givenName: string;
  surName: string;
  email?: string | null;
  orcid?: string | null;
  affiliation?: Affiliation | null;
  contributorRoles: ContributorRole[];
}

export interface ContributorRole {
  id?: number | null;
  displayOrder: number;
  label: string;
  uri: string;
  description?: string | null;
}

export interface Affiliation {
  id?: number | null;
  name: string;
  url?: string | null;
}

interface RadioButtonInterface {
  value: string;
  label: string;
  description?: string | ReactNode;
}
export interface RadioButtonProps {
  name: string;
  description?: string | ReactNode;
  radioGroupLabel: string;
  radioButtonData: RadioButtonInterface[];
  value: string;
  isInvalid?: boolean;
  errorMessage?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string) => void;
}

interface CheckboxInterface {
  value: string;
  label: string;
  description?: string;
}
export interface CheckboxGroupProps {
  name?: string;
  checkboxGroupLabel?: string;
  checkboxGroupDescription?: string;
  checkboxData: CheckboxInterface[];
  value?: string[];
  isInvalid?: boolean;
  errorMessage?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: ((value: string[]) => void),
  isRequired?: boolean;
}

export interface ProjectContributorErrorInterface {
  givenName: string;
  surName: string;
  affiliationId: string;
  email: string;
  orcid: string;
  projectRoles: string;
}

export interface ProjectContributorFormInterface {
  givenName: string;
  surName: string;
  affiliationId: string;
  email: string;
  orcid: string;
}

export interface PlanContributorRolesInterface {
  id: number | null;
  label: string;
}

export interface ProjectContributorsInterface {
  id: number | null;
  fullName: string;
  affiliation: string;
  orcid: string;
  roles: PlanContributorRolesInterface[];
  isPrimaryContact: boolean;
}
