import { ReactNode } from "react";
import { PlanSectionProgress, TemplateVisibility, PlanFeedback, ProjectFundingStatus } from "@/generated/graphql";
import { AffiliationSearchQuestionType, AnyQuestionType } from '@dmptool/types';

// Re-export types from questionAdd module
export * from './questionAdd';

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

export interface PaginatedTemplateSearchResultsInterface {
  items: TemplateSearchResultInterface[] | null;
}
export interface TemplateSearchResultInterface {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  latestPublishVisibility?: TemplateVisibility | null;
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
  link?: string | null;
  defaultExpanded: boolean;
  funder?: string | null;
  funderUri?: string;
  lastUpdated?: string | null;
  lastRevisedBy?: string | null;
  publishStatus?: string | null;
  publishDate?: string | null;
  bestPractices?: boolean;
  latestPublishVisibility?: string | null;
}

export interface PaginatedVersionedTemplateSearchResultsInterface {
  items: VersionedTemplateSearchResultInterface[] | null;
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

export interface PaginatedMyVersionedTemplatesInterface {
  items: MyVersionedTemplatesInterface[] | null;
}
export interface MyVersionedTemplatesInterface {
  id?: number | null;
  name?: string | null;
  description?: string | null;
  modified?: string | null;
  modifiedById?: number | null;
  modifiedByName?: string | null;
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

export interface QuestionOptions {
  id?: number | null;
  text: string;
  isSelected?: boolean | null;
}

export interface Question {
  id?: number | null | undefined;
  displayOrder?: number | null;
  json?: string | null;
  questionType?: string | null;
  questionText?: string | null;
  requirementText?: string | null;
  guidanceText?: string | null;
  sampleText?: string | null;
  useSampleTextAsDefault?: boolean | null;
  required?: boolean;
  templateId?: number | null;
  questionOptions?: QuestionOptions[] | null;
  modified?: string | null;
}

export interface QuestionFormatInterface {
  type?: string;
  title?: string;
  usageDescription?: string;
  defaultJSON?: AnyQuestionType;
}

export interface PaginatedProjectSearchResultsInterface {
  items: ProjectSearchResultInterface[] | null;
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
  members?: {
    name?: string | null;
    role?: string | null;
    orcid?: string | null;
  }[] | null;
  fundings?: {
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
  funding?: string;
  startDate: string;
  endDate: string;
  members: {
    name: string;
    roles: string;
    orcid?: string | null;
  }[];
  plans?: {
    name: string;
    dmpId?: string | null;
    link?: string;
  }[];
  grantId?: string | null;
  modified?: string;
  nextCursor?: string | null;
  totalCount?: number | null;
}

export interface ProjectMember {
  id?: number | null;
  givenName: string;
  surName: string;
  email?: string | null;
  orcid?: string | null;
  affiliation?: Affiliation | null;
  memberRoles: MemberRole[];
}

export interface MemberRole {
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

export interface RadioButtonInterface {
  value: string;
  label: string;
  description?: string | ReactNode;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  classes?: string;
  description?: string | ReactNode;
  radioGroupLabel?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  onChange?: (value: string) => void;
  isRequired?: boolean;
  isRequiredVisualOnly?: boolean;
  children?: ReactNode; // allow any Radio buttons or JSX
}

export interface CheckboxInterface {
  value: string;
  label: string;
  description?: string;
}

export interface CheckboxGroupProps {
  name?: string;
  checkboxGroupLabel?: string;
  checkboxGroupDescription?: string;
  value?: string[];
  isInvalid?: boolean;
  errorMessage?: string;
  onChange?: ((value: string[]) => void),
  isRequired?: boolean;
  isRequiredVisualOnly?: boolean;
  children?: ReactNode; // allow any Checkboxes or JSX
}

export interface ProjectMemberErrorInterface {
  givenName: string;
  surName: string;
  affiliationId: string;
  email: string;
  orcid: string;
  projectRoles: string;
}

export interface ProjectMemberFormInterface {
  givenName: string;
  surName: string;
  affiliationId: string;
  email: string;
  orcid: string;
}


export interface PlanMemberRolesInterface {
  id: number | null;
  label: string;
}

export interface ProjectMembersInterface {
  id: number | null;
  fullName: string;
  affiliation: string;
  orcid: string;
  roles: PlanMemberRolesInterface[];
  isPrimaryContact: boolean;
}

export interface PlanMember {
  fullname: string;
  role: string[];
  orcid: string;
  isPrimaryContact: boolean;
  email: string;
}
export interface ListItemsInterface {
  id: number;
  content: JSX.Element;
  completed: boolean;
}

export interface PlanOverviewInterface {
  id: number | null;
  dmpId: string;
  registered: string | null;
  title: string;
  status: string;
  funderName: string;
  primaryContact: string;
  members: PlanMember[];
  versionedSections: PlanSectionProgress[];
  percentageAnswered: number;
}

export interface ActionResponse {
  success: boolean;
  errors?: string[];
  data?: {
    errors?: {
      [key: string]: string | null;
    };
  };
  redirect?: string;
}

export interface UserInterface {
  givenName: string;
  surName: string;
  affiliation: {
    uri: string;
  }
  orcid: string;
}
export interface CollaboratorResponse {
  success: boolean;
  errors?: string[];
  data?: {
    user: UserInterface;
    errors: {
      general: string | null;
      email: string | null;
    }
  };
  redirect?: string;
}

export interface AddProjectMemberResponse {
  success: boolean;
  errors?: string[];
  data?: {
    id?: number;
    givenName?: string;
    surName?: string;
    email?: string;
    affiliation?: {
      id: number;
      name: string;
      uri: string;
    };
    orcid?: string | null;
    errors?: {
      email?: string | null;
      surName?: string | null;
      general?: string | null;
      givenName?: string | null;
      orcid?: string | null;
      memberRoleIds?: string | null;
      affiliationId?: string | null;
      projectId?: string | null;
    };
  };
  redirect?: string;
}

export type FunderSearchItem = {
  id: number;
  displayName: string;
  uri: string;
};

export type FunderSearchResults = {
  totalCount?: number | null;
  nextCursor?: string | null;
  items?: (FunderSearchItem | null)[] | null;
};


export interface Option {
  type: string;
  attributes: {
    label: string;
    value: string;
    selected?: boolean;
    checked?: boolean;
  };
}

export interface AffiliationSearchQuestionProps {
  parsedQuestion: AffiliationSearchQuestionType;
  affiliationData: { affiliationName: string, affiliationId: string };
  otherAffiliationName?: string;
  otherField?: boolean;
  setOtherField: (value: boolean) => void;
  handleAffiliationChange: (id: string, value: string) => Promise<void>
  handleOtherAffiliationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface User {
  __typename?: "User";
  id?: number | null;
  surName?: string | null;
  givenName?: string | null;
}

export interface MergedComment {
  __typename?: "AnswerComment" | "PlanFeedbackComment";
  id?: number | null;
  commentText?: string | null;
  answerId?: number | null;
  created?: string | null;
  createdById?: number | null;
  type: 'answer' | 'feedback';
  isAnswerComment: boolean;
  isFeedbackComment: boolean;

  // Optional fields that may exist on either type
  user?: User | null;
  modified?: string | null;
  PlanFeedback?: PlanFeedback | null;
}

export type SuggestionInterface = {
  id: string;
  displayName: string;
  uri: string;
}

export interface ProjectFundingInterface {
  affiliationName: string;
  affiliationId: string;
  otherAffiliationName: string;
  fundingStatus: ProjectFundingStatus;
  funderGrantId: string;
  funderOpportunityNumber: string;
  funderProjectNumber: string;
}

export interface Author {
  firstInitial: string | null;
  givenName: string | null;
  middleInitial: string | null;
  middleName: string | null;
  surname: string | null;
  full: string | null;
  orcid: string | null;
}

export interface Institution {
  ror: string | null;
  name: string | null;
}

export interface Funder {
  ror: string | null;
  name: string | null;
}

export interface Source {
  name: string;
  url: string;
}

export interface Work {
  doi: string;
  type: WorkType;
  title: string
  publicationDate: Date | null;
  containerTitle: string | null;
  authors: Author[];
  institutions: Institution[];
  funders: Funder[];
  awardIds: string[];
  source: Source;
}

export enum Status {
  Pending = "pending",
  Related = "related",
  Discarded = "discarded",
}

export enum Confidence {
  All = "all",
  High = "high",
  Medium = "medium",
  Low = "low",
}

export enum RelatedWorksSortBy {
  ConfidenceHigh = "confidence-high",
  ConfidenceLow = "confidence-low",
  ReviewedNew = "reviewed-new",
  ReviewedOld = "reviewed-old",
  PublishedNew = "published-new",
  PublishedOld = "published-old",
  DateFoundNew = "date-found-new",
  DateFoundOld = "date-found-old",
}

export enum WorkType {
  Article = "article",
  AudioVisual = "audio-visual",
  Book = "book",
  BookChapter = "book-chapter",
  Collection = "collection",
  DataPaper = "data-paper",
  Dataset = "dataset",
  Dissertation = "dissertation",
  Editorial = "editorial",
  Erratum = "erratum",
  Event = "event",
  Grant = "grant",
  Image = "image",
  InteractiveResource = "interactive-resource",
  Letter = "letter",
  Libguides = "libguides",
  Model = "model",
  Other = "other",
  Paratext = "paratext",
  PeerReview = "peer-review",
  PhysicalObject = "physical-object",
  Preprint = "preprint",
  ReferenceEntry = "reference-entry",
  Report = "report",
  Retraction = "retraction",
  Review = "review",
  Service = "service",
  Software = "software",
  Sound = "sound",
  Standard = "standard",
  SupplementaryMaterials = "supplementary-materials",
  Text = "text",
  Workflow = "workflow",
}

export interface Match {
  doi: boolean;
  title: string | null;
  abstract: string[];
  awardIds: number[];
  authors: number[];
  institutions: number[];
  funders: number[];
}

export interface RelatedWork {
  dmpDoi: string;
  score: number;
  work: Work;
  dateFound: Date;
  dateReviewed: null | Date;
  status: Status;
  match: Match;
}
