import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTimeISO: { input: any; output: any; }
  DmspId: { input: any; output: any; }
  EmailAddress: { input: any; output: any; }
  Orcid: { input: any; output: any; }
  Ror: { input: any; output: any; }
  URL: { input: any; output: any; }
};

/** The status of the funding */
export enum AccessLevel {
  /** Access requests must be reviewed and then permitted */
  Controlled = 'CONTROLLED',
  /** Any other type of access level */
  Other = 'OTHER',
  /** Access to the output will be public/open */
  Unrestricted = 'UNRESTRICTED'
}

export type AddMetadataStandardInput = {
  /** A description of the metadata standard */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Keywords to assist in finding the metadata standard */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the metadata standard */
  name: Scalars['String']['input'];
  /** Research domains associated with the metadata standard */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object) */
  uri?: InputMaybe<Scalars['String']['input']>;
};

export type AddProjectFundingInput = {
  /** The funder URI */
  affiliationId: Scalars['String']['input'];
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project */
  projectId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFundingStatus>;
};

export type AddProjectMemberInput = {
  /** The Member's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The Member's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The Member's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The roles the Member has on the research project */
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The Member's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The research project */
  projectId: Scalars['Int']['input'];
  /** The Member's last/sur name */
  surName?: InputMaybe<Scalars['String']['input']>;
};

export type AddProjectOutputInput = {
  /** The date the output is expected to be deposited (YYYY-MM-DD format) */
  anticipatedReleaseDate?: InputMaybe<Scalars['String']['input']>;
  /** A description of the output */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The initial access level that will be allowed for the output */
  initialAccessLevel?: InputMaybe<Scalars['String']['input']>;
  /** The initial license that will apply to the output */
  initialLicenseId?: InputMaybe<Scalars['Int']['input']>;
  /** Whether or not the output may contain personally identifying information (PII) */
  mayContainPII?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether or not the output may contain sensitive data */
  mayContainSensitiveInformation?: InputMaybe<Scalars['Boolean']['input']>;
  /** The metadata standards that will be used to describe the output */
  metadataStandardIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The type of output */
  outputTypeId: Scalars['Int']['input'];
  /** The id of the project you are adding the output to */
  projectId: Scalars['Int']['input'];
  /** The repositories the output will be deposited in */
  respositoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The title/name of the output */
  title: Scalars['String']['input'];
};

/** Input for adding a new QuestionCondition */
export type AddQuestionConditionInput = {
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: InputMaybe<Scalars['String']['input']>;
  /** The type of condition in which to take the action */
  conditionType: QuestionConditionCondition;
  /** The id of the question that the QuestionCondition belongs to */
  questionId: Scalars['Int']['input'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['input'];
};

export type AddQuestionInput = {
  /** The display order of the question */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** Guidance to complete the question */
  guidanceText?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the Question has had any changes since it was last published */
  isDirty?: InputMaybe<Scalars['Boolean']['input']>;
  /** The JSON representation of the question type */
  json?: InputMaybe<Scalars['String']['input']>;
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** To indicate whether the question is required to be completed */
  required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Requirements associated with the Question */
  requirementText?: InputMaybe<Scalars['String']['input']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: InputMaybe<Scalars['String']['input']>;
  /** The unique id of the Section that the question belongs to */
  sectionId: Scalars['Int']['input'];
  /** The unique id of the Template that the question belongs to */
  templateId: Scalars['Int']['input'];
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AddRepositoryInput = {
  /** A description of the repository */
  description?: InputMaybe<Scalars['String']['input']>;
  /** Keywords to assist in finding the repository */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the repository */
  name: Scalars['String']['input'];
  /** The Categories/Types of the repository */
  repositoryTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Research domains associated with the repository */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object) */
  uri?: InputMaybe<Scalars['String']['input']>;
  /** The website URL */
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Input for adding a new section */
export type AddSectionInput = {
  /** The Section you want to copy from */
  copyFromVersionedSectionId?: InputMaybe<Scalars['Int']['input']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** The guidance to help user with section */
  guidance?: InputMaybe<Scalars['String']['input']>;
  /** The section introduction */
  introduction?: InputMaybe<Scalars['String']['input']>;
  /** The section name */
  name: Scalars['String']['input'];
  /** Requirements that a user must consider in this section */
  requirements?: InputMaybe<Scalars['String']['input']>;
  /** The Tags associated with this section. A section might not have any tags */
  tags?: InputMaybe<Array<TagInput>>;
  /** The id of the template that the section belongs to */
  templateId: Scalars['Int']['input'];
};

/** A respresentation of an institution, organization or company */
export type Affiliation = {
  __typename?: 'Affiliation';
  /** Acronyms for the affiliation */
  acronyms?: Maybe<Array<Scalars['String']['output']>>;
  /** Whether or not the affiliation is active. Inactive records should not appear in typeaheads! */
  active: Scalars['Boolean']['output'];
  /** Alias names for the affiliation */
  aliases?: Maybe<Array<Scalars['String']['output']>>;
  /** The API URL that can be used to search for project/award information */
  apiTarget?: Maybe<Scalars['String']['output']>;
  /** The primary contact email */
  contactEmail?: Maybe<Scalars['String']['output']>;
  /** The primary contact name */
  contactName?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['output'];
  /** Any errors with the Object */
  errors?: Maybe<AffiliationErrors>;
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: Maybe<Array<Scalars['String']['output']>>;
  /** Whether or not the affiliation wants to use the feedback workflow */
  feedbackEnabled: Scalars['Boolean']['output'];
  /** The message to display to users when they request feedback */
  feedbackMessage?: Maybe<Scalars['String']['output']>;
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The Crossref Funder id */
  fundrefId?: Maybe<Scalars['String']['output']>;
  /** The official homepage for the affiliation */
  homepage?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (assigned by the Database) */
  id?: Maybe<Scalars['Int']['output']>;
  /** The logo file name */
  logoName?: Maybe<Scalars['String']['output']>;
  /** The URI of the logo */
  logoURI?: Maybe<Scalars['String']['output']>;
  /** Whether or not the affiliation is allowed to have administrators */
  managed: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['output'];
  /** The system the affiliation's data came from (e.g. ROR, DMPTool, etc.) */
  provenance: Scalars['String']['output'];
  /** The combined name, homepage, aliases and acronyms to facilitate search */
  searchName: Scalars['String']['output'];
  /** The email domains associated with the affiliation (for SSO) */
  ssoEmailDomains?: Maybe<Array<AffiliationEmailDomain>>;
  /** The SSO entityId */
  ssoEntityId?: Maybe<Scalars['String']['output']>;
  /** The links the affiliation's users can use to get help */
  subHeaderLinks?: Maybe<Array<AffiliationLink>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types: Array<AffiliationType>;
  /** The properties of this object that are NOT editable. Determined by the record's provenance */
  uneditableProperties: Array<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (assigned by the provenance e.g. https://ror.org/12345) */
  uri: Scalars['String']['output'];
};

/** Email domains linked to the affiliation for purposes of determining if SSO is applicable */
export type AffiliationEmailDomain = {
  __typename?: 'AffiliationEmailDomain';
  /** The email domain (e.g. example.com, law.example.com, etc.) */
  domain: Scalars['String']['output'];
  /** Unique identifier for the email domain */
  id: Scalars['Int']['output'];
};

/** Input for email domains linked to the affiliation for purposes of determining if SSO is applicable */
export type AffiliationEmailDomainInput = {
  /** The email domain (e.g. example.com, law.example.com, etc.) */
  domain: Scalars['String']['input'];
  /** Unique identifier for the email domain */
  id: Scalars['Int']['input'];
};

/** A collection of errors related to the Answer */
export type AffiliationErrors = {
  __typename?: 'AffiliationErrors';
  acronyms?: Maybe<Scalars['String']['output']>;
  aliases?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactName?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  feedbackEmails?: Maybe<Scalars['String']['output']>;
  feedbackMessage?: Maybe<Scalars['String']['output']>;
  fundrefId?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  homepage?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  logoName?: Maybe<Scalars['String']['output']>;
  logoURI?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  provenance?: Maybe<Scalars['String']['output']>;
  searchName?: Maybe<Scalars['String']['output']>;
  ssoEntityId?: Maybe<Scalars['String']['output']>;
  subHeaderLinks?: Maybe<Scalars['String']['output']>;
  types?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  versionedQuestionId?: Maybe<Scalars['String']['output']>;
  versionedSectionId?: Maybe<Scalars['String']['output']>;
};

/** Input options for adding an Affiliation */
export type AffiliationInput = {
  /** Acronyms for the affiliation */
  acronyms?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether or not the Affiliation is active and available in search results */
  active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Alias names for the affiliation */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The primary contact email */
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  /** The primary contact name */
  contactName?: InputMaybe<Scalars['String']['input']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName?: InputMaybe<Scalars['String']['input']>;
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Whether or not the affiliation wants to use the feedback workflow */
  feedbackEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** The message to display to users when they request feedback */
  feedbackMessage?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not this affiliation is a funder */
  funder?: InputMaybe<Scalars['Boolean']['input']>;
  /** The Crossref Funder id */
  fundrefId?: InputMaybe<Scalars['String']['input']>;
  /** The official homepage for the affiliation */
  homepage?: InputMaybe<Scalars['String']['input']>;
  /** The id of the affiliation */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The logo file name */
  logoName?: InputMaybe<Scalars['String']['input']>;
  /** The URI of the logo */
  logoURI?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the affiliation is allowed to have administrators */
  managed?: InputMaybe<Scalars['Boolean']['input']>;
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['input'];
  /** The email domains associated with the affiliation (for SSO) */
  ssoEmailDomains?: InputMaybe<Array<AffiliationEmailDomainInput>>;
  /** The SSO entityId */
  ssoEntityId?: InputMaybe<Scalars['String']['input']>;
  /** The links the affiliation's users can use to get help */
  subHeaderLinks?: InputMaybe<Array<AffiliationLinkInput>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types?: InputMaybe<Array<AffiliationType>>;
  /** The unique identifer for the affiliation (Not editable!) */
  uri?: InputMaybe<Scalars['String']['input']>;
};

/** A hyperlink displayed in the sub-header of the UI for the afiliation's users */
export type AffiliationLink = {
  __typename?: 'AffiliationLink';
  /** Unique identifier for the link */
  id: Scalars['Int']['output'];
  /** The text to display (e.g. Helpdesk, Grants Office, etc.) */
  text?: Maybe<Scalars['String']['output']>;
  /** The URL */
  url: Scalars['String']['output'];
};

/** Input for a hyperlink displayed in the sub-header of the UI for the afiliation's users */
export type AffiliationLinkInput = {
  /** Unique identifier for the link */
  id: Scalars['Int']['input'];
  /** The text to display (e.g. Helpdesk, Grants Office, etc.) */
  text?: InputMaybe<Scalars['String']['input']>;
  /** The URL */
  url: Scalars['String']['input'];
};

/** The provenance of an Affiliation record */
export enum AffiliationProvenance {
  /** Created and managed within the DMPTool */
  Dmptool = 'DMPTOOL',
  /** Created and managed by the Research Organization Registry (ROR) https://ror.org */
  Ror = 'ROR'
}

/** Search result - An abbreviated version of an Affiliation */
export type AffiliationSearch = {
  __typename?: 'AffiliationSearch';
  /** Has an API that be used to search for project/award information */
  apiTarget?: Maybe<Scalars['String']['output']>;
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The unique identifer for the affiliation */
  id: Scalars['Int']['output'];
  /** The categories the Affiliation belongs to */
  types?: Maybe<Array<AffiliationType>>;
  /** The URI of the affiliation (typically the ROR id) */
  uri: Scalars['String']['output'];
};

export type AffiliationSearchResults = PaginatedQueryResults & {
  __typename?: 'AffiliationSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<AffiliationSearch>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Categories for Affiliation */
export enum AffiliationType {
  Archive = 'ARCHIVE',
  Company = 'COMPANY',
  Education = 'EDUCATION',
  Facility = 'FACILITY',
  Government = 'GOVERNMENT',
  Healthcare = 'HEALTHCARE',
  Nonprofit = 'NONPROFIT',
  Other = 'OTHER'
}

/** An answer to a question on a Data Managament Plan (DMP) */
export type Answer = {
  __typename?: 'Answer';
  /** The comments associated with the answer */
  comments?: Maybe<Array<AnswerComment>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<AffiliationErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The answer to the question */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The DMP that the answer belongs to */
  plan?: Maybe<Plan>;
  /** The question in the template the answer is for */
  versionedQuestion?: Maybe<VersionedQuestion>;
  /** The question in the template the answer is for */
  versionedSection?: Maybe<VersionedSection>;
};

export type AnswerComment = {
  __typename?: 'AnswerComment';
  /** The answer the comment is associated with */
  answerId: Scalars['Int']['output'];
  /** The comment */
  commentText: Scalars['String']['output'];
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<AnswerCommentErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
};

/** A collection of errors related to the Answer Comment */
export type AnswerCommentErrors = {
  __typename?: 'AnswerCommentErrors';
  answerId?: Maybe<Scalars['String']['output']>;
  commentText?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
};

/** The result of the findCollaborator query */
export type CollaboratorSearchResult = {
  __typename?: 'CollaboratorSearchResult';
  /** The collaborator's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The collaborator's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The collaborator's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

export type ExternalFunding = {
  __typename?: 'ExternalFunding';
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: Maybe<Scalars['String']['output']>;
};

export type ExternalMember = {
  __typename?: 'ExternalMember';
  /** The ROR ID of the member's institution */
  affiliationId?: Maybe<Scalars['String']['output']>;
  /** The member's email address */
  email?: Maybe<Scalars['String']['output']>;
  /** The member's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The member's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The member's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

/** External Project type */
export type ExternalProject = {
  __typename?: 'ExternalProject';
  /** The project description */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** The project end date */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Funding information for this project */
  fundings?: Maybe<Array<ExternalFunding>>;
  /** Member information for this project */
  members?: Maybe<Array<ExternalMember>>;
  /** The project start date */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The project title */
  title?: Maybe<Scalars['String']['output']>;
};

export type ExternalSearchInput = {
  /** The URI of the funder we are using to search for projects */
  affiliationId: Scalars['String']['input'];
  /** The funder award/grant id/url (optional) */
  awardId?: InputMaybe<Scalars['String']['input']>;
  /** The funder award/grant name (optional) */
  awardName?: InputMaybe<Scalars['String']['input']>;
  /** The funder award/grant year (optional) as YYYY */
  awardYear?: InputMaybe<Scalars['String']['input']>;
  /** The principal investigator names (optional) can be any combination of first/middle/last names */
  piNames?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** A result of the most popular funders */
export type FunderPopularityResult = {
  __typename?: 'FunderPopularityResult';
  /** The apiTarget for the affiliation (if available) */
  apiTarget?: Maybe<Scalars['String']['output']>;
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** The unique identifer for the affiliation */
  id: Scalars['Int']['output'];
  /** The number of plans associated with this funder in the past year */
  nbrPlans: Scalars['Int']['output'];
  /** The URI of the affiliation (typically the ROR id) */
  uri: Scalars['String']['output'];
};

/** Output type for the initializePlanVersion mutation */
export type InitializePlanVersionOutput = {
  __typename?: 'InitializePlanVersionOutput';
  /** The number of PlanVersion records that were created */
  count: Scalars['Int']['output'];
  /** The ids of the Plans that were processed */
  planIds?: Maybe<Array<Scalars['Int']['output']>>;
};

/** The types of object a User can be invited to Collaborate on */
export enum InvitedToType {
  Plan = 'PLAN',
  Template = 'TEMPLATE'
}

/** A Language supported by the system */
export type Language = {
  __typename?: 'Language';
  /** The unique identifer for the Language using the 2 character (ISO 639-1) language code and optionally the 2 character (ISO 3166-1) country code */
  id: Scalars['String']['output'];
  /** Whether or not the language is the default */
  isDefault: Scalars['Boolean']['output'];
  /** A displayable name for the language */
  name: Scalars['String']['output'];
};

/** A license associated with a research output (e.g. CC0, MIT, etc.) */
export type License = {
  __typename?: 'License';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the license */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<LicenseErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the license */
  name: Scalars['String']['output'];
  /** Whether or not the license is recommended */
  recommended: Scalars['Boolean']['output'];
  /** The taxonomy URL of the license */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the License */
export type LicenseErrors = {
  __typename?: 'LicenseErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type LicenseSearchResults = PaginatedQueryResults & {
  __typename?: 'LicenseSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<License>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type MemberRole = {
  __typename?: 'MemberRole';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A longer description of the member role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  /** The order in which to display these items when displayed in the UI */
  displayOrder: Scalars['Int']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<MemberRoleErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The Ui label to display for the member role */
  label: Scalars['String']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The taxonomy URL for the member role */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the member role */
export type MemberRoleErrors = {
  __typename?: 'MemberRoleErrors';
  description?: Maybe<Scalars['String']['output']>;
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

/** A metadata standard used when describing a research output */
export type MetadataStandard = {
  __typename?: 'MetadataStandard';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the metadata standard */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<MetadataStandardErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Keywords to assist in finding the metadata standard */
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the metadata standard */
  name: Scalars['String']['output'];
  /** Research domains associated with the metadata standard */
  researchDomains?: Maybe<Array<ResearchDomain>>;
  /** The taxonomy URL of the metadata standard */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the MetadataStandard */
export type MetadataStandardErrors = {
  __typename?: 'MetadataStandardErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  keywords?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  researchDomainIds?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type MetadataStandardSearchResults = PaginatedQueryResults & {
  __typename?: 'MetadataStandardSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<MetadataStandard>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Reactivate the specified user Account (Admin only) */
  activateUser?: Maybe<User>;
  /** Create a new Affiliation */
  addAffiliation?: Maybe<Affiliation>;
  /** Answer a question */
  addAnswer?: Maybe<Answer>;
  /** Add a comment to an answer within a round of feedback */
  addFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Add a new License (don't make the URI up! should resolve to an taxonomy HTML/JSON representation of the object) */
  addLicense?: Maybe<License>;
  /** Add a new member role (URL and label must be unique!) */
  addMemberRole?: Maybe<MemberRole>;
  /** Add a new MetadataStandard */
  addMetadataStandard?: Maybe<MetadataStandard>;
  /** Create a plan */
  addPlan?: Maybe<Plan>;
  /** Add a Funding information to a Plan */
  addPlanFunding?: Maybe<PlanFunding>;
  /** Add a Member to a Plan */
  addPlanMember?: Maybe<PlanMember>;
  /** Create a project */
  addProject?: Maybe<Project>;
  /** Add a collaborator to a Plan */
  addProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Add Funding information to a research project */
  addProjectFunding?: Maybe<ProjectFunding>;
  /** Add a Member to a research project */
  addProjectMember?: Maybe<ProjectMember>;
  /** Add an output to a research project */
  addProjectOutput?: Maybe<ProjectOutput>;
  /** Create a new Question */
  addQuestion: Question;
  /** Create a new QuestionCondition associated with a question */
  addQuestionCondition: QuestionCondition;
  /** Add a new Repository */
  addRepository?: Maybe<Repository>;
  /** Create a new Section. Leave the 'copyFromVersionedSectionId' blank to create a new section from scratch */
  addSection: Section;
  /** Add a new tag to available list of tags */
  addTag?: Maybe<Tag>;
  /** Create a new Template. Leave the 'copyFromTemplateId' blank to create a new template from scratch */
  addTemplate?: Maybe<Template>;
  /** Add a collaborator to a Template */
  addTemplateCollaborator?: Maybe<TemplateCollaborator>;
  /** Add an email address for the current user */
  addUserEmail?: Maybe<UserEmail>;
  /** Archive a plan */
  archivePlan?: Maybe<Plan>;
  /** Download the plan */
  archiveProject?: Maybe<Project>;
  /** Archive a Template (unpublishes any associated PublishedTemplate */
  archiveTemplate?: Maybe<Template>;
  /** Mark the feedback round as complete */
  completeFeedback?: Maybe<PlanFeedback>;
  /** Publish the template or save as a draft */
  createTemplateVersion?: Maybe<Template>;
  /** Deactivate the specified user Account (Admin only) */
  deactivateUser?: Maybe<User>;
  /** Merge two licenses */
  mergeLicenses?: Maybe<License>;
  /** Merge two metadata standards */
  mergeMetadataStandards?: Maybe<MetadataStandard>;
  /** Merge two repositories */
  mergeRepositories?: Maybe<Repository>;
  /** Merge the 2 user accounts (Admin only) */
  mergeUsers?: Maybe<User>;
  /** Import a project from an external source */
  projectImport?: Maybe<Project>;
  /** Publish a plan (changes status to PUBLISHED) */
  publishPlan?: Maybe<Plan>;
  /** Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL) */
  removeAffiliation?: Maybe<Affiliation>;
  /** Remove a comment to an answer within a round of feedback */
  removeFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Delete a License */
  removeLicense?: Maybe<License>;
  /** Delete the member role */
  removeMemberRole?: Maybe<MemberRole>;
  /** Delete a MetadataStandard */
  removeMetadataStandard?: Maybe<MetadataStandard>;
  /** Remove a Funding from a Plan */
  removePlanFunding?: Maybe<PlanFunding>;
  /** Remove a PlanMember from a Plan */
  removePlanMember?: Maybe<PlanMember>;
  /** Remove a ProjectCollaborator from a Plan */
  removeProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Remove Funding from the research project */
  removeProjectFunding?: Maybe<ProjectFunding>;
  /** Remove a research project Member */
  removeProjectMember?: Maybe<ProjectMember>;
  /** Remove a research project output */
  removeProjectOutput?: Maybe<ProjectOutput>;
  /** Remove an Output from a Plan */
  removeProjectOutputFromPlan?: Maybe<ProjectOutput>;
  /** Delete a Question */
  removeQuestion?: Maybe<Question>;
  /** Remove a QuestionCondition using a specific QuestionCondition id */
  removeQuestionCondition?: Maybe<QuestionCondition>;
  /** Delete a Repository */
  removeRepository?: Maybe<Repository>;
  /** Delete a section */
  removeSection: Section;
  /** Delete a tag */
  removeTag?: Maybe<Tag>;
  /** Remove a TemplateCollaborator from a Template */
  removeTemplateCollaborator?: Maybe<TemplateCollaborator>;
  /** Anonymize the current user's account (essentially deletes their account without orphaning things) */
  removeUser?: Maybe<User>;
  /** Remove an email address from the current user */
  removeUserEmail?: Maybe<UserEmail>;
  /** Request a round of admin feedback */
  requestFeedback?: Maybe<PlanFeedback>;
  /** Add an Output to a Plan */
  selectProjectOutputForPlan?: Maybe<ProjectOutput>;
  /** Designate the email as the current user's primary email address */
  setPrimaryUserEmail?: Maybe<Array<Maybe<UserEmail>>>;
  /** Set the user's ORCID */
  setUserOrcid?: Maybe<User>;
  /** Initialize an PLanVersion record in the DynamoDB for all Plans that do not have one */
  superInitializePlanVersions: InitializePlanVersionOutput;
  /** Update an Affiliation */
  updateAffiliation?: Maybe<Affiliation>;
  /** Edit an answer */
  updateAnswer?: Maybe<Answer>;
  /** Update a License record */
  updateLicense?: Maybe<License>;
  /** Update the member role */
  updateMemberRole?: Maybe<MemberRole>;
  /** Update a MetadataStandard record */
  updateMetadataStandard?: Maybe<MetadataStandard>;
  /** Change the current user's password */
  updatePassword?: Maybe<User>;
  /** Update multiple Plan Fundings passing in an array of projectFundingIds */
  updatePlanFunding?: Maybe<Array<Maybe<PlanFunding>>>;
  /** Chnage a Member's accessLevel on a Plan */
  updatePlanMember?: Maybe<PlanMember>;
  /** Change the plan's status */
  updatePlanStatus?: Maybe<Plan>;
  /** Change the plan's title */
  updatePlanTitle?: Maybe<Plan>;
  /** Edit a project */
  updateProject?: Maybe<Project>;
  /** Change a collaborator's accessLevel on a Plan */
  updateProjectCollaborator?: Maybe<ProjectCollaborator>;
  /** Update Funding information on the research project */
  updateProjectFunding?: Maybe<ProjectFunding>;
  /** Update a Member on the research project */
  updateProjectMember?: Maybe<ProjectMember>;
  /** Update an output on the research project */
  updateProjectOutput?: Maybe<ProjectOutput>;
  /** Update a Question */
  updateQuestion: Question;
  /** Update a QuestionCondition for a specific QuestionCondition id */
  updateQuestionCondition?: Maybe<QuestionCondition>;
  /** Change the question's display order */
  updateQuestionDisplayOrder: ReorderQuestionsResult;
  /** Update a Repository record */
  updateRepository?: Maybe<Repository>;
  /** Update a Section */
  updateSection: Section;
  /** Change the section's display order */
  updateSectionDisplayOrder: ReorderSectionsResult;
  /** Update a tag */
  updateTag?: Maybe<Tag>;
  /** Update a Template */
  updateTemplate?: Maybe<Template>;
  /** Update the current user's email notifications */
  updateUserNotifications?: Maybe<User>;
  /** Update the current user's information */
  updateUserProfile?: Maybe<User>;
  /** Upload a plan */
  uploadPlan?: Maybe<Plan>;
};


export type MutationActivateUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationAddAffiliationArgs = {
  input: AffiliationInput;
};


export type MutationAddAnswerArgs = {
  json?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type MutationAddFeedbackCommentArgs = {
  answerId: Scalars['Int']['input'];
  commentText: Scalars['String']['input'];
  planFeedbackId: Scalars['Int']['input'];
};


export type MutationAddLicenseArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recommended?: InputMaybe<Scalars['Boolean']['input']>;
  uri?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddMemberRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationAddMetadataStandardArgs = {
  input: AddMetadataStandardInput;
};


export type MutationAddPlanArgs = {
  projectId: Scalars['Int']['input'];
  versionedTemplateId: Scalars['Int']['input'];
};


export type MutationAddPlanFundingArgs = {
  planId: Scalars['Int']['input'];
  projectFundingId: Scalars['Int']['input'];
};


export type MutationAddPlanMemberArgs = {
  planId: Scalars['Int']['input'];
  projectMemberId: Scalars['Int']['input'];
  roleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type MutationAddProjectArgs = {
  isTestProject?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};


export type MutationAddProjectCollaboratorArgs = {
  accessLevel?: InputMaybe<ProjectCollaboratorAccessLevel>;
  email: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
};


export type MutationAddProjectFundingArgs = {
  input: AddProjectFundingInput;
};


export type MutationAddProjectMemberArgs = {
  input: AddProjectMemberInput;
};


export type MutationAddProjectOutputArgs = {
  input: AddProjectOutputInput;
};


export type MutationAddQuestionArgs = {
  input: AddQuestionInput;
};


export type MutationAddQuestionConditionArgs = {
  input: AddQuestionConditionInput;
};


export type MutationAddRepositoryArgs = {
  input?: InputMaybe<AddRepositoryInput>;
};


export type MutationAddSectionArgs = {
  input: AddSectionInput;
};


export type MutationAddTagArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationAddTemplateArgs = {
  copyFromTemplateId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};


export type MutationAddTemplateCollaboratorArgs = {
  email: Scalars['String']['input'];
  templateId: Scalars['Int']['input'];
};


export type MutationAddUserEmailArgs = {
  email: Scalars['String']['input'];
  isPrimary: Scalars['Boolean']['input'];
};


export type MutationArchivePlanArgs = {
  planId: Scalars['Int']['input'];
};


export type MutationArchiveProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationArchiveTemplateArgs = {
  templateId: Scalars['Int']['input'];
};


export type MutationCompleteFeedbackArgs = {
  planFeedbackId: Scalars['Int']['input'];
  summaryText?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateTemplateVersionArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  templateId: Scalars['Int']['input'];
  versionType?: InputMaybe<TemplateVersionType>;
  visibility: TemplateVisibility;
};


export type MutationDeactivateUserArgs = {
  userId: Scalars['Int']['input'];
};


export type MutationMergeLicensesArgs = {
  licenseToKeepId: Scalars['Int']['input'];
  licenseToRemoveId: Scalars['Int']['input'];
};


export type MutationMergeMetadataStandardsArgs = {
  metadataStandardToKeepId: Scalars['Int']['input'];
  metadataStandardToRemoveId: Scalars['Int']['input'];
};


export type MutationMergeRepositoriesArgs = {
  repositoryToKeepId: Scalars['Int']['input'];
  repositoryToRemoveId: Scalars['Int']['input'];
};


export type MutationMergeUsersArgs = {
  userIdToBeMerged: Scalars['Int']['input'];
  userIdToKeep: Scalars['Int']['input'];
};


export type MutationProjectImportArgs = {
  input?: InputMaybe<ProjectImportInput>;
};


export type MutationPublishPlanArgs = {
  planId: Scalars['Int']['input'];
  visibility?: InputMaybe<PlanVisibility>;
};


export type MutationRemoveAffiliationArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type MutationRemoveFeedbackCommentArgs = {
  PlanFeedbackCommentId: Scalars['Int']['input'];
};


export type MutationRemoveLicenseArgs = {
  uri: Scalars['String']['input'];
};


export type MutationRemoveMemberRoleArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveMetadataStandardArgs = {
  uri: Scalars['String']['input'];
};


export type MutationRemovePlanFundingArgs = {
  planFundingId: Scalars['Int']['input'];
};


export type MutationRemovePlanMemberArgs = {
  planMemberId: Scalars['Int']['input'];
};


export type MutationRemoveProjectCollaboratorArgs = {
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectFundingArgs = {
  projectFundingId: Scalars['Int']['input'];
};


export type MutationRemoveProjectMemberArgs = {
  projectMemberId: Scalars['Int']['input'];
};


export type MutationRemoveProjectOutputArgs = {
  projectOutputId: Scalars['Int']['input'];
};


export type MutationRemoveProjectOutputFromPlanArgs = {
  planId: Scalars['Int']['input'];
  projectOutputId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionConditionArgs = {
  questionConditionId: Scalars['Int']['input'];
};


export type MutationRemoveRepositoryArgs = {
  repositoryId: Scalars['Int']['input'];
};


export type MutationRemoveSectionArgs = {
  sectionId: Scalars['Int']['input'];
};


export type MutationRemoveTagArgs = {
  tagId: Scalars['Int']['input'];
};


export type MutationRemoveTemplateCollaboratorArgs = {
  email: Scalars['String']['input'];
  templateId: Scalars['Int']['input'];
};


export type MutationRemoveUserEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationRequestFeedbackArgs = {
  planId: Scalars['Int']['input'];
};


export type MutationSelectProjectOutputForPlanArgs = {
  planId: Scalars['Int']['input'];
  projectOutputId: Scalars['Int']['input'];
};


export type MutationSetPrimaryUserEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationSetUserOrcidArgs = {
  orcid: Scalars['String']['input'];
};


export type MutationUpdateAffiliationArgs = {
  input: AffiliationInput;
};


export type MutationUpdateAnswerArgs = {
  answerId: Scalars['Int']['input'];
  json?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateLicenseArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  recommended?: InputMaybe<Scalars['Boolean']['input']>;
  uri: Scalars['String']['input'];
};


export type MutationUpdateMemberRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationUpdateMetadataStandardArgs = {
  input: UpdateMetadataStandardInput;
};


export type MutationUpdatePasswordArgs = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationUpdatePlanFundingArgs = {
  planId: Scalars['Int']['input'];
  projectFundingIds: Array<Scalars['Int']['input']>;
};


export type MutationUpdatePlanMemberArgs = {
  isPrimaryContact?: InputMaybe<Scalars['Boolean']['input']>;
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  planId: Scalars['Int']['input'];
  planMemberId: Scalars['Int']['input'];
};


export type MutationUpdatePlanStatusArgs = {
  planId: Scalars['Int']['input'];
  status: PlanStatus;
};


export type MutationUpdatePlanTitleArgs = {
  planId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};


export type MutationUpdateProjectArgs = {
  input?: InputMaybe<UpdateProjectInput>;
};


export type MutationUpdateProjectCollaboratorArgs = {
  accessLevel: ProjectCollaboratorAccessLevel;
  projectCollaboratorId: Scalars['Int']['input'];
};


export type MutationUpdateProjectFundingArgs = {
  input: UpdateProjectFundingInput;
};


export type MutationUpdateProjectMemberArgs = {
  input: UpdateProjectMemberInput;
};


export type MutationUpdateProjectOutputArgs = {
  input: UpdateProjectOutputInput;
};


export type MutationUpdateQuestionArgs = {
  input: UpdateQuestionInput;
};


export type MutationUpdateQuestionConditionArgs = {
  input: UpdateQuestionConditionInput;
};


export type MutationUpdateQuestionDisplayOrderArgs = {
  newDisplayOrder: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};


export type MutationUpdateRepositoryArgs = {
  input?: InputMaybe<UpdateRepositoryInput>;
};


export type MutationUpdateSectionArgs = {
  input: UpdateSectionInput;
};


export type MutationUpdateSectionDisplayOrderArgs = {
  newDisplayOrder: Scalars['Int']['input'];
  sectionId: Scalars['Int']['input'];
};


export type MutationUpdateTagArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  tagId: Scalars['Int']['input'];
};


export type MutationUpdateTemplateArgs = {
  bestPractice?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  templateId: Scalars['Int']['input'];
  visibility: TemplateVisibility;
};


export type MutationUpdateUserNotificationsArgs = {
  input: UpdateUserNotificationsInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUploadPlanArgs = {
  fileContent?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['Int']['input'];
};

/** An output collected/produced during or as a result of a research project */
export type OutputType = {
  __typename?: 'OutputType';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the type of output to be collected/generated during the project */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<OutputTypeErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the output type */
  name: Scalars['String']['output'];
  /** The taxonomy URL of the output type */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the OutputType */
export type OutputTypeErrors = {
  __typename?: 'OutputTypeErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type PaginatedQueryResults = {
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination only!) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page (standard offset pagination only!) */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more only!) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Pagination options, either cursor-based (inifite-scroll) or offset-based pagination (standard first, next, etc.) */
export type PaginationOptions = {
  /** The cursor to start the pagination from (used for cursor infinite scroll/load more only!) */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /** The number of items to return */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** The number of items to skip before starting the pagination (used for standard offset pagination only!) */
  offset?: InputMaybe<Scalars['Int']['input']>;
  /** The sort order (used for standard offset pagination only!) */
  sortDir?: InputMaybe<Scalars['String']['input']>;
  /** The sort field (used for standard offset pagination only!) */
  sortField?: InputMaybe<Scalars['String']['input']>;
  /** The type of pagination to use (cursor or offset) */
  type?: InputMaybe<Scalars['String']['input']>;
};

export enum PaginationType {
  /** Cursor-based pagination (infinite scroll/load more) */
  Cursor = 'CURSOR',
  /** Standard pagination using offsets (first, next, previous, last) */
  Offset = 'OFFSET'
}

/** A Data Managament Plan (DMP) */
export type Plan = {
  __typename?: 'Plan';
  answers?: Maybe<Array<Answer>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The DMP ID/DOI for the plan */
  dmpId?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanErrors>;
  /** Whether or not the plan is featured on the public plans page */
  featured?: Maybe<Scalars['Boolean']['output']>;
  /** The funding for the plan */
  fundings?: Maybe<Array<PlanFunding>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The language of the plan */
  languageId?: Maybe<Scalars['String']['output']>;
  /** The members for the plan */
  members?: Maybe<Array<PlanMember>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Anticipated research outputs */
  outputs?: Maybe<Array<PlanOutput>>;
  /** The project the plan is associated with */
  project?: Maybe<Project>;
  /** The timestamp for when the Plan was registered */
  registered?: Maybe<Scalars['String']['output']>;
  /** The individual who registered the plan */
  registeredById?: Maybe<Scalars['Int']['output']>;
  /** The status/state of the plan */
  status?: Maybe<PlanStatus>;
  /** The title of the plan */
  title?: Maybe<Scalars['String']['output']>;
  /** The section search results */
  versionedSections?: Maybe<Array<PlanSectionProgress>>;
  /** The template the plan is based on */
  versionedTemplate?: Maybe<VersionedTemplate>;
  /** Prior versions of the plan */
  versions?: Maybe<Array<PlanVersion>>;
  /** The visibility/privacy setting for the plan */
  visibility?: Maybe<PlanVisibility>;
};

export enum PlanDownloadFormat {
  Csv = 'CSV',
  Docx = 'DOCX',
  Html = 'HTML',
  Json = 'JSON',
  Pdf = 'PDF',
  Text = 'TEXT'
}

/** The error messages for the plan */
export type PlanErrors = {
  __typename?: 'PlanErrors';
  dmp_id?: Maybe<Scalars['String']['output']>;
  featured?: Maybe<Scalars['String']['output']>;
  general?: Maybe<Scalars['String']['output']>;
  languageId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  registered?: Maybe<Scalars['String']['output']>;
  registeredById?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** A round of administrative feedback for a Data Managament Plan (DMP) */
export type PlanFeedback = {
  __typename?: 'PlanFeedback';
  /** An overall summary that can be sent to the user upon completion */
  adminSummary?: Maybe<Scalars['String']['output']>;
  /** The timestamp that the feedback was marked as complete */
  completed?: Maybe<Scalars['String']['output']>;
  /** The admin who completed the feedback round */
  completedBy?: Maybe<User>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFeedbackErrors>;
  /** The specific contextual commentary */
  feedbackComments?: Maybe<Array<PlanFeedbackComment>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan the user wants feedback on */
  plan: Plan;
  /** The timestamp of when the user requested the feedback */
  requested: Scalars['String']['output'];
  /** The user who requested the round of feedback */
  requestedBy: User;
};

export type PlanFeedbackComment = {
  __typename?: 'PlanFeedbackComment';
  /** The round of plan feedback the comment belongs to */
  PlanFeedback?: Maybe<PlanFeedback>;
  /** The answer the comment is related to */
  answer?: Maybe<Answer>;
  /** The comment */
  comment?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFeedbackCommentErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
};

/** A collection of errors related to the PlanFeedbackComment */
export type PlanFeedbackCommentErrors = {
  __typename?: 'PlanFeedbackCommentErrors';
  answer?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planFeedback?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the PlanFeedback */
export type PlanFeedbackErrors = {
  __typename?: 'PlanFeedbackErrors';
  adminSummary?: Maybe<Scalars['String']['output']>;
  completedById?: Maybe<Scalars['String']['output']>;
  feedbackComments?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  requestedById?: Maybe<Scalars['String']['output']>;
};

/** Funding associated with a plan */
export type PlanFunding = {
  __typename?: 'PlanFunding';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanFundingErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan that is seeking (or has aquired) funding */
  plan?: Maybe<Plan>;
  /** The project funder */
  projectFunding?: Maybe<ProjectFunding>;
};

/** A collection of errors related to the PlanFunding */
export type PlanFundingErrors = {
  __typename?: 'PlanFundingErrors';
  ProjectFundingId?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
};

/** A Member associated with a plan */
export type PlanMember = {
  __typename?: 'PlanMember';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanMemberErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Member the primary contact for the Plan */
  isPrimaryContact?: Maybe<Scalars['Boolean']['output']>;
  /** The roles associated with the Member */
  memberRoles?: Maybe<Array<MemberRole>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan that the Member is associated with */
  plan?: Maybe<Plan>;
  /** The project Member */
  projectMember?: Maybe<ProjectMember>;
};

/** A collection of errors related to the PlanMember */
export type PlanMemberErrors = {
  __typename?: 'PlanMemberErrors';
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  /** The roles associated with the Member */
  memberRoleIds?: Maybe<Scalars['String']['output']>;
  /** The isPrimaryContact flag */
  primaryContact?: Maybe<Scalars['String']['output']>;
  /** The project that the Member is associated with */
  projectId?: Maybe<Scalars['String']['output']>;
  /** The project Member */
  projectMemberId?: Maybe<Scalars['String']['output']>;
};

export type PlanOutput = {
  __typename?: 'PlanOutput';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<PlanOutputErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
};

/** A collection of errors related to the PlanOutput */
export type PlanOutputErrors = {
  __typename?: 'PlanOutputErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
};

export type PlanSearchResult = {
  __typename?: 'PlanSearchResult';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdBy?: Maybe<Scalars['String']['output']>;
  /** The DMP ID/DOI for the plan */
  dmpId?: Maybe<Scalars['String']['output']>;
  /** The funding information for the plan */
  funding?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The names of the members */
  members?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedBy?: Maybe<Scalars['String']['output']>;
  /** The timestamp for when the Plan was registered/published */
  registered?: Maybe<Scalars['String']['output']>;
  /** The person who published/registered the plan */
  registeredBy?: Maybe<Scalars['String']['output']>;
  /** The current status of the plan */
  status?: Maybe<PlanStatus>;
  /** The name of the template the plan is based on */
  templateTitle?: Maybe<Scalars['String']['output']>;
  /** The title of the plan */
  title?: Maybe<Scalars['String']['output']>;
  /** The section search results */
  versionedSections?: Maybe<Array<PlanSectionProgress>>;
  /** The visibility/permission setting */
  visibility?: Maybe<PlanVisibility>;
};

/** The progress the user has made within a section of the plan */
export type PlanSectionProgress = {
  __typename?: 'PlanSectionProgress';
  /** The number of questions the user has answered */
  answeredQuestions: Scalars['Int']['output'];
  /** The display order of the section */
  displayOrder: Scalars['Int']['output'];
  /** The title of the section */
  title: Scalars['String']['output'];
  /** The number of questions in the section */
  totalQuestions: Scalars['Int']['output'];
  /** The id of the Section */
  versionedSectionId: Scalars['Int']['output'];
};

/** The status/state of the plan */
export enum PlanStatus {
  /** The Plan has been archived */
  Archived = 'ARCHIVED',
  /** The Plan is ready for submission or download */
  Complete = 'COMPLETE',
  /** The Plan is still being written and reviewed */
  Draft = 'DRAFT'
}

/** A version of the plan */
export type PlanVersion = {
  __typename?: 'PlanVersion';
  /** The timestamp of the version, equates to the plan's modified date */
  timestamp?: Maybe<Scalars['String']['output']>;
  /** The DMPHub URL for the version */
  url?: Maybe<Scalars['String']['output']>;
};

/** The visibility/privacy setting for the plan */
export enum PlanVisibility {
  /** Visible only to people at the user's (or editor's) affiliation */
  Organizational = 'ORGANIZATIONAL',
  /** Visible only to people who have been invited to collaborate (or provide feedback) */
  Private = 'PRIVATE',
  /** Visible to anyone */
  Public = 'PUBLIC'
}

/** DMP Tool Project type */
export type Project = {
  __typename?: 'Project';
  /** The research project abstract */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** People who have access to modify or comment on the Project */
  collaborators?: Maybe<Array<ProjectCollaborator>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The estimated date the research project will end (use YYYY-MM-DD format) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectErrors>;
  /** The funders who are supporting the research project */
  fundings?: Maybe<Array<ProjectFunding>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is test/mock research project */
  isTestProject?: Maybe<Scalars['Boolean']['output']>;
  /** People who are contributing to the research project (not just the DMP) */
  members?: Maybe<Array<ProjectMember>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The outputs that will be/were created as a reult of the research project */
  outputs?: Maybe<Array<ProjectOutput>>;
  /** The plans that are associated with the research project */
  plans?: Maybe<Array<PlanSearchResult>>;
  /** The type of research being done */
  researchDomain?: Maybe<ResearchDomain>;
  /** The estimated date the research project will begin (use YYYY-MM-DD format) */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The name/title of the research project */
  title: Scalars['String']['output'];
};

/** A user that that belongs to a different affiliation that can edit the Plan */
export type ProjectCollaborator = {
  __typename?: 'ProjectCollaborator';
  /** The user's access level */
  accessLevel?: Maybe<ProjectCollaboratorAccessLevel>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's email */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<ProjectCollaboratorErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user who invited the collaborator */
  invitedBy?: Maybe<User>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The project the collaborator may edit */
  project?: Maybe<Project>;
  /** The project member id */
  projectMemberId?: Maybe<Scalars['Int']['output']>;
  /** The collaborator (if they have an account) */
  user?: Maybe<User>;
};

export enum ProjectCollaboratorAccessLevel {
  /** The user is ONLY able to comment on the Plan's answers */
  Comment = 'COMMENT',
  /** The user is able to perform most actions on a Project/Plan except (publish, mark as complete and change access) */
  Edit = 'EDIT',
  /** The user is able to perform all actions on a Plan (typically restricted to the owner/creator) */
  Own = 'OWN'
}

/** A collection of errors related to the ProjectCollaborator */
export type ProjectCollaboratorErrors = {
  __typename?: 'ProjectCollaboratorErrors';
  accessLevel?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as affiliation already exists */
  general?: Maybe<Scalars['String']['output']>;
  invitedById?: Maybe<Scalars['String']['output']>;
  planId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Project */
export type ProjectErrors = {
  __typename?: 'ProjectErrors';
  abstractText?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  fundingIds?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  memberIds?: Maybe<Scalars['String']['output']>;
  outputIds?: Maybe<Scalars['String']['output']>;
  researchDomainId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** Funding that is supporting a research project */
export type ProjectFunding = {
  __typename?: 'ProjectFunding';
  /** The funder */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectFundingErrors>;
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: Maybe<Scalars['String']['output']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The project that is seeking (or has aquired) funding */
  project?: Maybe<Project>;
  /** The status of the funding resquest */
  status?: Maybe<ProjectFundingStatus>;
};

/** A collection of errors related to the ProjectFunding */
export type ProjectFundingErrors = {
  __typename?: 'ProjectFundingErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  funderOpportunityNumber?: Maybe<Scalars['String']['output']>;
  funderProjectNumber?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  grantId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

/** The status of the funding */
export enum ProjectFundingStatus {
  /** The funder did not award the project */
  Denied = 'DENIED',
  /** The funding has been awarded to the project */
  Granted = 'GRANTED',
  /** The project will be submitting a grant, or has not yet heard back from the funder */
  Planned = 'PLANNED'
}

export type ProjectImportInput = {
  /** The external funding data */
  funding?: InputMaybe<Array<AddProjectFundingInput>>;
  /** The external member data */
  members?: InputMaybe<Array<AddProjectMemberInput>>;
  /** The external project data */
  project: UpdateProjectInput;
};

/** A person involved with a research project */
export type ProjectMember = {
  __typename?: 'ProjectMember';
  /** The Member's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The Member's email address */
  email?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectMemberErrors>;
  /** The Member's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Member the primary contact for the Plan */
  isPrimaryContact?: Maybe<Scalars['Boolean']['output']>;
  /** The roles the Member has on the research project */
  memberRoles?: Maybe<Array<MemberRole>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The Member's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The research project */
  project?: Maybe<Project>;
  /** The Member's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the ProjectMember */
export type ProjectMemberErrors = {
  __typename?: 'ProjectMemberErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  memberRoleIds?: Maybe<Scalars['String']['output']>;
  orcid?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  surName?: Maybe<Scalars['String']['output']>;
};

/** Something produced/collected as part of (or as a result of) a research project */
export type ProjectOutput = {
  __typename?: 'ProjectOutput';
  /** The date the output is expected to be deposited (YYYY-MM-DD format) */
  anticipatedReleaseDate?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the output */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ProjectOutputErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The initial access level that will be allowed for the output */
  initialAccessLevel: AccessLevel;
  /** The initial license that will apply to the output */
  initialLicense?: Maybe<License>;
  /** Whether or not the output may contain personally identifying information (PII) */
  mayContainPII?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not the output may contain sensitive data */
  mayContainSensitiveInformation?: Maybe<Scalars['Boolean']['output']>;
  /** The metadata standards that will be used to describe the output */
  metadataStandards?: Maybe<Array<MetadataStandard>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The type of output */
  outputType?: Maybe<OutputType>;
  /** The project associated with the output */
  project?: Maybe<Project>;
  /** The repositories the output will be deposited in */
  repositories?: Maybe<Array<Repository>>;
  /** The title/name of the output */
  title: Scalars['String']['output'];
};

/** A collection of errors related to the ProjectOutput */
export type ProjectOutputErrors = {
  __typename?: 'ProjectOutputErrors';
  anticipatedReleaseDate?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  initialAccessLevel?: Maybe<Scalars['String']['output']>;
  initialLicenseId?: Maybe<Scalars['String']['output']>;
  metadataStandardIds?: Maybe<Scalars['String']['output']>;
  outputTypeId?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  repositoryIds?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResult = {
  __typename?: 'ProjectSearchResult';
  /** The research project abstract */
  abstractText?: Maybe<Scalars['String']['output']>;
  /** The names and access levels of the collaborators */
  collaborators?: Maybe<Array<ProjectSearchResultCollaborator>>;
  /** The timestamp when the project was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The id of the person who created the project */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The name of the person who created the project */
  createdByName?: Maybe<Scalars['String']['output']>;
  /** The estimated date the research project will end (use YYYY-MM-DD format) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Search results errors */
  errors?: Maybe<ProjectErrors>;
  /** The names of the funders */
  fundings?: Maybe<Array<ProjectSearchResultFunding>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is test/mock research project */
  isTestProject?: Maybe<Scalars['Boolean']['output']>;
  /** The names and roles of the members */
  members?: Maybe<Array<ProjectSearchResultMember>>;
  /** The timestamp when the project was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The id of the person who last modified the project */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the person who last modified the project */
  modifiedByName?: Maybe<Scalars['String']['output']>;
  /** The type of research being done */
  researchDomain?: Maybe<Scalars['String']['output']>;
  /** The estimated date the research project will begin (use YYYY-MM-DD format) */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The name/title of the research project */
  title?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResultCollaborator = {
  __typename?: 'ProjectSearchResultCollaborator';
  /** The access level of the collaborator */
  accessLevel?: Maybe<Scalars['String']['output']>;
  /** The name of the collaborator */
  name?: Maybe<Scalars['String']['output']>;
  /** The ORCiD ID */
  orcid?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResultFunding = {
  __typename?: 'ProjectSearchResultFunding';
  /** The grant id/url */
  grantId?: Maybe<Scalars['String']['output']>;
  /** The name of the funder */
  name?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResultMember = {
  __typename?: 'ProjectSearchResultMember';
  /** The name of the member */
  name?: Maybe<Scalars['String']['output']>;
  /** The ORCiD ID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The role of the member */
  role?: Maybe<Scalars['String']['output']>;
};

export type ProjectSearchResults = PaginatedQueryResults & {
  __typename?: 'ProjectSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<ProjectSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type PublishedTemplateSearchResults = PaginatedQueryResults & {
  __typename?: 'PublishedTemplateSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<VersionedTemplateSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Retrieve a specific Affiliation by its ID */
  affiliationById?: Maybe<Affiliation>;
  /** Retrieve a specific Affiliation by its URI */
  affiliationByURI?: Maybe<Affiliation>;
  /** Retrieve all of the valid Affiliation types */
  affiliationTypes?: Maybe<Array<Scalars['String']['output']>>;
  /** Perform a search for Affiliations matching the specified name */
  affiliations?: Maybe<AffiliationSearchResults>;
  /** Get the sepecific answer */
  answer?: Maybe<Answer>;
  /** Get an answer by versionedQuestionId */
  answerByVersionedQuestionId?: Maybe<Answer>;
  /** Get all answers for the given project and plan and section */
  answers?: Maybe<Array<Maybe<Answer>>>;
  /** Get all of the best practice VersionedSection */
  bestPracticeSections?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Get all of the research domains related to the specified top level domain (more nuanced ones) */
  childResearchDomains?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** Search for a User to add as a collaborator */
  findCollaborator?: Maybe<Array<Maybe<CollaboratorSearchResult>>>;
  /** Get all of the supported Languages */
  languages?: Maybe<Array<Maybe<Language>>>;
  /** Fetch a specific license */
  license?: Maybe<License>;
  /** Search for a license */
  licenses?: Maybe<LicenseSearchResults>;
  /** Returns the currently logged in user's information */
  me?: Maybe<User>;
  /** Get the member role by it's id */
  memberRoleById?: Maybe<MemberRole>;
  /** Get the member role by it's URL */
  memberRoleByURL?: Maybe<MemberRole>;
  /** Get all of the member role types */
  memberRoles?: Maybe<Array<Maybe<MemberRole>>>;
  /** Fetch a specific metadata standard */
  metadataStandard?: Maybe<MetadataStandard>;
  /** Search for a metadata standard */
  metadataStandards?: Maybe<MetadataStandardSearchResults>;
  /** Get all of the user's projects */
  myProjects?: Maybe<ProjectSearchResults>;
  /** Get the Templates that belong to the current user's affiliation (user must be an Admin) */
  myTemplates?: Maybe<TemplateSearchResults>;
  /** Get the VersionedTemplates that belong to the current user's affiliation (user must be an Admin) */
  myVersionedTemplates?: Maybe<Array<Maybe<VersionedTemplateSearchResult>>>;
  /** Get a specific plan */
  plan?: Maybe<Plan>;
  /** Get all rounds of admin feedback for the plan */
  planFeedback?: Maybe<Array<Maybe<PlanFeedback>>>;
  /** Get all of the comments associated with the round of admin feedback */
  planFeedbackComments?: Maybe<Array<Maybe<PlanFeedbackComment>>>;
  /** Get all of the Funding information for the specific Plan */
  planFundings?: Maybe<Array<Maybe<PlanFunding>>>;
  /** Get all of the Users that are Members for the specific Plan */
  planMembers?: Maybe<Array<Maybe<PlanMember>>>;
  /** The subset of project outputs associated with the sepcified Plan */
  planOutputs?: Maybe<Array<Maybe<ProjectOutput>>>;
  /** Get all plans for the research project */
  plans?: Maybe<Array<PlanSearchResult>>;
  /** Returns a list of the top 20 funders ranked by popularity (nbr of plans) for the past year */
  popularFunders?: Maybe<Array<Maybe<FunderPopularityResult>>>;
  /** Get a specific project */
  project?: Maybe<Project>;
  /** Get all of the Users that are collaborators for the Project */
  projectCollaborators?: Maybe<Array<Maybe<ProjectCollaborator>>>;
  /** Get a specific ProjectFunding */
  projectFunding?: Maybe<ProjectFunding>;
  /** Get all of the Funding information for the research project */
  projectFundings?: Maybe<Array<Maybe<ProjectFunding>>>;
  /** Get a specific Member on the research project */
  projectMember?: Maybe<ProjectMember>;
  /** Get all of the Users that a Members to the research project */
  projectMembers?: Maybe<Array<Maybe<ProjectMember>>>;
  /** Fetch a single project output */
  projectOutput?: Maybe<ProjectOutput>;
  /** Get all the research output types */
  projectOutputTypes?: Maybe<Array<Maybe<OutputType>>>;
  /** Get all of the outputs for the research project */
  projectOutputs?: Maybe<Array<Maybe<ProjectOutput>>>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedConditionsForQuestion?: Maybe<Array<Maybe<VersionedQuestionCondition>>>;
  /** Get a specific VersionedQuestion based on versionedQuestionId */
  publishedQuestion?: Maybe<VersionedQuestion>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedQuestions?: Maybe<Array<Maybe<VersionedQuestion>>>;
  /** Fetch a specific VersionedSection */
  publishedSection?: Maybe<VersionedSection>;
  /** Search for VersionedSection whose name contains the search term */
  publishedSections?: Maybe<VersionedSectionSearchResults>;
  /** Search for VersionedTemplate whose name or owning Org's name contains the search term */
  publishedTemplates?: Maybe<PublishedTemplateSearchResults>;
  /** Get the specific Question based on questionId */
  question?: Maybe<Question>;
  /** Get the QuestionConditions that belong to a specific question */
  questionConditions?: Maybe<Array<Maybe<QuestionCondition>>>;
  /** Get all the QuestionTypes */
  questionTypes?: Maybe<Array<Maybe<QuestionType>>>;
  /** Get the Questions that belong to the associated sectionId */
  questions?: Maybe<Array<Maybe<Question>>>;
  /** Return the recommended Licenses */
  recommendedLicenses?: Maybe<Array<Maybe<License>>>;
  /** Search for a repository */
  repositories?: Maybe<RepositorySearchResults>;
  /** Fetch a specific repository */
  repository?: Maybe<Repository>;
  /** Search for projects within external APIs */
  searchExternalProjects?: Maybe<Array<Maybe<ExternalProject>>>;
  /** Get the specified section */
  section?: Maybe<Section>;
  /** Get all of the VersionedSection for the specified Section ID */
  sectionVersions?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Get the Sections that belong to the associated templateId */
  sections?: Maybe<Array<Maybe<Section>>>;
  /** Fetch the DynamoDB PlanVersion record for a specific plan and version timestamp (leave blank for the latest) */
  superInspectPlanVersion?: Maybe<Scalars['String']['output']>;
  /** Get all available tags to display */
  tags: Array<Tag>;
  tagsBySectionId?: Maybe<Array<Maybe<Tag>>>;
  /** Get the specified Template (user must be an Admin) */
  template?: Maybe<Template>;
  /** Get all of the Users that belong to another affiliation that can edit the Template */
  templateCollaborators?: Maybe<Array<Maybe<TemplateCollaborator>>>;
  /** Get all of the VersionedTemplate for the specified Template (a.k. the Template history) */
  templateVersions?: Maybe<Array<Maybe<VersionedTemplate>>>;
  /** Get all of the top level research domains (the most generic ones) */
  topLevelResearchDomains?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** Returns the specified user (Admin only) */
  user?: Maybe<User>;
  /** Returns all of the users associated with the current admin's affiliation (Super admins get everything) */
  users?: Maybe<UserSearchResults>;
};


export type QueryAffiliationByIdArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type QueryAffiliationByUriArgs = {
  uri: Scalars['String']['input'];
};


export type QueryAffiliationsArgs = {
  funderOnly?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  paginationOptions?: InputMaybe<PaginationOptions>;
};


export type QueryAnswerArgs = {
  answerId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
};


export type QueryAnswerByVersionedQuestionIdArgs = {
  planId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryAnswersArgs = {
  planId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryChildResearchDomainsArgs = {
  parentResearchDomainId: Scalars['Int']['input'];
};


export type QueryFindCollaboratorArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLicenseArgs = {
  uri: Scalars['String']['input'];
};


export type QueryLicensesArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMemberRoleByIdArgs = {
  memberRoleId: Scalars['Int']['input'];
};


export type QueryMemberRoleByUrlArgs = {
  memberRoleURL: Scalars['URL']['input'];
};


export type QueryMetadataStandardArgs = {
  uri: Scalars['String']['input'];
};


export type QueryMetadataStandardsArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyProjectsArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyTemplatesArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackCommentsArgs = {
  planFeedbackId: Scalars['Int']['input'];
};


export type QueryPlanFundingsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanMembersArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanOutputsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlansArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectCollaboratorsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectFundingArgs = {
  projectFundingId: Scalars['Int']['input'];
};


export type QueryProjectFundingsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectMemberArgs = {
  projectMemberId: Scalars['Int']['input'];
};


export type QueryProjectMembersArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectOutputArgs = {
  projectOutputId: Scalars['Int']['input'];
};


export type QueryProjectOutputsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryPublishedConditionsForQuestionArgs = {
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryPublishedQuestionArgs = {
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryPublishedQuestionsArgs = {
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryPublishedSectionArgs = {
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryPublishedSectionsArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term: Scalars['String']['input'];
};


export type QueryPublishedTemplatesArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionConditionsArgs = {
  questionId: Scalars['Int']['input'];
};


export type QueryQuestionsArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QueryRecommendedLicensesArgs = {
  recommended: Scalars['Boolean']['input'];
};


export type QueryRepositoriesArgs = {
  input: RepositorySearchInput;
};


export type QueryRepositoryArgs = {
  uri: Scalars['String']['input'];
};


export type QuerySearchExternalProjectsArgs = {
  input: ExternalSearchInput;
};


export type QuerySectionArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionVersionsArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionsArgs = {
  templateId: Scalars['Int']['input'];
};


export type QuerySuperInspectPlanVersionArgs = {
  modified?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['Int']['input'];
};


export type QueryTagsBySectionIdArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QueryTemplateArgs = {
  templateId: Scalars['Int']['input'];
};


export type QueryTemplateCollaboratorsArgs = {
  templateId: Scalars['Int']['input'];
};


export type QueryTemplateVersionsArgs = {
  templateId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  userId: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  paginationOptions?: InputMaybe<PaginationOptions>;
  term?: InputMaybe<Scalars['String']['input']>;
};

/** Question always belongs to a Section, which always belongs to a Template */
export type Question = {
  __typename?: 'Question';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the question */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionErrors>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Question has had any changes since the related template was last published */
  isDirty?: Maybe<Scalars['Boolean']['output']>;
  /** The JSON representation of the question type */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The conditional logic triggered by this question */
  questionConditions?: Maybe<Array<QuestionCondition>>;
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** To indicate whether the question is required to be completed */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** Requirements associated with the Question */
  requirementText?: Maybe<Scalars['String']['output']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: Maybe<Scalars['String']['output']>;
  /** The unique id of the Section that the question belongs to */
  sectionId: Scalars['Int']['output'];
  /** The original question id if this question is a copy of another */
  sourceQestionId?: Maybe<Scalars['Int']['output']>;
  /** The unique id of the Template that the question belongs to */
  templateId: Scalars['Int']['output'];
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: Maybe<Scalars['Boolean']['output']>;
};

/**
 * if [Question content] [condition] [conditionMatch] then [action] on [target] so
 * for example if 'Yes' EQUAL 'Yes' then 'SHOW_Question' 123
 */
export type QuestionCondition = {
  __typename?: 'QuestionCondition';
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: Maybe<Scalars['String']['output']>;
  /** The type of condition in which to take the action */
  conditionType: QuestionConditionCondition;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionConditionErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The question id that the QuestionCondition belongs to */
  questionId: Scalars['Int']['output'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['output'];
};

/** QuestionCondition action */
export enum QuestionConditionActionType {
  /** Hide the question */
  HideQuestion = 'HIDE_QUESTION',
  /** Send email */
  SendEmail = 'SEND_EMAIL',
  /** Show the question */
  ShowQuestion = 'SHOW_QUESTION'
}

/** QuestionCondition types */
export enum QuestionConditionCondition {
  /** When a question does not equal a specific value */
  DoesNotEqual = 'DOES_NOT_EQUAL',
  /** When a question equals a specific value */
  Equal = 'EQUAL',
  /** When a question has an answer */
  HasAnswer = 'HAS_ANSWER',
  /** When a question includes a specific value */
  Includes = 'INCLUDES'
}

/** A collection of errors related to the QuestionCondition */
export type QuestionConditionErrors = {
  __typename?: 'QuestionConditionErrors';
  action?: Maybe<Scalars['String']['output']>;
  conditionMatch?: Maybe<Scalars['String']['output']>;
  conditionType?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  questionId?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Question */
export type QuestionErrors = {
  __typename?: 'QuestionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidanceText?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  questionConditionIds?: Maybe<Scalars['String']['output']>;
  questionText?: Maybe<Scalars['String']['output']>;
  requirementText?: Maybe<Scalars['String']['output']>;
  sampleText?: Maybe<Scalars['String']['output']>;
  sectionId?: Maybe<Scalars['String']['output']>;
  sourceQestionId?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
};

/** The type of Question, such as text field, radio buttons, etc */
export type QuestionType = {
  __typename?: 'QuestionType';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<QuestionTypeErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is the default question type */
  isDefault: Scalars['Boolean']['output'];
  /** The default JSON for the QuestionType */
  json: Scalars['String']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the QuestionType, like 'Short text question' */
  name: Scalars['String']['output'];
  /** The description of the QuestionType */
  usageDescription: Scalars['String']['output'];
};

/** A collection of errors related to the QuestionType */
export type QuestionTypeErrors = {
  __typename?: 'QuestionTypeErrors';
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  usageDescription?: Maybe<Scalars['String']['output']>;
};

/** The results of reordering the questions */
export type ReorderQuestionsResult = {
  __typename?: 'ReorderQuestionsResult';
  /** Error messages */
  errors?: Maybe<QuestionErrors>;
  /** The reordered sections */
  questions?: Maybe<Array<Question>>;
};

/** The results of reordering the sections */
export type ReorderSectionsResult = {
  __typename?: 'ReorderSectionsResult';
  /** Error messages */
  errors?: Maybe<SectionErrors>;
  /** The reordered sections */
  sections?: Maybe<Array<Section>>;
};

/** A repository where research outputs are preserved */
export type Repository = {
  __typename?: 'Repository';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the repository */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<RepositoryErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Keywords to assist in finding the repository */
  keywords?: Maybe<Array<Scalars['String']['output']>>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the repository */
  name: Scalars['String']['output'];
  /** The Categories/Types of the repository */
  repositoryTypes?: Maybe<Array<RepositoryType>>;
  /** Research domains associated with the repository */
  researchDomains?: Maybe<Array<ResearchDomain>>;
  /** The taxonomy URL of the repository */
  uri: Scalars['String']['output'];
  /** The website URL */
  website?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Repository */
export type RepositoryErrors = {
  __typename?: 'RepositoryErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  keywords?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  repositoryTypes?: Maybe<Scalars['String']['output']>;
  researchDomainIds?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type RepositorySearchInput = {
  /** The pagination options */
  paginationOptions?: InputMaybe<PaginationOptions>;
  /** The repository category/type */
  repositoryType?: InputMaybe<Scalars['String']['input']>;
  /** The research domain associated with the repository */
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  /** The search term */
  term?: InputMaybe<Scalars['String']['input']>;
};

export type RepositorySearchResults = PaginatedQueryResults & {
  __typename?: 'RepositorySearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<Repository>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

export enum RepositoryType {
  /** A discipline specific repository (e.g. GeneCards, Arctic Data Centre, etc.) */
  Disciplinary = 'DISCIPLINARY',
  /** A generalist repository (e.g. Zenodo, Dryad) */
  Generalist = 'GENERALIST',
  /** An institution specific repository (e.g. ASU Library Research Data Repository, etc.) */
  Institutional = 'INSTITUTIONAL'
}

/** An aread of research (e.g. Electrical Engineering, Cellular biology, etc.) */
export type ResearchDomain = {
  __typename?: 'ResearchDomain';
  /** The child research domains (if applicable) */
  childResearchDomains?: Maybe<Array<ResearchDomain>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the type of research covered by the domain */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<ResearchDomainErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the domain */
  name: Scalars['String']['output'];
  /** The parent research domain (if applicable). If this is blank then it is a top level domain. */
  parentResearchDomain?: Maybe<ResearchDomain>;
  /** The ID of the parent research domain (if applicable) */
  parentResearchDomainId?: Maybe<Scalars['Int']['output']>;
  /** The taxonomy URL of the research domain */
  uri: Scalars['String']['output'];
};

/** A collection of errors related to the ResearchDomain */
export type ResearchDomainErrors = {
  __typename?: 'ResearchDomainErrors';
  childResearchDomainIds?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentResearchDomainId?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type ResearchDomainSearchResults = PaginatedQueryResults & {
  __typename?: 'ResearchDomainSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A Section that contains a list of questions in a template */
export type Section = {
  __typename?: 'Section';
  /** Whether or not this Section is designated as a 'Best Practice' section */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<SectionErrors>;
  /** The guidance to help user with section */
  guidance?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The section introduction */
  introduction?: Maybe<Scalars['String']['output']>;
  /** Indicates whether or not the section has changed since the template was last published */
  isDirty: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The section title */
  name: Scalars['String']['output'];
  /** The questions associated with this section */
  questions?: Maybe<Array<Question>>;
  /** Requirements that a user must consider in this section */
  requirements?: Maybe<Scalars['String']['output']>;
  /** The Tags associated with this section. A section might not have any tags */
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** The template that the section is associated with */
  template?: Maybe<Template>;
};

/** A collection of errors related to the Section */
export type SectionErrors = {
  __typename?: 'SectionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidance?: Maybe<Scalars['String']['output']>;
  introduction?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  questionIds?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
};

/** Section version type */
export enum SectionVersionType {
  /** Draft - saved state for internal review */
  Draft = 'DRAFT',
  /** Published - saved state for use when creating DMPs */
  Published = 'PUBLISHED'
}

/** A Tag is a way to group similar types of categories together */
export type Tag = {
  __typename?: 'Tag';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The tag description */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<TagErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The tag name */
  name: Scalars['String']['output'];
};

/** A collection of errors related to the Tag */
export type TagErrors = {
  __typename?: 'TagErrors';
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Input for Tag operations */
export type TagInput = {
  /** The description of the Tag */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier for the Tag */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the Tag */
  name: Scalars['String']['input'];
};

/** A Template used to create DMPs */
export type Template = {
  __typename?: 'Template';
  /** Admin users associated with the template's owner */
  admins?: Maybe<Array<User>>;
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice: Scalars['Boolean']['output'];
  /** Users from different affiliations who have been invited to collaborate on this template */
  collaborators?: Maybe<Array<TemplateCollaborator>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<TemplateErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Template has had any changes since it was last published */
  isDirty: Scalars['Boolean']['output'];
  /** The template's language */
  languageId: Scalars['String']['output'];
  /** The last published date */
  latestPublishDate?: Maybe<Scalars['String']['output']>;
  /** The last published version */
  latestPublishVersion?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name/title of the template */
  name: Scalars['String']['output'];
  /** The affiliation that the template belongs to */
  owner?: Maybe<Affiliation>;
  /** The Sections associated with the template */
  sections?: Maybe<Array<Maybe<Section>>>;
  /** The template that this one was derived from */
  sourceTemplateId?: Maybe<Scalars['Int']['output']>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility: TemplateVisibility;
};

/** A user that that belongs to a different affiliation that can edit the Template */
export type TemplateCollaborator = {
  __typename?: 'TemplateCollaborator';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's email */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<TemplateCollaboratorErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user who invited the collaborator */
  invitedBy?: Maybe<User>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The template the collaborator may edit */
  template?: Maybe<Template>;
  /** The collaborator (if they have an account) */
  user?: Maybe<User>;
};

/** A collection of errors related to the TemplateCollaborator */
export type TemplateCollaboratorErrors = {
  __typename?: 'TemplateCollaboratorErrors';
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  invitedById?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the Template */
export type TemplateErrors = {
  __typename?: 'TemplateErrors';
  collaboratorIds?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  languageId?: Maybe<Scalars['String']['output']>;
  latestPublishVersion?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  sectionIds?: Maybe<Scalars['String']['output']>;
  sourceTemplateId?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** A search result for templates */
export type TemplateSearchResult = {
  __typename?: 'TemplateSearchResult';
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Template was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The id of the person who created the template */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** the name of the person who created the template */
  createdByName?: Maybe<Scalars['String']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Template has had any changes since it was last published */
  isDirty?: Maybe<Scalars['Boolean']['output']>;
  /** The last published date */
  latestPublishDate?: Maybe<Scalars['String']['output']>;
  /** The last published version */
  latestPublishVersion?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Template was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The id of the person who last modified the template */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the person who last modified the template */
  modifiedByName?: Maybe<Scalars['String']['output']>;
  /** The name/title of the template */
  name?: Maybe<Scalars['String']['output']>;
  /** The display name of the affiliation that owns the Template */
  ownerDisplayName?: Maybe<Scalars['String']['output']>;
  /** The id of the affiliation that owns the Template */
  ownerId?: Maybe<Scalars['String']['output']>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility?: Maybe<TemplateVisibility>;
};

/** Paginated results of a search for templates */
export type TemplateSearchResults = PaginatedQueryResults & {
  __typename?: 'TemplateSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<TemplateSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** Template version type */
export enum TemplateVersionType {
  /** Draft - saved state for internal review */
  Draft = 'DRAFT',
  /** Published - saved state for use when creating DMPs */
  Published = 'PUBLISHED'
}

/** Template visibility */
export enum TemplateVisibility {
  /** Visible only to users of your institution/affiliation */
  Organization = 'ORGANIZATION',
  /** Visible to all users */
  Public = 'PUBLIC'
}

export type UpdateMetadataStandardInput = {
  /** A description of the metadata standard */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The id of the MetadataStandard */
  id: Scalars['Int']['input'];
  /** Keywords to assist in finding the metadata standard */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the metadata standard */
  name: Scalars['String']['input'];
  /** Research domains associated with the metadata standard */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The taxonomy URL (do not make this up! should resolve to an HTML/JSON representation of the object) */
  uri?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectFundingInput = {
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project funder */
  projectFundingId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFundingStatus>;
};

export type UpdateProjectInput = {
  /** The research project description/abstract */
  abstractText?: InputMaybe<Scalars['String']['input']>;
  /** The actual or anticipated end date of the project */
  endDate?: InputMaybe<Scalars['String']['input']>;
  /** The project's id */
  id: Scalars['Int']['input'];
  /** Whether or not the project is a mock/test */
  isTestProject?: InputMaybe<Scalars['Boolean']['input']>;
  /** The id of the research domain */
  researchDomainId?: InputMaybe<Scalars['Int']['input']>;
  /** The actual or anticipated start date for the project */
  startDate?: InputMaybe<Scalars['String']['input']>;
  /** The title of the research project */
  title: Scalars['String']['input'];
};

export type UpdateProjectMemberInput = {
  /** The Member's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The Member's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The Member's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The roles the Member has on the research project */
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The Member's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The project Member */
  projectMemberId: Scalars['Int']['input'];
  /** The Member's last/sur name */
  surName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectOutputInput = {
  /** The date the output is expected to be deposited (YYYY-MM-DD format) */
  anticipatedReleaseDate?: InputMaybe<Scalars['String']['input']>;
  /** A description of the output */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The initial access level that will be allowed for the output */
  initialAccessLevel?: InputMaybe<Scalars['String']['input']>;
  /** The initial license that will apply to the output */
  initialLicenseId?: InputMaybe<Scalars['Int']['input']>;
  /** Whether or not the output may contain personally identifying information (PII) */
  mayContainPII?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether or not the output may contain sensitive data */
  mayContainSensitiveInformation?: InputMaybe<Scalars['Boolean']['input']>;
  /** The metadata standards that will be used to describe the output */
  metadataStandardIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The type of output */
  outputTypeId: Scalars['Int']['input'];
  /** The id of the output */
  projectOutputId: Scalars['Int']['input'];
  /** The repositories the output will be deposited in */
  respositoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The title/name of the output */
  title: Scalars['String']['input'];
};

/** Input for updating a new QuestionCondition based on a QuestionCondition id */
export type UpdateQuestionConditionInput = {
  /** The action to take on a QuestionCondition */
  action: QuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: InputMaybe<Scalars['String']['input']>;
  /** The type of condition in which to take the action */
  conditionType: QuestionConditionCondition;
  /** The id of the QuestionCondition that will be updated */
  questionConditionId: Scalars['Int']['input'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['input'];
};

export type UpdateQuestionInput = {
  /** The display order of the Question */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** Guidance to complete the question */
  guidanceText?: InputMaybe<Scalars['String']['input']>;
  /** The JSON representation of the question type */
  json?: InputMaybe<Scalars['String']['input']>;
  /** The unique identifier for the Question */
  questionId: Scalars['Int']['input'];
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** To indicate whether the question is required to be completed */
  required?: InputMaybe<Scalars['Boolean']['input']>;
  /** Requirements associated with the Question */
  requirementText?: InputMaybe<Scalars['String']['input']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: InputMaybe<Scalars['String']['input']>;
  /** Boolean indicating whether we should use content from sampleText as the default answer */
  useSampleTextAsDefault?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateRepositoryInput = {
  /** A description of the repository */
  description?: InputMaybe<Scalars['String']['input']>;
  /** The Repository id */
  id: Scalars['Int']['input'];
  /** Keywords to assist in finding the repository */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the repository */
  name: Scalars['String']['input'];
  /** The Categories/Types of the repository */
  repositoryTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Research domains associated with the repository */
  researchDomainIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The website URL */
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a section */
export type UpdateSectionInput = {
  /** Whether or not this Section is designated as a 'Best Practice' section */
  bestPractice?: InputMaybe<Scalars['Boolean']['input']>;
  /** The order in which the section will be displayed in the template */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** The guidance to help user with section */
  guidance?: InputMaybe<Scalars['String']['input']>;
  /** The section introduction */
  introduction?: InputMaybe<Scalars['String']['input']>;
  /** The section name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Requirements that a user must consider in this section */
  requirements?: InputMaybe<Scalars['String']['input']>;
  /** The unique identifer for the Section */
  sectionId: Scalars['Int']['input'];
  /** The Tags associated with this section. A section might not have any tags */
  tags?: InputMaybe<Array<TagInput>>;
};

export type UpdateUserNotificationsInput = {
  /** Whether or not email notifications are on for when a Plan has a new comment */
  notify_on_comment_added: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for when feedback on a Plan is completed */
  notify_on_feedback_complete: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for when a Plan is shared with the user */
  notify_on_plan_shared: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for Plan visibility changes */
  notify_on_plan_visibility_change: Scalars['Boolean']['input'];
  /** Whether or not email notifications are on for when a Template is shared with the User (Admin only) */
  notify_on_template_shared: Scalars['Boolean']['input'];
};

export type UpdateUserProfileInput = {
  /** The id of the affiliation if the user selected one from the typeahead list */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The user's first/given name */
  givenName: Scalars['String']['input'];
  /** The user's preferred language */
  languageId?: InputMaybe<Scalars['String']['input']>;
  /** The name of the affiliation if the user did not select one from the typeahead list */
  otherAffiliationName?: InputMaybe<Scalars['String']['input']>;
  /** The user's last/family name */
  surName: Scalars['String']['input'];
};

/** A user of the DMPTool */
export type User = {
  __typename?: 'User';
  /** Whether the user has accepted the terms and conditions of having an account */
  acceptedTerms?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not account is active */
  active?: Maybe<Scalars['Boolean']['output']>;
  /** The user's organizational affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The user's primary email address */
  email?: Maybe<Scalars['String']['output']>;
  /** The user's email addresses */
  emails?: Maybe<Array<Maybe<UserEmail>>>;
  /** Errors associated with the Object */
  errors?: Maybe<UserErrors>;
  /** The number of failed login attempts */
  failed_sign_in_attempts?: Maybe<Scalars['Int']['output']>;
  /** The user's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifier for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user's preferred language */
  languageId: Scalars['String']['output'];
  /** The timestamp of the last login */
  last_sign_in?: Maybe<Scalars['String']['output']>;
  /** The method user for the last login: PASSWORD or SSO */
  last_sign_in_via?: Maybe<Scalars['String']['output']>;
  /** Whether or not the account is locked from failed login attempts */
  locked?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Whether or not email notifications are on for when a Plan has a new comment */
  notify_on_comment_added?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for when feedback on a Plan is completed */
  notify_on_feedback_complete?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for when a Plan is shared with the user */
  notify_on_plan_shared?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for Plan visibility changes */
  notify_on_plan_visibility_change?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not email notifications are on for when a Template is shared with the User (Admin only) */
  notify_on_template_shared?: Maybe<Scalars['Boolean']['output']>;
  /** The user's ORCID */
  orcid?: Maybe<Scalars['Orcid']['output']>;
  /** The user's role within the DMPTool */
  role: UserRole;
  /** The user's SSO ID */
  ssoId?: Maybe<Scalars['String']['output']>;
  /** The user's last/family name */
  surName?: Maybe<Scalars['String']['output']>;
};

export type UserEmail = {
  __typename?: 'UserEmail';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The email address */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<UserEmailErrors>;
  /** The unique identifier for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the email address has been confirmed */
  isConfirmed: Scalars['Boolean']['output'];
  /** Whether or not this is the primary email address */
  isPrimary: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The user the email belongs to */
  userId: Scalars['Int']['output'];
};

/** A collection of errors related to the UserEmail */
export type UserEmailErrors = {
  __typename?: 'UserEmailErrors';
  email?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the User */
export type UserErrors = {
  __typename?: 'UserErrors';
  affiliationId?: Maybe<Scalars['String']['output']>;
  confirmPassword?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailIds?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  languageId?: Maybe<Scalars['String']['output']>;
  orcid?: Maybe<Scalars['String']['output']>;
  otherAffiliationName?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  ssoId?: Maybe<Scalars['String']['output']>;
  surName?: Maybe<Scalars['String']['output']>;
};

/** The types of roles supported by the DMPTool */
export enum UserRole {
  Admin = 'ADMIN',
  Researcher = 'RESEARCHER',
  Superadmin = 'SUPERADMIN'
}

export type UserSearchResults = PaginatedQueryResults & {
  __typename?: 'UserSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<User>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A snapshot of a Question when it became published. */
export type VersionedQuestion = {
  __typename?: 'VersionedQuestion';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The display order of the VersionedQuestion */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedQuestionErrors>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The JSON representation of the question type */
  json?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original question that was versioned */
  questionId: Scalars['Int']['output'];
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** To indicate whether the question is required to be completed */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** Requirements associated with the Question */
  requirementText?: Maybe<Scalars['String']['output']>;
  /** Sample text to possibly provide a starting point or example to answer question */
  sampleText?: Maybe<Scalars['String']['output']>;
  /** The conditional logic associated with this VersionedQuestion */
  versionedQuestionConditions?: Maybe<Array<VersionedQuestionCondition>>;
  /** The unique id of the VersionedSection that the VersionedQuestion belongs to */
  versionedSectionId: Scalars['Int']['output'];
  /** The unique id of the VersionedTemplate that the VersionedQuestion belongs to */
  versionedTemplateId: Scalars['Int']['output'];
};

export type VersionedQuestionCondition = {
  __typename?: 'VersionedQuestionCondition';
  /** The action to take on a QuestionCondition */
  action: VersionedQuestionConditionActionType;
  /** Relative to the condition type, it is the value to match on (e.g., HAS_ANSWER should equate to null here) */
  conditionMatch?: Maybe<Scalars['String']['output']>;
  /** The type of condition in which to take the action */
  conditionType: VersionedQuestionConditionCondition;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedQuestionConditionErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original QuestionCondition */
  questionConditionId: Scalars['Int']['output'];
  /** The target of the action (e.g., an email address for SEND_EMAIL and a Question id otherwise) */
  target: Scalars['String']['output'];
  /** The versionedQuestion id that the QuestionCondition belongs to */
  versionedQuestionId: Scalars['Int']['output'];
};

/** VersionedQuestionCondition action */
export enum VersionedQuestionConditionActionType {
  /** Hide the question */
  HideQuestion = 'HIDE_QUESTION',
  /** Send email */
  SendEmail = 'SEND_EMAIL',
  /** Show the question */
  ShowQuestion = 'SHOW_QUESTION'
}

/** VersionedQuestionCondition types */
export enum VersionedQuestionConditionCondition {
  /** When a question does not equal a specific value */
  DoesNotEqual = 'DOES_NOT_EQUAL',
  /** When a question equals a specific value */
  Equal = 'EQUAL',
  /** When a question has an answer */
  HasAnswer = 'HAS_ANSWER',
  /** When a question includes a specific value */
  Includes = 'INCLUDES'
}

/** A collection of errors related to the VersionedQuestionCondition */
export type VersionedQuestionConditionErrors = {
  __typename?: 'VersionedQuestionConditionErrors';
  action?: Maybe<Scalars['String']['output']>;
  conditionMatch?: Maybe<Scalars['String']['output']>;
  conditionType?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  questionConditionId?: Maybe<Scalars['String']['output']>;
  target?: Maybe<Scalars['String']['output']>;
  versionedQuestionId?: Maybe<Scalars['String']['output']>;
};

/** A collection of errors related to the VersionedQuestion */
export type VersionedQuestionErrors = {
  __typename?: 'VersionedQuestionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidanceText?: Maybe<Scalars['String']['output']>;
  json?: Maybe<Scalars['String']['output']>;
  questionId?: Maybe<Scalars['String']['output']>;
  questionText?: Maybe<Scalars['String']['output']>;
  requirementText?: Maybe<Scalars['String']['output']>;
  sampleText?: Maybe<Scalars['String']['output']>;
  versionedQuestionConditionIds?: Maybe<Scalars['String']['output']>;
  versionedSectionId?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
};

/** A snapshot of a Section when it became published. */
export type VersionedSection = {
  __typename?: 'VersionedSection';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The displayOrder of this VersionedSection */
  displayOrder: Scalars['Int']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<VersionedSectionErrors>;
  /** The guidance to help user with VersionedSection */
  guidance?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The VersionedSection introduction */
  introduction?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The VersionedSection name/title */
  name: Scalars['String']['output'];
  /** Requirements that a user must consider in this VersionedSection */
  requirements?: Maybe<Scalars['String']['output']>;
  /** The section that this is a snapshot of */
  section?: Maybe<Section>;
  /** The Tags associated with this VersionedSection */
  tags?: Maybe<Array<Maybe<Tag>>>;
  /** The questions associated with this VersionedSection */
  versionedQuestions?: Maybe<Array<VersionedQuestion>>;
  /** The parent VersionedTemplate */
  versionedTemplate: VersionedTemplate;
};

/** A collection of errors related to the VersionedSection */
export type VersionedSectionErrors = {
  __typename?: 'VersionedSectionErrors';
  displayOrder?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  guidance?: Maybe<Scalars['String']['output']>;
  introduction?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  sectionId?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Scalars['String']['output']>;
  versionedQuestionIds?: Maybe<Scalars['String']['output']>;
  versionedTemplateId?: Maybe<Scalars['String']['output']>;
};

export type VersionedSectionSearchResult = {
  __typename?: 'VersionedSectionSearchResult';
  /** Whether or not this VersionedSection is designated as a 'Best Practice' section */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The displayOrder of this VersionedSection */
  displayOrder: Scalars['Int']['output'];
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The VersionedSection introduction */
  introduction?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The VersionedSection name/title */
  name: Scalars['String']['output'];
  /** The number of questions associated with this VersionedSection */
  versionedQuestionCount?: Maybe<Scalars['Int']['output']>;
  /** The id of the VersionedTemplate that this VersionedSection belongs to */
  versionedTemplateId?: Maybe<Scalars['Int']['output']>;
  /** The name of the VersionedTemplate that this VersionedSection belongs to */
  versionedTemplateName?: Maybe<Scalars['String']['output']>;
};

export type VersionedSectionSearchResults = PaginatedQueryResults & {
  __typename?: 'VersionedSectionSearchResults';
  /** The sortFields that are available for this query (for standard offset pagination only!) */
  availableSortFields?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The current offset of the results (for standard offset pagination) */
  currentOffset?: Maybe<Scalars['Int']['output']>;
  /** Whether or not there is a next page */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** Whether or not there is a previous page */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The TemplateSearchResults that match the search criteria */
  items?: Maybe<Array<Maybe<VersionedSectionSearchResult>>>;
  /** The number of items returned */
  limit?: Maybe<Scalars['Int']['output']>;
  /** The cursor to use for the next page of results (for infinite scroll/load more) */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /** The total number of possible items */
  totalCount?: Maybe<Scalars['Int']['output']>;
};

/** A snapshot of a Template when it became published. DMPs are created from published templates */
export type VersionedTemplate = {
  __typename?: 'VersionedTemplate';
  /** Whether or not this is the version provided when users create a new DMP (default: false) */
  active: Scalars['Boolean']['output'];
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice: Scalars['Boolean']['output'];
  /** A comment/note the user enters when publishing the Template */
  comment?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<VersionedTemplateErrors>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name/title of the template */
  name: Scalars['String']['output'];
  /** The owner of the Template */
  owner?: Maybe<Affiliation>;
  /** The template that this published version stems from */
  template?: Maybe<Template>;
  /** The major.minor semantic version */
  version: Scalars['String']['output'];
  /** The type of version: Published or Draft (default: Draft) */
  versionType?: Maybe<TemplateVersionType>;
  /** The publisher of the Template */
  versionedBy?: Maybe<User>;
  /** The VersionedSections that go with the VersionedTemplate */
  versionedSections?: Maybe<Array<VersionedSection>>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility: TemplateVisibility;
};

/** A collection of errors related to the VersionedTemplate */
export type VersionedTemplateErrors = {
  __typename?: 'VersionedTemplateErrors';
  comment?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  /** General error messages such as the object already exists */
  general?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  templateId?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
  versionType?: Maybe<Scalars['String']['output']>;
  versionedById?: Maybe<Scalars['String']['output']>;
  versionedSectionIds?: Maybe<Scalars['String']['output']>;
  visibility?: Maybe<Scalars['String']['output']>;
};

/** An abbreviated view of a Template for pages that allow search/filtering of published Templates */
export type VersionedTemplateSearchResult = {
  __typename?: 'VersionedTemplateSearchResult';
  /** Whether or not this Template is designated as a 'Best Practice' template */
  bestPractice?: Maybe<Scalars['Boolean']['output']>;
  /** A description of the purpose of the template */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Template was last modified */
  modified?: Maybe<Scalars['String']['output']>;
  /** The name of the last person who modified the Template */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the last person who modified the Template */
  modifiedByName?: Maybe<Scalars['String']['output']>;
  /** The name/title of the template */
  name?: Maybe<Scalars['String']['output']>;
  /** The display name of the affiliation that owns the Template */
  ownerDisplayName?: Maybe<Scalars['String']['output']>;
  /** The id of the affiliation that owns the Template */
  ownerId?: Maybe<Scalars['Int']['output']>;
  /** The search name of the affiliation that owns the Template */
  ownerSearchName?: Maybe<Scalars['String']['output']>;
  /** The URI of the affiliation that owns the Template */
  ownerURI?: Maybe<Scalars['String']['output']>;
  /** The id of the template that this version is based on */
  templateId?: Maybe<Scalars['Int']['output']>;
  /** The major.minor semantic version */
  version?: Maybe<Scalars['String']['output']>;
  /** The template's availability setting: Public is available to everyone, Private only your affiliation */
  visibility?: Maybe<TemplateVisibility>;
};

export type AddAffiliationMutationVariables = Exact<{
  input: AffiliationInput;
}>;


export type AddAffiliationMutation = { __typename?: 'Mutation', addAffiliation?: { __typename?: 'Affiliation', uri: string, errors?: { __typename?: 'AffiliationErrors', name?: string | null } | null } | null };

export type AddAnswerMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
  json: Scalars['String']['input'];
}>;


export type AddAnswerMutation = { __typename?: 'Mutation', addAnswer?: { __typename?: 'Answer', id?: number | null, json?: string | null, modified?: string | null } | null };

export type UpdateAnswerMutationVariables = Exact<{
  answerId: Scalars['Int']['input'];
  json?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateAnswerMutation = { __typename?: 'Mutation', updateAnswer?: { __typename?: 'Answer', id?: number | null, json?: string | null, modified?: string | null, errors?: { __typename?: 'AffiliationErrors', acronyms?: string | null, aliases?: string | null, contactEmail?: string | null, contactName?: string | null, displayName?: string | null, feedbackEmails?: string | null, feedbackMessage?: string | null, fundrefId?: string | null, general?: string | null, homepage?: string | null, json?: string | null, logoName?: string | null, logoURI?: string | null, name?: string | null, planId?: string | null, provenance?: string | null, searchName?: string | null, ssoEntityId?: string | null, subHeaderLinks?: string | null, types?: string | null, uri?: string | null, versionedQuestionId?: string | null, versionedSectionId?: string | null } | null, versionedQuestion?: { __typename?: 'VersionedQuestion', versionedSectionId: number } | null } | null };

export type AddPlanMutationVariables = Exact<{
  projectId: Scalars['Int']['input'];
  versionedTemplateId: Scalars['Int']['input'];
}>;


export type AddPlanMutation = { __typename?: 'Mutation', addPlan?: { __typename?: 'Plan', id?: number | null } | null };

export type AddPlanMemberMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  projectMemberId: Scalars['Int']['input'];
}>;


export type AddPlanMemberMutation = { __typename?: 'Mutation', addPlanMember?: { __typename?: 'PlanMember', id?: number | null, isPrimaryContact?: boolean | null, errors?: { __typename?: 'PlanMemberErrors', general?: string | null, memberRoleIds?: string | null, primaryContact?: string | null, projectMemberId?: string | null, projectId?: string | null } | null } | null };

export type RemovePlanMemberMutationVariables = Exact<{
  planMemberId: Scalars['Int']['input'];
}>;


export type RemovePlanMemberMutation = { __typename?: 'Mutation', removePlanMember?: { __typename?: 'PlanMember', id?: number | null, isPrimaryContact?: boolean | null, errors?: { __typename?: 'PlanMemberErrors', general?: string | null, primaryContact?: string | null, projectMemberId?: string | null, projectId?: string | null, memberRoleIds?: string | null } | null } | null };

export type UpdatePlanMemberMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  planMemberId: Scalars['Int']['input'];
  isPrimaryContact?: InputMaybe<Scalars['Boolean']['input']>;
  memberRoleIds?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type UpdatePlanMemberMutation = { __typename?: 'Mutation', updatePlanMember?: { __typename?: 'PlanMember', id?: number | null, errors?: { __typename?: 'PlanMemberErrors', general?: string | null } | null } | null };

export type PublishPlanMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  visibility?: InputMaybe<PlanVisibility>;
}>;


export type PublishPlanMutation = { __typename?: 'Mutation', publishPlan?: { __typename?: 'Plan', visibility?: PlanVisibility | null, status?: PlanStatus | null, errors?: { __typename?: 'PlanErrors', general?: string | null, visibility?: string | null, status?: string | null } | null } | null };

export type UpdatePlanStatusMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  status: PlanStatus;
}>;


export type UpdatePlanStatusMutation = { __typename?: 'Mutation', updatePlanStatus?: { __typename?: 'Plan', id?: number | null, status?: PlanStatus | null, visibility?: PlanVisibility | null, errors?: { __typename?: 'PlanErrors', general?: string | null, status?: string | null } | null } | null };

export type UpdatePlanTitleMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
}>;


export type UpdatePlanTitleMutation = { __typename?: 'Mutation', updatePlanTitle?: { __typename?: 'Plan', id?: number | null, title?: string | null, errors?: { __typename?: 'PlanErrors', general?: string | null, title?: string | null } | null } | null };

export type UpdatePlanFundingMutationVariables = Exact<{
  planId: Scalars['Int']['input'];
  projectFundingIds: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type UpdatePlanFundingMutation = { __typename?: 'Mutation', updatePlanFunding?: Array<{ __typename?: 'PlanFunding', errors?: { __typename?: 'PlanFundingErrors', ProjectFundingId?: string | null, general?: string | null } | null, projectFunding?: { __typename?: 'ProjectFunding', id?: number | null } | null } | null> | null };

export type AddProjectCollaboratorMutationVariables = Exact<{
  projectId: Scalars['Int']['input'];
  email: Scalars['String']['input'];
  accessLevel?: InputMaybe<ProjectCollaboratorAccessLevel>;
}>;


export type AddProjectCollaboratorMutation = { __typename?: 'Mutation', addProjectCollaborator?: { __typename?: 'ProjectCollaborator', id?: number | null, email: string, errors?: { __typename?: 'ProjectCollaboratorErrors', general?: string | null, email?: string | null } | null, user?: { __typename?: 'User', givenName?: string | null, surName?: string | null, orcid?: any | null, affiliation?: { __typename?: 'Affiliation', uri: string } | null } | null } | null };

export type AddProjectFundingMutationVariables = Exact<{
  input: AddProjectFundingInput;
}>;


export type AddProjectFundingMutation = { __typename?: 'Mutation', addProjectFunding?: { __typename?: 'ProjectFunding', id?: number | null, errors?: { __typename?: 'ProjectFundingErrors', affiliationId?: string | null, funderOpportunityNumber?: string | null, funderProjectNumber?: string | null, general?: string | null, grantId?: string | null, projectId?: string | null, status?: string | null } | null } | null };

export type UpdateProjectFundingMutationVariables = Exact<{
  input: UpdateProjectFundingInput;
}>;


export type UpdateProjectFundingMutation = { __typename?: 'Mutation', updateProjectFunding?: { __typename?: 'ProjectFunding', errors?: { __typename?: 'ProjectFundingErrors', affiliationId?: string | null, funderOpportunityNumber?: string | null, funderProjectNumber?: string | null, general?: string | null, grantId?: string | null, projectId?: string | null, status?: string | null } | null } | null };

export type UpdateProjectMemberMutationVariables = Exact<{
  input: UpdateProjectMemberInput;
}>;


export type UpdateProjectMemberMutation = { __typename?: 'Mutation', updateProjectMember?: { __typename?: 'ProjectMember', givenName?: string | null, surName?: string | null, orcid?: string | null, id?: number | null, errors?: { __typename?: 'ProjectMemberErrors', email?: string | null, surName?: string | null, general?: string | null, givenName?: string | null, orcid?: string | null, affiliationId?: string | null, memberRoleIds?: string | null } | null } | null };

export type RemoveProjectMemberMutationVariables = Exact<{
  projectMemberId: Scalars['Int']['input'];
}>;


export type RemoveProjectMemberMutation = { __typename?: 'Mutation', removeProjectMember?: { __typename?: 'ProjectMember', errors?: { __typename?: 'ProjectMemberErrors', general?: string | null, email?: string | null, affiliationId?: string | null, givenName?: string | null, orcid?: string | null, surName?: string | null, memberRoleIds?: string | null } | null } | null };

export type AddProjectMutationVariables = Exact<{
  title: Scalars['String']['input'];
  isTestProject?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AddProjectMutation = { __typename?: 'Mutation', addProject?: { __typename?: 'Project', id?: number | null, errors?: { __typename?: 'ProjectErrors', title?: string | null, general?: string | null } | null } | null };

export type UpdateProjectMutationVariables = Exact<{
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject?: { __typename?: 'Project', errors?: { __typename?: 'ProjectErrors', general?: string | null, title?: string | null, abstractText?: string | null, endDate?: string | null, startDate?: string | null, researchDomainId?: string | null } | null } | null };

export type AddQuestionMutationVariables = Exact<{
  input: AddQuestionInput;
}>;


export type AddQuestionMutation = { __typename?: 'Mutation', addQuestion: { __typename?: 'Question', id?: number | null, displayOrder?: number | null, questionText?: string | null, json?: string | null, requirementText?: string | null, guidanceText?: string | null, sampleText?: string | null, useSampleTextAsDefault?: boolean | null, required?: boolean | null, errors?: { __typename?: 'QuestionErrors', general?: string | null, questionText?: string | null } | null } };

export type UpdateQuestionMutationVariables = Exact<{
  input: UpdateQuestionInput;
}>;


export type UpdateQuestionMutation = { __typename?: 'Mutation', updateQuestion: { __typename?: 'Question', id?: number | null, guidanceText?: string | null, isDirty?: boolean | null, required?: boolean | null, json?: string | null, requirementText?: string | null, sampleText?: string | null, useSampleTextAsDefault?: boolean | null, sectionId: number, templateId: number, questionText?: string | null, errors?: { __typename?: 'QuestionErrors', general?: string | null, questionText?: string | null } | null } };

export type RemoveQuestionMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
}>;


export type RemoveQuestionMutation = { __typename?: 'Mutation', removeQuestion?: { __typename?: 'Question', id?: number | null } | null };

export type UpdateQuestionDisplayOrderMutationVariables = Exact<{
  questionId: Scalars['Int']['input'];
  newDisplayOrder: Scalars['Int']['input'];
}>;


export type UpdateQuestionDisplayOrderMutation = { __typename?: 'Mutation', updateQuestionDisplayOrder: { __typename?: 'ReorderQuestionsResult', questions?: Array<{ __typename?: 'Question', id?: number | null, displayOrder?: number | null, questionText?: string | null, sampleText?: string | null, requirementText?: string | null, guidanceText?: string | null, sectionId: number, templateId: number, errors?: { __typename?: 'QuestionErrors', general?: string | null } | null }> | null } };

export type AddSectionMutationVariables = Exact<{
  input: AddSectionInput;
}>;


export type AddSectionMutation = { __typename?: 'Mutation', addSection: { __typename?: 'Section', id?: number | null, guidance?: string | null, displayOrder?: number | null, introduction?: string | null, isDirty: boolean, name: string, requirements?: string | null, tags?: Array<{ __typename?: 'Tag', name: string } | null> | null, errors?: { __typename?: 'SectionErrors', general?: string | null, name?: string | null, displayOrder?: string | null } | null, questions?: Array<{ __typename?: 'Question', id?: number | null, errors?: { __typename?: 'QuestionErrors', general?: string | null, templateId?: string | null, sectionId?: string | null, questionText?: string | null, displayOrder?: string | null } | null }> | null } };

export type UpdateSectionMutationVariables = Exact<{
  input: UpdateSectionInput;
}>;


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSection: { __typename?: 'Section', id?: number | null, name: string, introduction?: string | null, requirements?: string | null, guidance?: string | null, displayOrder?: number | null, bestPractice?: boolean | null, errors?: { __typename?: 'SectionErrors', general?: string | null, name?: string | null, introduction?: string | null, requirements?: string | null, guidance?: string | null } | null, tags?: Array<{ __typename?: 'Tag', id?: number | null, description?: string | null, name: string } | null> | null } };

export type RemoveSectionMutationVariables = Exact<{
  sectionId: Scalars['Int']['input'];
}>;


export type RemoveSectionMutation = { __typename?: 'Mutation', removeSection: { __typename?: 'Section', id?: number | null, name: string } };

export type UpdateSectionDisplayOrderMutationVariables = Exact<{
  sectionId: Scalars['Int']['input'];
  newDisplayOrder: Scalars['Int']['input'];
}>;


export type UpdateSectionDisplayOrderMutation = { __typename?: 'Mutation', updateSectionDisplayOrder: { __typename?: 'ReorderSectionsResult', sections?: Array<{ __typename?: 'Section', id?: number | null, introduction?: string | null, name: string, requirements?: string | null, guidance?: string | null, displayOrder?: number | null, bestPractice?: boolean | null, isDirty: boolean, questions?: Array<{ __typename?: 'Question', displayOrder?: number | null, guidanceText?: string | null, id?: number | null, questionText?: string | null, sectionId: number, templateId: number, errors?: { __typename?: 'QuestionErrors', general?: string | null, templateId?: string | null, sectionId?: string | null, questionText?: string | null, displayOrder?: string | null } | null }> | null, tags?: Array<{ __typename?: 'Tag', id?: number | null, description?: string | null, name: string } | null> | null, errors?: { __typename?: 'SectionErrors', general?: string | null, name?: string | null, displayOrder?: string | null } | null, template?: { __typename?: 'Template', id?: number | null, bestPractice: boolean, isDirty: boolean, languageId: string, name: string, visibility: TemplateVisibility } | null }> | null } };

export type AddTemplateCollaboratorMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
  email: Scalars['String']['input'];
}>;


export type AddTemplateCollaboratorMutation = { __typename?: 'Mutation', addTemplateCollaborator?: { __typename?: 'TemplateCollaborator', email: string, id?: number | null, errors?: { __typename?: 'TemplateCollaboratorErrors', general?: string | null, email?: string | null } | null } | null };

export type RemoveTemplateCollaboratorMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
  email: Scalars['String']['input'];
}>;


export type RemoveTemplateCollaboratorMutation = { __typename?: 'Mutation', removeTemplateCollaborator?: { __typename?: 'TemplateCollaborator', errors?: { __typename?: 'TemplateCollaboratorErrors', general?: string | null, email?: string | null } | null } | null };

export type ArchiveTemplateMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type ArchiveTemplateMutation = { __typename?: 'Mutation', archiveTemplate?: { __typename?: 'Template', id?: number | null, name: string, errors?: { __typename?: 'TemplateErrors', general?: string | null, name?: string | null, ownerId?: string | null } | null } | null };

export type CreateTemplateVersionMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  versionType?: InputMaybe<TemplateVersionType>;
  visibility: TemplateVisibility;
}>;


export type CreateTemplateVersionMutation = { __typename?: 'Mutation', createTemplateVersion?: { __typename?: 'Template', name: string, errors?: { __typename?: 'TemplateErrors', general?: string | null, name?: string | null, ownerId?: string | null } | null } | null };

export type AddTemplateMutationVariables = Exact<{
  name: Scalars['String']['input'];
  copyFromTemplateId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AddTemplateMutation = { __typename?: 'Mutation', addTemplate?: { __typename?: 'Template', id?: number | null, description?: string | null, name: string, errors?: { __typename?: 'TemplateErrors', general?: string | null, name?: string | null, ownerId?: string | null } | null } | null };

export type UpdateTemplateMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  visibility: TemplateVisibility;
}>;


export type UpdateTemplateMutation = { __typename?: 'Mutation', updateTemplate?: { __typename?: 'Template', id?: number | null, name: string, visibility: TemplateVisibility, errors?: { __typename?: 'TemplateErrors', general?: string | null, name?: string | null, description?: string | null } | null } | null };

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export type UpdateUserProfileMutation = { __typename?: 'Mutation', updateUserProfile?: { __typename?: 'User', id?: number | null, givenName?: string | null, surName?: string | null, languageId: string, email?: string | null, errors?: { __typename?: 'UserErrors', general?: string | null, email?: string | null, password?: string | null, role?: string | null } | null, affiliation?: { __typename?: 'Affiliation', id?: number | null, name: string, searchName: string, uri: string } | null } | null };

export type AddUserEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
  isPrimary: Scalars['Boolean']['input'];
}>;


export type AddUserEmailMutation = { __typename?: 'Mutation', addUserEmail?: { __typename?: 'UserEmail', email: string, isPrimary: boolean, isConfirmed: boolean, id?: number | null, userId: number, errors?: { __typename?: 'UserEmailErrors', general?: string | null, userId?: string | null, email?: string | null } | null } | null };

export type RemoveUserEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RemoveUserEmailMutation = { __typename?: 'Mutation', removeUserEmail?: { __typename?: 'UserEmail', errors?: { __typename?: 'UserEmailErrors', general?: string | null, userId?: string | null, email?: string | null } | null } | null };

export type SetPrimaryUserEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type SetPrimaryUserEmailMutation = { __typename?: 'Mutation', setPrimaryUserEmail?: Array<{ __typename?: 'UserEmail', id?: number | null, email: string, isConfirmed: boolean, isPrimary: boolean, userId: number, errors?: { __typename?: 'UserEmailErrors', general?: string | null, userId?: string | null, email?: string | null } | null } | null> | null };

export type AffiliationsQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AffiliationsQuery = { __typename?: 'Query', affiliations?: { __typename?: 'AffiliationSearchResults', totalCount?: number | null, nextCursor?: string | null, items?: Array<{ __typename?: 'AffiliationSearch', id: number, displayName: string, uri: string, apiTarget?: string | null } | null> | null } | null };

export type AffiliationFundersQueryVariables = Exact<{
  name: Scalars['String']['input'];
  funderOnly?: InputMaybe<Scalars['Boolean']['input']>;
  paginationOptions?: InputMaybe<PaginationOptions>;
}>;


export type AffiliationFundersQuery = { __typename?: 'Query', affiliations?: { __typename?: 'AffiliationSearchResults', totalCount?: number | null, nextCursor?: string | null, items?: Array<{ __typename?: 'AffiliationSearch', id: number, displayName: string, apiTarget?: string | null, uri: string } | null> | null } | null };

export type AnswerByVersionedQuestionIdQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
  planId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
}>;


export type AnswerByVersionedQuestionIdQuery = { __typename?: 'Query', answerByVersionedQuestionId?: { __typename?: 'Answer', id?: number | null, json?: string | null, modified?: string | null, versionedQuestion?: { __typename?: 'VersionedQuestion', id?: number | null } | null, plan?: { __typename?: 'Plan', id?: number | null } | null, errors?: { __typename?: 'AffiliationErrors', general?: string | null, planId?: string | null, versionedSectionId?: string | null, versionedQuestionId?: string | null, json?: string | null } | null } | null };

export type ProjectFundingsQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
}>;


export type ProjectFundingsQuery = { __typename?: 'Query', projectFundings?: Array<{ __typename?: 'ProjectFunding', id?: number | null, status?: ProjectFundingStatus | null, grantId?: string | null, funderOpportunityNumber?: string | null, funderProjectNumber?: string | null, affiliation?: { __typename?: 'Affiliation', displayName: string, uri: string } | null } | null> | null };

export type PlanFundingsQueryVariables = Exact<{
  planId: Scalars['Int']['input'];
}>;


export type PlanFundingsQuery = { __typename?: 'Query', planFundings?: Array<{ __typename?: 'PlanFunding', id?: number | null, projectFunding?: { __typename?: 'ProjectFunding', id?: number | null } | null } | null> | null };

export type PopularFundersQueryVariables = Exact<{ [key: string]: never; }>;


export type PopularFundersQuery = { __typename?: 'Query', popularFunders?: Array<{ __typename?: 'FunderPopularityResult', displayName: string, id: number, nbrPlans: number, uri: string, apiTarget?: string | null } | null> | null };

export type LanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type LanguagesQuery = { __typename?: 'Query', languages?: Array<{ __typename?: 'Language', id: string, isDefault: boolean, name: string } | null> | null };

export type MemberRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type MemberRolesQuery = { __typename?: 'Query', memberRoles?: Array<{ __typename?: 'MemberRole', id?: number | null, label: string, uri: string, description?: string | null, displayOrder: number } | null> | null };

export type PlanQueryVariables = Exact<{
  planId: Scalars['Int']['input'];
}>;


export type PlanQuery = { __typename?: 'Query', plan?: { __typename?: 'Plan', id?: number | null, visibility?: PlanVisibility | null, status?: PlanStatus | null, created?: string | null, modified?: string | null, dmpId?: string | null, registered?: string | null, title?: string | null, versionedTemplate?: { __typename?: 'VersionedTemplate', name: string, template?: { __typename?: 'Template', id?: number | null, name: string } | null } | null, fundings?: Array<{ __typename?: 'PlanFunding', id?: number | null, projectFunding?: { __typename?: 'ProjectFunding', affiliation?: { __typename?: 'Affiliation', displayName: string } | null } | null }> | null, project?: { __typename?: 'Project', title: string, fundings?: Array<{ __typename?: 'ProjectFunding', funderOpportunityNumber?: string | null, affiliation?: { __typename?: 'Affiliation', displayName: string, name: string } | null }> | null } | null, members?: Array<{ __typename?: 'PlanMember', isPrimaryContact?: boolean | null, projectMember?: { __typename?: 'ProjectMember', givenName?: string | null, surName?: string | null, email?: string | null, orcid?: string | null, memberRoles?: Array<{ __typename?: 'MemberRole', label: string }> | null } | null }> | null, versionedSections?: Array<{ __typename?: 'PlanSectionProgress', answeredQuestions: number, displayOrder: number, versionedSectionId: number, title: string, totalQuestions: number }> | null } | null };

export type PlanMembersQueryVariables = Exact<{
  planId: Scalars['Int']['input'];
}>;


export type PlanMembersQuery = { __typename?: 'Query', planMembers?: Array<{ __typename?: 'PlanMember', id?: number | null, isPrimaryContact?: boolean | null, errors?: { __typename?: 'PlanMemberErrors', general?: string | null } | null, projectMember?: { __typename?: 'ProjectMember', id?: number | null, givenName?: string | null, surName?: string | null } | null, memberRoles?: Array<{ __typename?: 'MemberRole', uri: string, id?: number | null, label: string, description?: string | null, displayOrder: number }> | null } | null> | null };

export type ProjectFundingQueryVariables = Exact<{
  projectFundingId: Scalars['Int']['input'];
}>;


export type ProjectFundingQuery = { __typename?: 'Query', projectFunding?: { __typename?: 'ProjectFunding', status?: ProjectFundingStatus | null, grantId?: string | null, funderOpportunityNumber?: string | null, funderProjectNumber?: string | null, affiliation?: { __typename?: 'Affiliation', name: string, displayName: string } | null } | null };

export type ProjectMembersQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
}>;


export type ProjectMembersQuery = { __typename?: 'Query', projectMembers?: Array<{ __typename?: 'ProjectMember', id?: number | null, givenName?: string | null, surName?: string | null, orcid?: string | null, memberRoles?: Array<{ __typename?: 'MemberRole', id?: number | null, label: string, description?: string | null }> | null, affiliation?: { __typename?: 'Affiliation', displayName: string } | null } | null> | null };

export type ProjectMemberQueryVariables = Exact<{
  projectMemberId: Scalars['Int']['input'];
}>;


export type ProjectMemberQuery = { __typename?: 'Query', projectMember?: { __typename?: 'ProjectMember', email?: string | null, givenName?: string | null, surName?: string | null, orcid?: string | null, memberRoles?: Array<{ __typename?: 'MemberRole', id?: number | null, label: string, displayOrder: number, uri: string }> | null, affiliation?: { __typename?: 'Affiliation', id?: number | null, displayName: string, uri: string } | null } | null };

export type MyProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyProjectsQuery = { __typename?: 'Query', myProjects?: { __typename?: 'ProjectSearchResults', totalCount?: number | null, nextCursor?: string | null, items?: Array<{ __typename?: 'ProjectSearchResult', title?: string | null, id?: number | null, startDate?: string | null, endDate?: string | null, fundings?: Array<{ __typename?: 'ProjectSearchResultFunding', name?: string | null, grantId?: string | null }> | null, members?: Array<{ __typename?: 'ProjectSearchResultMember', name?: string | null, role?: string | null, orcid?: string | null }> | null, errors?: { __typename?: 'ProjectErrors', general?: string | null, title?: string | null } | null } | null> | null } | null };

export type ProjectQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
}>;


export type ProjectQuery = { __typename?: 'Query', project?: { __typename?: 'Project', title: string, abstractText?: string | null, startDate?: string | null, endDate?: string | null, isTestProject?: boolean | null, fundings?: Array<{ __typename?: 'ProjectFunding', id?: number | null, grantId?: string | null, affiliation?: { __typename?: 'Affiliation', name: string, displayName: string, searchName: string } | null }> | null, members?: Array<{ __typename?: 'ProjectMember', givenName?: string | null, surName?: string | null, email?: string | null, memberRoles?: Array<{ __typename?: 'MemberRole', description?: string | null, displayOrder: number, label: string, uri: string }> | null }> | null, outputs?: Array<{ __typename?: 'ProjectOutput', title: string }> | null, researchDomain?: { __typename?: 'ResearchDomain', id?: number | null, parentResearchDomainId?: number | null } | null, plans?: Array<{ __typename?: 'PlanSearchResult', templateTitle?: string | null, id?: number | null, funding?: string | null, dmpId?: string | null, modified?: string | null, created?: string | null, versionedSections?: Array<{ __typename?: 'PlanSectionProgress', answeredQuestions: number, displayOrder: number, versionedSectionId: number, title: string, totalQuestions: number }> | null }> | null } | null };

export type QuestionTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type QuestionTypesQuery = { __typename?: 'Query', questionTypes?: Array<{ __typename?: 'QuestionType', id?: number | null, name: string, usageDescription: string, json: string, errors?: { __typename?: 'QuestionTypeErrors', general?: string | null, name?: string | null, usageDescription?: string | null } | null } | null> | null };

export type QuestionsDisplayOrderQueryVariables = Exact<{
  sectionId: Scalars['Int']['input'];
}>;


export type QuestionsDisplayOrderQuery = { __typename?: 'Query', questions?: Array<{ __typename?: 'Question', displayOrder?: number | null } | null> | null };

export type PlanSectionQuestionsQueryVariables = Exact<{
  sectionId: Scalars['Int']['input'];
}>;


export type PlanSectionQuestionsQuery = { __typename?: 'Query', questions?: Array<{ __typename?: 'Question', id?: number | null, questionText?: string | null, displayOrder?: number | null, guidanceText?: string | null, requirementText?: string | null, sampleText?: string | null, sectionId: number, templateId: number, isDirty?: boolean | null } | null> | null };

export type QuestionQueryVariables = Exact<{
  questionId: Scalars['Int']['input'];
}>;


export type QuestionQuery = { __typename?: 'Query', question?: { __typename?: 'Question', id?: number | null, guidanceText?: string | null, displayOrder?: number | null, questionText?: string | null, json?: string | null, requirementText?: string | null, sampleText?: string | null, useSampleTextAsDefault?: boolean | null, sectionId: number, templateId: number, isDirty?: boolean | null, required?: boolean | null, errors?: { __typename?: 'QuestionErrors', general?: string | null, questionText?: string | null, requirementText?: string | null, sampleText?: string | null, displayOrder?: string | null, questionConditionIds?: string | null, sectionId?: string | null, templateId?: string | null } | null } | null };

export type PublishedQuestionsQueryVariables = Exact<{
  versionedSectionId: Scalars['Int']['input'];
}>;


export type PublishedQuestionsQuery = { __typename?: 'Query', publishedQuestions?: Array<{ __typename?: 'VersionedQuestion', id?: number | null, questionText?: string | null, displayOrder?: number | null, guidanceText?: string | null, requirementText?: string | null, sampleText?: string | null, versionedSectionId: number, versionedTemplateId: number } | null> | null };

export type PublishedQuestionQueryVariables = Exact<{
  versionedQuestionId: Scalars['Int']['input'];
}>;


export type PublishedQuestionQuery = { __typename?: 'Query', publishedQuestion?: { __typename?: 'VersionedQuestion', id?: number | null, guidanceText?: string | null, displayOrder?: number | null, questionText?: string | null, json?: string | null, requirementText?: string | null, sampleText?: string | null, versionedSectionId: number, versionedTemplateId: number, required?: boolean | null, errors?: { __typename?: 'VersionedQuestionErrors', general?: string | null, questionText?: string | null, requirementText?: string | null, sampleText?: string | null, displayOrder?: string | null, versionedSectionId?: string | null } | null } | null };

export type TopLevelResearchDomainsQueryVariables = Exact<{ [key: string]: never; }>;


export type TopLevelResearchDomainsQuery = { __typename?: 'Query', topLevelResearchDomains?: Array<{ __typename?: 'ResearchDomain', name: string, id?: number | null } | null> | null };

export type ChildResearchDomainsQueryVariables = Exact<{
  parentResearchDomainId: Scalars['Int']['input'];
}>;


export type ChildResearchDomainsQuery = { __typename?: 'Query', childResearchDomains?: Array<{ __typename?: 'ResearchDomain', id?: number | null, name: string } | null> | null };

export type SectionVersionsQueryVariables = Exact<{
  sectionId: Scalars['Int']['input'];
}>;


export type SectionVersionsQuery = { __typename?: 'Query', sectionVersions?: Array<{ __typename?: 'VersionedSection', id?: number | null, versionedQuestions?: Array<{ __typename?: 'VersionedQuestion', id?: number | null, questionText?: string | null, json?: string | null, questionId: number }> | null, section?: { __typename?: 'Section', id?: number | null } | null } | null> | null };

export type SectionsDisplayOrderQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type SectionsDisplayOrderQuery = { __typename?: 'Query', sections?: Array<{ __typename?: 'Section', displayOrder?: number | null } | null> | null };

export type PublishedSectionsQueryVariables = Exact<{
  term: Scalars['String']['input'];
}>;


export type PublishedSectionsQuery = { __typename?: 'Query', publishedSections?: { __typename?: 'VersionedSectionSearchResults', totalCount?: number | null, nextCursor?: string | null, items?: Array<{ __typename?: 'VersionedSectionSearchResult', id?: number | null, name: string, displayOrder: number, bestPractice?: boolean | null, modified?: string | null, created?: string | null, versionedTemplateId?: number | null, versionedTemplateName?: string | null, versionedQuestionCount?: number | null } | null> | null } | null };

export type PublishedSectionQueryVariables = Exact<{
  versionedSectionId: Scalars['Int']['input'];
}>;


export type PublishedSectionQuery = { __typename?: 'Query', publishedSection?: { __typename?: 'VersionedSection', id?: number | null, introduction?: string | null, name: string, requirements?: string | null, guidance?: string | null, displayOrder: number, tags?: Array<{ __typename?: 'Tag', id?: number | null, description?: string | null, name: string } | null> | null, errors?: { __typename?: 'VersionedSectionErrors', general?: string | null, name?: string | null, displayOrder?: string | null } | null } | null };

export type SectionQueryVariables = Exact<{
  sectionId: Scalars['Int']['input'];
}>;


export type SectionQuery = { __typename?: 'Query', section?: { __typename?: 'Section', id?: number | null, introduction?: string | null, name: string, requirements?: string | null, guidance?: string | null, displayOrder?: number | null, bestPractice?: boolean | null, isDirty: boolean, questions?: Array<{ __typename?: 'Question', displayOrder?: number | null, guidanceText?: string | null, id?: number | null, questionText?: string | null, sectionId: number, templateId: number, errors?: { __typename?: 'QuestionErrors', general?: string | null, templateId?: string | null, sectionId?: string | null, questionText?: string | null, displayOrder?: string | null } | null }> | null, tags?: Array<{ __typename?: 'Tag', id?: number | null, description?: string | null, name: string } | null> | null, errors?: { __typename?: 'SectionErrors', general?: string | null, name?: string | null, displayOrder?: string | null } | null, template?: { __typename?: 'Template', id?: number | null, bestPractice: boolean, isDirty: boolean, languageId: string, name: string, visibility: TemplateVisibility } | null } | null };

export type TagsQueryVariables = Exact<{ [key: string]: never; }>;


export type TagsQuery = { __typename?: 'Query', tags: Array<{ __typename?: 'Tag', id?: number | null, name: string, description?: string | null }> };

export type TemplateVersionsQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type TemplateVersionsQuery = { __typename?: 'Query', templateVersions?: Array<{ __typename?: 'VersionedTemplate', name: string, version: string, versionType?: TemplateVersionType | null, created?: string | null, comment?: string | null, id?: number | null, modified?: string | null, versionedBy?: { __typename?: 'User', givenName?: string | null, surName?: string | null, modified?: string | null, affiliation?: { __typename?: 'Affiliation', displayName: string } | null } | null } | null> | null };

export type MyVersionedTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyVersionedTemplatesQuery = { __typename?: 'Query', myVersionedTemplates?: Array<{ __typename?: 'VersionedTemplateSearchResult', id?: number | null, templateId?: number | null, name?: string | null, description?: string | null, visibility?: TemplateVisibility | null, bestPractice?: boolean | null, version?: string | null, modified?: string | null, modifiedById?: number | null, modifiedByName?: string | null, ownerId?: number | null, ownerURI?: string | null, ownerDisplayName?: string | null, ownerSearchName?: string | null } | null> | null };

export type PublishedTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type PublishedTemplatesQuery = { __typename?: 'Query', publishedTemplates?: { __typename?: 'PublishedTemplateSearchResults', totalCount?: number | null, nextCursor?: string | null, items?: Array<{ __typename?: 'VersionedTemplateSearchResult', id?: number | null, templateId?: number | null, name?: string | null, description?: string | null, visibility?: TemplateVisibility | null, bestPractice?: boolean | null, version?: string | null, modified?: string | null, modifiedById?: number | null, modifiedByName?: string | null, ownerId?: number | null, ownerURI?: string | null, ownerDisplayName?: string | null, ownerSearchName?: string | null } | null> | null } | null };

export type TemplatesQueryVariables = Exact<{
  term?: InputMaybe<Scalars['String']['input']>;
}>;


export type TemplatesQuery = { __typename?: 'Query', myTemplates?: { __typename?: 'TemplateSearchResults', totalCount?: number | null, nextCursor?: string | null, items?: Array<{ __typename?: 'TemplateSearchResult', id?: number | null, name?: string | null, description?: string | null, visibility?: TemplateVisibility | null, isDirty?: boolean | null, latestPublishVersion?: string | null, latestPublishDate?: string | null, ownerId?: string | null, ownerDisplayName?: string | null, modified?: string | null, modifiedById?: number | null, modifiedByName?: string | null } | null> | null } | null };

export type TemplateQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type TemplateQuery = { __typename?: 'Query', template?: { __typename?: 'Template', id?: number | null, name: string, description?: string | null, latestPublishVersion?: string | null, latestPublishDate?: string | null, created?: string | null, visibility: TemplateVisibility, bestPractice: boolean, isDirty: boolean, errors?: { __typename?: 'TemplateErrors', general?: string | null, name?: string | null, ownerId?: string | null } | null, sections?: Array<{ __typename?: 'Section', id?: number | null, name: string, bestPractice?: boolean | null, displayOrder?: number | null, isDirty: boolean, questions?: Array<{ __typename?: 'Question', displayOrder?: number | null, guidanceText?: string | null, id?: number | null, questionText?: string | null, sectionId: number, templateId: number, errors?: { __typename?: 'QuestionErrors', general?: string | null, templateId?: string | null, sectionId?: string | null, questionText?: string | null, displayOrder?: string | null } | null }> | null } | null> | null, owner?: { __typename?: 'Affiliation', displayName: string, id?: number | null } | null } | null };

export type TemplateCollaboratorsQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type TemplateCollaboratorsQuery = { __typename?: 'Query', template?: { __typename?: 'Template', id?: number | null, name: string, collaborators?: Array<{ __typename?: 'TemplateCollaborator', email: string, id?: number | null, user?: { __typename?: 'User', id?: number | null, email?: string | null, givenName?: string | null, surName?: string | null } | null }> | null, admins?: Array<{ __typename?: 'User', givenName?: string | null, surName?: string | null, email?: string | null }> | null, owner?: { __typename?: 'Affiliation', name: string } | null } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id?: number | null, givenName?: string | null, surName?: string | null, languageId: string, emails?: Array<{ __typename?: 'UserEmail', id?: number | null, email: string, isPrimary: boolean, isConfirmed: boolean } | null> | null, errors?: { __typename?: 'UserErrors', general?: string | null, email?: string | null, password?: string | null, role?: string | null } | null, affiliation?: { __typename?: 'Affiliation', id?: number | null, name: string, searchName: string, uri: string } | null } | null };


export const AddAffiliationDocument = gql`
    mutation AddAffiliation($input: AffiliationInput!) {
  addAffiliation(input: $input) {
    errors {
      name
    }
    uri
  }
}
    `;
export type AddAffiliationMutationFn = Apollo.MutationFunction<AddAffiliationMutation, AddAffiliationMutationVariables>;

/**
 * __useAddAffiliationMutation__
 *
 * To run a mutation, you first call `useAddAffiliationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddAffiliationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addAffiliationMutation, { data, loading, error }] = useAddAffiliationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddAffiliationMutation(baseOptions?: Apollo.MutationHookOptions<AddAffiliationMutation, AddAffiliationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddAffiliationMutation, AddAffiliationMutationVariables>(AddAffiliationDocument, options);
      }
export type AddAffiliationMutationHookResult = ReturnType<typeof useAddAffiliationMutation>;
export type AddAffiliationMutationResult = Apollo.MutationResult<AddAffiliationMutation>;
export type AddAffiliationMutationOptions = Apollo.BaseMutationOptions<AddAffiliationMutation, AddAffiliationMutationVariables>;
export const AddAnswerDocument = gql`
    mutation AddAnswer($planId: Int!, $versionedSectionId: Int!, $versionedQuestionId: Int!, $json: String!) {
  addAnswer(
    planId: $planId
    versionedSectionId: $versionedSectionId
    versionedQuestionId: $versionedQuestionId
    json: $json
  ) {
    id
    json
    modified
  }
}
    `;
export type AddAnswerMutationFn = Apollo.MutationFunction<AddAnswerMutation, AddAnswerMutationVariables>;

/**
 * __useAddAnswerMutation__
 *
 * To run a mutation, you first call `useAddAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addAnswerMutation, { data, loading, error }] = useAddAnswerMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      versionedSectionId: // value for 'versionedSectionId'
 *      versionedQuestionId: // value for 'versionedQuestionId'
 *      json: // value for 'json'
 *   },
 * });
 */
export function useAddAnswerMutation(baseOptions?: Apollo.MutationHookOptions<AddAnswerMutation, AddAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddAnswerMutation, AddAnswerMutationVariables>(AddAnswerDocument, options);
      }
export type AddAnswerMutationHookResult = ReturnType<typeof useAddAnswerMutation>;
export type AddAnswerMutationResult = Apollo.MutationResult<AddAnswerMutation>;
export type AddAnswerMutationOptions = Apollo.BaseMutationOptions<AddAnswerMutation, AddAnswerMutationVariables>;
export const UpdateAnswerDocument = gql`
    mutation UpdateAnswer($answerId: Int!, $json: String) {
  updateAnswer(answerId: $answerId, json: $json) {
    errors {
      acronyms
      aliases
      contactEmail
      contactName
      displayName
      feedbackEmails
      feedbackMessage
      fundrefId
      general
      homepage
      json
      logoName
      logoURI
      name
      planId
      provenance
      searchName
      ssoEntityId
      subHeaderLinks
      types
      uri
      versionedQuestionId
      versionedSectionId
    }
    id
    json
    modified
    versionedQuestion {
      versionedSectionId
    }
  }
}
    `;
export type UpdateAnswerMutationFn = Apollo.MutationFunction<UpdateAnswerMutation, UpdateAnswerMutationVariables>;

/**
 * __useUpdateAnswerMutation__
 *
 * To run a mutation, you first call `useUpdateAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAnswerMutation, { data, loading, error }] = useUpdateAnswerMutation({
 *   variables: {
 *      answerId: // value for 'answerId'
 *      json: // value for 'json'
 *   },
 * });
 */
export function useUpdateAnswerMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAnswerMutation, UpdateAnswerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAnswerMutation, UpdateAnswerMutationVariables>(UpdateAnswerDocument, options);
      }
export type UpdateAnswerMutationHookResult = ReturnType<typeof useUpdateAnswerMutation>;
export type UpdateAnswerMutationResult = Apollo.MutationResult<UpdateAnswerMutation>;
export type UpdateAnswerMutationOptions = Apollo.BaseMutationOptions<UpdateAnswerMutation, UpdateAnswerMutationVariables>;
export const AddPlanDocument = gql`
    mutation AddPlan($projectId: Int!, $versionedTemplateId: Int!) {
  addPlan(projectId: $projectId, versionedTemplateId: $versionedTemplateId) {
    id
  }
}
    `;
export type AddPlanMutationFn = Apollo.MutationFunction<AddPlanMutation, AddPlanMutationVariables>;

/**
 * __useAddPlanMutation__
 *
 * To run a mutation, you first call `useAddPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPlanMutation, { data, loading, error }] = useAddPlanMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      versionedTemplateId: // value for 'versionedTemplateId'
 *   },
 * });
 */
export function useAddPlanMutation(baseOptions?: Apollo.MutationHookOptions<AddPlanMutation, AddPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddPlanMutation, AddPlanMutationVariables>(AddPlanDocument, options);
      }
export type AddPlanMutationHookResult = ReturnType<typeof useAddPlanMutation>;
export type AddPlanMutationResult = Apollo.MutationResult<AddPlanMutation>;
export type AddPlanMutationOptions = Apollo.BaseMutationOptions<AddPlanMutation, AddPlanMutationVariables>;
export const AddPlanMemberDocument = gql`
    mutation AddPlanMember($planId: Int!, $projectMemberId: Int!) {
  addPlanMember(planId: $planId, projectMemberId: $projectMemberId) {
    errors {
      general
      memberRoleIds
      primaryContact
      projectMemberId
      projectId
    }
    id
    isPrimaryContact
  }
}
    `;
export type AddPlanMemberMutationFn = Apollo.MutationFunction<AddPlanMemberMutation, AddPlanMemberMutationVariables>;

/**
 * __useAddPlanMemberMutation__
 *
 * To run a mutation, you first call `useAddPlanMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPlanMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPlanMemberMutation, { data, loading, error }] = useAddPlanMemberMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      projectMemberId: // value for 'projectMemberId'
 *   },
 * });
 */
export function useAddPlanMemberMutation(baseOptions?: Apollo.MutationHookOptions<AddPlanMemberMutation, AddPlanMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddPlanMemberMutation, AddPlanMemberMutationVariables>(AddPlanMemberDocument, options);
      }
export type AddPlanMemberMutationHookResult = ReturnType<typeof useAddPlanMemberMutation>;
export type AddPlanMemberMutationResult = Apollo.MutationResult<AddPlanMemberMutation>;
export type AddPlanMemberMutationOptions = Apollo.BaseMutationOptions<AddPlanMemberMutation, AddPlanMemberMutationVariables>;
export const RemovePlanMemberDocument = gql`
    mutation RemovePlanMember($planMemberId: Int!) {
  removePlanMember(planMemberId: $planMemberId) {
    errors {
      general
      primaryContact
      projectMemberId
      projectId
      memberRoleIds
    }
    id
    isPrimaryContact
  }
}
    `;
export type RemovePlanMemberMutationFn = Apollo.MutationFunction<RemovePlanMemberMutation, RemovePlanMemberMutationVariables>;

/**
 * __useRemovePlanMemberMutation__
 *
 * To run a mutation, you first call `useRemovePlanMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePlanMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePlanMemberMutation, { data, loading, error }] = useRemovePlanMemberMutation({
 *   variables: {
 *      planMemberId: // value for 'planMemberId'
 *   },
 * });
 */
export function useRemovePlanMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemovePlanMemberMutation, RemovePlanMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemovePlanMemberMutation, RemovePlanMemberMutationVariables>(RemovePlanMemberDocument, options);
      }
export type RemovePlanMemberMutationHookResult = ReturnType<typeof useRemovePlanMemberMutation>;
export type RemovePlanMemberMutationResult = Apollo.MutationResult<RemovePlanMemberMutation>;
export type RemovePlanMemberMutationOptions = Apollo.BaseMutationOptions<RemovePlanMemberMutation, RemovePlanMemberMutationVariables>;
export const UpdatePlanMemberDocument = gql`
    mutation UpdatePlanMember($planId: Int!, $planMemberId: Int!, $isPrimaryContact: Boolean, $memberRoleIds: [Int!]) {
  updatePlanMember(
    planId: $planId
    planMemberId: $planMemberId
    memberRoleIds: $memberRoleIds
    isPrimaryContact: $isPrimaryContact
  ) {
    id
    errors {
      general
    }
  }
}
    `;
export type UpdatePlanMemberMutationFn = Apollo.MutationFunction<UpdatePlanMemberMutation, UpdatePlanMemberMutationVariables>;

/**
 * __useUpdatePlanMemberMutation__
 *
 * To run a mutation, you first call `useUpdatePlanMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlanMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlanMemberMutation, { data, loading, error }] = useUpdatePlanMemberMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      planMemberId: // value for 'planMemberId'
 *      isPrimaryContact: // value for 'isPrimaryContact'
 *      memberRoleIds: // value for 'memberRoleIds'
 *   },
 * });
 */
export function useUpdatePlanMemberMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlanMemberMutation, UpdatePlanMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlanMemberMutation, UpdatePlanMemberMutationVariables>(UpdatePlanMemberDocument, options);
      }
export type UpdatePlanMemberMutationHookResult = ReturnType<typeof useUpdatePlanMemberMutation>;
export type UpdatePlanMemberMutationResult = Apollo.MutationResult<UpdatePlanMemberMutation>;
export type UpdatePlanMemberMutationOptions = Apollo.BaseMutationOptions<UpdatePlanMemberMutation, UpdatePlanMemberMutationVariables>;
export const PublishPlanDocument = gql`
    mutation PublishPlan($planId: Int!, $visibility: PlanVisibility) {
  publishPlan(planId: $planId, visibility: $visibility) {
    errors {
      general
      visibility
      status
    }
    visibility
    status
  }
}
    `;
export type PublishPlanMutationFn = Apollo.MutationFunction<PublishPlanMutation, PublishPlanMutationVariables>;

/**
 * __usePublishPlanMutation__
 *
 * To run a mutation, you first call `usePublishPlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishPlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishPlanMutation, { data, loading, error }] = usePublishPlanMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function usePublishPlanMutation(baseOptions?: Apollo.MutationHookOptions<PublishPlanMutation, PublishPlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishPlanMutation, PublishPlanMutationVariables>(PublishPlanDocument, options);
      }
export type PublishPlanMutationHookResult = ReturnType<typeof usePublishPlanMutation>;
export type PublishPlanMutationResult = Apollo.MutationResult<PublishPlanMutation>;
export type PublishPlanMutationOptions = Apollo.BaseMutationOptions<PublishPlanMutation, PublishPlanMutationVariables>;
export const UpdatePlanStatusDocument = gql`
    mutation UpdatePlanStatus($planId: Int!, $status: PlanStatus!) {
  updatePlanStatus(planId: $planId, status: $status) {
    errors {
      general
      status
    }
    id
    status
    visibility
  }
}
    `;
export type UpdatePlanStatusMutationFn = Apollo.MutationFunction<UpdatePlanStatusMutation, UpdatePlanStatusMutationVariables>;

/**
 * __useUpdatePlanStatusMutation__
 *
 * To run a mutation, you first call `useUpdatePlanStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlanStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlanStatusMutation, { data, loading, error }] = useUpdatePlanStatusMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdatePlanStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlanStatusMutation, UpdatePlanStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlanStatusMutation, UpdatePlanStatusMutationVariables>(UpdatePlanStatusDocument, options);
      }
export type UpdatePlanStatusMutationHookResult = ReturnType<typeof useUpdatePlanStatusMutation>;
export type UpdatePlanStatusMutationResult = Apollo.MutationResult<UpdatePlanStatusMutation>;
export type UpdatePlanStatusMutationOptions = Apollo.BaseMutationOptions<UpdatePlanStatusMutation, UpdatePlanStatusMutationVariables>;
export const UpdatePlanTitleDocument = gql`
    mutation UpdatePlanTitle($planId: Int!, $title: String!) {
  updatePlanTitle(planId: $planId, title: $title) {
    errors {
      general
      title
    }
    id
    title
  }
}
    `;
export type UpdatePlanTitleMutationFn = Apollo.MutationFunction<UpdatePlanTitleMutation, UpdatePlanTitleMutationVariables>;

/**
 * __useUpdatePlanTitleMutation__
 *
 * To run a mutation, you first call `useUpdatePlanTitleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlanTitleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlanTitleMutation, { data, loading, error }] = useUpdatePlanTitleMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useUpdatePlanTitleMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlanTitleMutation, UpdatePlanTitleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlanTitleMutation, UpdatePlanTitleMutationVariables>(UpdatePlanTitleDocument, options);
      }
export type UpdatePlanTitleMutationHookResult = ReturnType<typeof useUpdatePlanTitleMutation>;
export type UpdatePlanTitleMutationResult = Apollo.MutationResult<UpdatePlanTitleMutation>;
export type UpdatePlanTitleMutationOptions = Apollo.BaseMutationOptions<UpdatePlanTitleMutation, UpdatePlanTitleMutationVariables>;
export const UpdatePlanFundingDocument = gql`
    mutation UpdatePlanFunding($planId: Int!, $projectFundingIds: [Int!]!) {
  updatePlanFunding(planId: $planId, projectFundingIds: $projectFundingIds) {
    errors {
      ProjectFundingId
      general
    }
    projectFunding {
      id
    }
  }
}
    `;
export type UpdatePlanFundingMutationFn = Apollo.MutationFunction<UpdatePlanFundingMutation, UpdatePlanFundingMutationVariables>;

/**
 * __useUpdatePlanFundingMutation__
 *
 * To run a mutation, you first call `useUpdatePlanFundingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePlanFundingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePlanFundingMutation, { data, loading, error }] = useUpdatePlanFundingMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      projectFundingIds: // value for 'projectFundingIds'
 *   },
 * });
 */
export function useUpdatePlanFundingMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePlanFundingMutation, UpdatePlanFundingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePlanFundingMutation, UpdatePlanFundingMutationVariables>(UpdatePlanFundingDocument, options);
      }
export type UpdatePlanFundingMutationHookResult = ReturnType<typeof useUpdatePlanFundingMutation>;
export type UpdatePlanFundingMutationResult = Apollo.MutationResult<UpdatePlanFundingMutation>;
export type UpdatePlanFundingMutationOptions = Apollo.BaseMutationOptions<UpdatePlanFundingMutation, UpdatePlanFundingMutationVariables>;
export const AddProjectCollaboratorDocument = gql`
    mutation addProjectCollaborator($projectId: Int!, $email: String!, $accessLevel: ProjectCollaboratorAccessLevel) {
  addProjectCollaborator(
    projectId: $projectId
    email: $email
    accessLevel: $accessLevel
  ) {
    id
    errors {
      general
      email
    }
    email
    user {
      givenName
      surName
      affiliation {
        uri
      }
      orcid
    }
  }
}
    `;
export type AddProjectCollaboratorMutationFn = Apollo.MutationFunction<AddProjectCollaboratorMutation, AddProjectCollaboratorMutationVariables>;

/**
 * __useAddProjectCollaboratorMutation__
 *
 * To run a mutation, you first call `useAddProjectCollaboratorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProjectCollaboratorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProjectCollaboratorMutation, { data, loading, error }] = useAddProjectCollaboratorMutation({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      email: // value for 'email'
 *      accessLevel: // value for 'accessLevel'
 *   },
 * });
 */
export function useAddProjectCollaboratorMutation(baseOptions?: Apollo.MutationHookOptions<AddProjectCollaboratorMutation, AddProjectCollaboratorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddProjectCollaboratorMutation, AddProjectCollaboratorMutationVariables>(AddProjectCollaboratorDocument, options);
      }
export type AddProjectCollaboratorMutationHookResult = ReturnType<typeof useAddProjectCollaboratorMutation>;
export type AddProjectCollaboratorMutationResult = Apollo.MutationResult<AddProjectCollaboratorMutation>;
export type AddProjectCollaboratorMutationOptions = Apollo.BaseMutationOptions<AddProjectCollaboratorMutation, AddProjectCollaboratorMutationVariables>;
export const AddProjectFundingDocument = gql`
    mutation AddProjectFunding($input: AddProjectFundingInput!) {
  addProjectFunding(input: $input) {
    id
    errors {
      affiliationId
      funderOpportunityNumber
      funderProjectNumber
      general
      grantId
      projectId
      status
    }
  }
}
    `;
export type AddProjectFundingMutationFn = Apollo.MutationFunction<AddProjectFundingMutation, AddProjectFundingMutationVariables>;

/**
 * __useAddProjectFundingMutation__
 *
 * To run a mutation, you first call `useAddProjectFundingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProjectFundingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProjectFundingMutation, { data, loading, error }] = useAddProjectFundingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddProjectFundingMutation(baseOptions?: Apollo.MutationHookOptions<AddProjectFundingMutation, AddProjectFundingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddProjectFundingMutation, AddProjectFundingMutationVariables>(AddProjectFundingDocument, options);
      }
export type AddProjectFundingMutationHookResult = ReturnType<typeof useAddProjectFundingMutation>;
export type AddProjectFundingMutationResult = Apollo.MutationResult<AddProjectFundingMutation>;
export type AddProjectFundingMutationOptions = Apollo.BaseMutationOptions<AddProjectFundingMutation, AddProjectFundingMutationVariables>;
export const UpdateProjectFundingDocument = gql`
    mutation UpdateProjectFunding($input: UpdateProjectFundingInput!) {
  updateProjectFunding(input: $input) {
    errors {
      affiliationId
      funderOpportunityNumber
      funderProjectNumber
      general
      grantId
      projectId
      status
    }
  }
}
    `;
export type UpdateProjectFundingMutationFn = Apollo.MutationFunction<UpdateProjectFundingMutation, UpdateProjectFundingMutationVariables>;

/**
 * __useUpdateProjectFundingMutation__
 *
 * To run a mutation, you first call `useUpdateProjectFundingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectFundingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectFundingMutation, { data, loading, error }] = useUpdateProjectFundingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProjectFundingMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectFundingMutation, UpdateProjectFundingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProjectFundingMutation, UpdateProjectFundingMutationVariables>(UpdateProjectFundingDocument, options);
      }
export type UpdateProjectFundingMutationHookResult = ReturnType<typeof useUpdateProjectFundingMutation>;
export type UpdateProjectFundingMutationResult = Apollo.MutationResult<UpdateProjectFundingMutation>;
export type UpdateProjectFundingMutationOptions = Apollo.BaseMutationOptions<UpdateProjectFundingMutation, UpdateProjectFundingMutationVariables>;
export const UpdateProjectMemberDocument = gql`
    mutation UpdateProjectMember($input: UpdateProjectMemberInput!) {
  updateProjectMember(input: $input) {
    givenName
    surName
    orcid
    id
    errors {
      email
      surName
      general
      givenName
      orcid
      affiliationId
      memberRoleIds
    }
  }
}
    `;
export type UpdateProjectMemberMutationFn = Apollo.MutationFunction<UpdateProjectMemberMutation, UpdateProjectMemberMutationVariables>;

/**
 * __useUpdateProjectMemberMutation__
 *
 * To run a mutation, you first call `useUpdateProjectMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectMemberMutation, { data, loading, error }] = useUpdateProjectMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProjectMemberMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectMemberMutation, UpdateProjectMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProjectMemberMutation, UpdateProjectMemberMutationVariables>(UpdateProjectMemberDocument, options);
      }
export type UpdateProjectMemberMutationHookResult = ReturnType<typeof useUpdateProjectMemberMutation>;
export type UpdateProjectMemberMutationResult = Apollo.MutationResult<UpdateProjectMemberMutation>;
export type UpdateProjectMemberMutationOptions = Apollo.BaseMutationOptions<UpdateProjectMemberMutation, UpdateProjectMemberMutationVariables>;
export const RemoveProjectMemberDocument = gql`
    mutation RemoveProjectMember($projectMemberId: Int!) {
  removeProjectMember(projectMemberId: $projectMemberId) {
    errors {
      general
      email
      affiliationId
      givenName
      orcid
      surName
      memberRoleIds
    }
  }
}
    `;
export type RemoveProjectMemberMutationFn = Apollo.MutationFunction<RemoveProjectMemberMutation, RemoveProjectMemberMutationVariables>;

/**
 * __useRemoveProjectMemberMutation__
 *
 * To run a mutation, you first call `useRemoveProjectMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveProjectMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeProjectMemberMutation, { data, loading, error }] = useRemoveProjectMemberMutation({
 *   variables: {
 *      projectMemberId: // value for 'projectMemberId'
 *   },
 * });
 */
export function useRemoveProjectMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveProjectMemberMutation, RemoveProjectMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveProjectMemberMutation, RemoveProjectMemberMutationVariables>(RemoveProjectMemberDocument, options);
      }
export type RemoveProjectMemberMutationHookResult = ReturnType<typeof useRemoveProjectMemberMutation>;
export type RemoveProjectMemberMutationResult = Apollo.MutationResult<RemoveProjectMemberMutation>;
export type RemoveProjectMemberMutationOptions = Apollo.BaseMutationOptions<RemoveProjectMemberMutation, RemoveProjectMemberMutationVariables>;
export const AddProjectDocument = gql`
    mutation AddProject($title: String!, $isTestProject: Boolean) {
  addProject(title: $title, isTestProject: $isTestProject) {
    id
    errors {
      title
      general
    }
  }
}
    `;
export type AddProjectMutationFn = Apollo.MutationFunction<AddProjectMutation, AddProjectMutationVariables>;

/**
 * __useAddProjectMutation__
 *
 * To run a mutation, you first call `useAddProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProjectMutation, { data, loading, error }] = useAddProjectMutation({
 *   variables: {
 *      title: // value for 'title'
 *      isTestProject: // value for 'isTestProject'
 *   },
 * });
 */
export function useAddProjectMutation(baseOptions?: Apollo.MutationHookOptions<AddProjectMutation, AddProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddProjectMutation, AddProjectMutationVariables>(AddProjectDocument, options);
      }
export type AddProjectMutationHookResult = ReturnType<typeof useAddProjectMutation>;
export type AddProjectMutationResult = Apollo.MutationResult<AddProjectMutation>;
export type AddProjectMutationOptions = Apollo.BaseMutationOptions<AddProjectMutation, AddProjectMutationVariables>;
export const UpdateProjectDocument = gql`
    mutation UpdateProject($input: UpdateProjectInput!) {
  updateProject(input: $input) {
    errors {
      general
      title
      abstractText
      endDate
      startDate
      researchDomainId
    }
  }
}
    `;
export type UpdateProjectMutationFn = Apollo.MutationFunction<UpdateProjectMutation, UpdateProjectMutationVariables>;

/**
 * __useUpdateProjectMutation__
 *
 * To run a mutation, you first call `useUpdateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProjectMutation, { data, loading, error }] = useUpdateProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProjectMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProjectMutation, UpdateProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(UpdateProjectDocument, options);
      }
export type UpdateProjectMutationHookResult = ReturnType<typeof useUpdateProjectMutation>;
export type UpdateProjectMutationResult = Apollo.MutationResult<UpdateProjectMutation>;
export type UpdateProjectMutationOptions = Apollo.BaseMutationOptions<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const AddQuestionDocument = gql`
    mutation AddQuestion($input: AddQuestionInput!) {
  addQuestion(input: $input) {
    errors {
      general
      questionText
    }
    id
    displayOrder
    questionText
    json
    requirementText
    guidanceText
    sampleText
    useSampleTextAsDefault
    required
  }
}
    `;
export type AddQuestionMutationFn = Apollo.MutationFunction<AddQuestionMutation, AddQuestionMutationVariables>;

/**
 * __useAddQuestionMutation__
 *
 * To run a mutation, you first call `useAddQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addQuestionMutation, { data, loading, error }] = useAddQuestionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddQuestionMutation(baseOptions?: Apollo.MutationHookOptions<AddQuestionMutation, AddQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddQuestionMutation, AddQuestionMutationVariables>(AddQuestionDocument, options);
      }
export type AddQuestionMutationHookResult = ReturnType<typeof useAddQuestionMutation>;
export type AddQuestionMutationResult = Apollo.MutationResult<AddQuestionMutation>;
export type AddQuestionMutationOptions = Apollo.BaseMutationOptions<AddQuestionMutation, AddQuestionMutationVariables>;
export const UpdateQuestionDocument = gql`
    mutation UpdateQuestion($input: UpdateQuestionInput!) {
  updateQuestion(input: $input) {
    id
    guidanceText
    errors {
      general
      questionText
    }
    isDirty
    required
    json
    requirementText
    sampleText
    useSampleTextAsDefault
    sectionId
    templateId
    questionText
  }
}
    `;
export type UpdateQuestionMutationFn = Apollo.MutationFunction<UpdateQuestionMutation, UpdateQuestionMutationVariables>;

/**
 * __useUpdateQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionMutation, { data, loading, error }] = useUpdateQuestionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateQuestionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuestionMutation, UpdateQuestionMutationVariables>(UpdateQuestionDocument, options);
      }
export type UpdateQuestionMutationHookResult = ReturnType<typeof useUpdateQuestionMutation>;
export type UpdateQuestionMutationResult = Apollo.MutationResult<UpdateQuestionMutation>;
export type UpdateQuestionMutationOptions = Apollo.BaseMutationOptions<UpdateQuestionMutation, UpdateQuestionMutationVariables>;
export const RemoveQuestionDocument = gql`
    mutation RemoveQuestion($questionId: Int!) {
  removeQuestion(questionId: $questionId) {
    id
  }
}
    `;
export type RemoveQuestionMutationFn = Apollo.MutationFunction<RemoveQuestionMutation, RemoveQuestionMutationVariables>;

/**
 * __useRemoveQuestionMutation__
 *
 * To run a mutation, you first call `useRemoveQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeQuestionMutation, { data, loading, error }] = useRemoveQuestionMutation({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useRemoveQuestionMutation(baseOptions?: Apollo.MutationHookOptions<RemoveQuestionMutation, RemoveQuestionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveQuestionMutation, RemoveQuestionMutationVariables>(RemoveQuestionDocument, options);
      }
export type RemoveQuestionMutationHookResult = ReturnType<typeof useRemoveQuestionMutation>;
export type RemoveQuestionMutationResult = Apollo.MutationResult<RemoveQuestionMutation>;
export type RemoveQuestionMutationOptions = Apollo.BaseMutationOptions<RemoveQuestionMutation, RemoveQuestionMutationVariables>;
export const UpdateQuestionDisplayOrderDocument = gql`
    mutation UpdateQuestionDisplayOrder($questionId: Int!, $newDisplayOrder: Int!) {
  updateQuestionDisplayOrder(
    questionId: $questionId
    newDisplayOrder: $newDisplayOrder
  ) {
    questions {
      id
      displayOrder
      questionText
      sampleText
      requirementText
      guidanceText
      sectionId
      templateId
      errors {
        general
      }
    }
  }
}
    `;
export type UpdateQuestionDisplayOrderMutationFn = Apollo.MutationFunction<UpdateQuestionDisplayOrderMutation, UpdateQuestionDisplayOrderMutationVariables>;

/**
 * __useUpdateQuestionDisplayOrderMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionDisplayOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionDisplayOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionDisplayOrderMutation, { data, loading, error }] = useUpdateQuestionDisplayOrderMutation({
 *   variables: {
 *      questionId: // value for 'questionId'
 *      newDisplayOrder: // value for 'newDisplayOrder'
 *   },
 * });
 */
export function useUpdateQuestionDisplayOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateQuestionDisplayOrderMutation, UpdateQuestionDisplayOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateQuestionDisplayOrderMutation, UpdateQuestionDisplayOrderMutationVariables>(UpdateQuestionDisplayOrderDocument, options);
      }
export type UpdateQuestionDisplayOrderMutationHookResult = ReturnType<typeof useUpdateQuestionDisplayOrderMutation>;
export type UpdateQuestionDisplayOrderMutationResult = Apollo.MutationResult<UpdateQuestionDisplayOrderMutation>;
export type UpdateQuestionDisplayOrderMutationOptions = Apollo.BaseMutationOptions<UpdateQuestionDisplayOrderMutation, UpdateQuestionDisplayOrderMutationVariables>;
export const AddSectionDocument = gql`
    mutation AddSection($input: AddSectionInput!) {
  addSection(input: $input) {
    id
    tags {
      name
    }
    guidance
    errors {
      general
      name
      displayOrder
    }
    displayOrder
    introduction
    isDirty
    name
    questions {
      id
      errors {
        general
        templateId
        sectionId
        questionText
        displayOrder
      }
    }
    requirements
  }
}
    `;
export type AddSectionMutationFn = Apollo.MutationFunction<AddSectionMutation, AddSectionMutationVariables>;

/**
 * __useAddSectionMutation__
 *
 * To run a mutation, you first call `useAddSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addSectionMutation, { data, loading, error }] = useAddSectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddSectionMutation(baseOptions?: Apollo.MutationHookOptions<AddSectionMutation, AddSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddSectionMutation, AddSectionMutationVariables>(AddSectionDocument, options);
      }
export type AddSectionMutationHookResult = ReturnType<typeof useAddSectionMutation>;
export type AddSectionMutationResult = Apollo.MutationResult<AddSectionMutation>;
export type AddSectionMutationOptions = Apollo.BaseMutationOptions<AddSectionMutation, AddSectionMutationVariables>;
export const UpdateSectionDocument = gql`
    mutation UpdateSection($input: UpdateSectionInput!) {
  updateSection(input: $input) {
    id
    name
    introduction
    requirements
    guidance
    displayOrder
    errors {
      general
      name
      introduction
      requirements
      guidance
    }
    bestPractice
    tags {
      id
      description
      name
    }
  }
}
    `;
export type UpdateSectionMutationFn = Apollo.MutationFunction<UpdateSectionMutation, UpdateSectionMutationVariables>;

/**
 * __useUpdateSectionMutation__
 *
 * To run a mutation, you first call `useUpdateSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSectionMutation, { data, loading, error }] = useUpdateSectionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSectionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSectionMutation, UpdateSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSectionMutation, UpdateSectionMutationVariables>(UpdateSectionDocument, options);
      }
export type UpdateSectionMutationHookResult = ReturnType<typeof useUpdateSectionMutation>;
export type UpdateSectionMutationResult = Apollo.MutationResult<UpdateSectionMutation>;
export type UpdateSectionMutationOptions = Apollo.BaseMutationOptions<UpdateSectionMutation, UpdateSectionMutationVariables>;
export const RemoveSectionDocument = gql`
    mutation RemoveSection($sectionId: Int!) {
  removeSection(sectionId: $sectionId) {
    id
    name
  }
}
    `;
export type RemoveSectionMutationFn = Apollo.MutationFunction<RemoveSectionMutation, RemoveSectionMutationVariables>;

/**
 * __useRemoveSectionMutation__
 *
 * To run a mutation, you first call `useRemoveSectionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveSectionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeSectionMutation, { data, loading, error }] = useRemoveSectionMutation({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function useRemoveSectionMutation(baseOptions?: Apollo.MutationHookOptions<RemoveSectionMutation, RemoveSectionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveSectionMutation, RemoveSectionMutationVariables>(RemoveSectionDocument, options);
      }
export type RemoveSectionMutationHookResult = ReturnType<typeof useRemoveSectionMutation>;
export type RemoveSectionMutationResult = Apollo.MutationResult<RemoveSectionMutation>;
export type RemoveSectionMutationOptions = Apollo.BaseMutationOptions<RemoveSectionMutation, RemoveSectionMutationVariables>;
export const UpdateSectionDisplayOrderDocument = gql`
    mutation UpdateSectionDisplayOrder($sectionId: Int!, $newDisplayOrder: Int!) {
  updateSectionDisplayOrder(
    sectionId: $sectionId
    newDisplayOrder: $newDisplayOrder
  ) {
    sections {
      id
      introduction
      name
      requirements
      guidance
      displayOrder
      bestPractice
      isDirty
      questions {
        errors {
          general
          templateId
          sectionId
          questionText
          displayOrder
        }
        displayOrder
        guidanceText
        id
        questionText
        sectionId
        templateId
      }
      tags {
        id
        description
        name
      }
      errors {
        general
        name
        displayOrder
      }
      template {
        id
        bestPractice
        isDirty
        languageId
        name
        visibility
      }
    }
  }
}
    `;
export type UpdateSectionDisplayOrderMutationFn = Apollo.MutationFunction<UpdateSectionDisplayOrderMutation, UpdateSectionDisplayOrderMutationVariables>;

/**
 * __useUpdateSectionDisplayOrderMutation__
 *
 * To run a mutation, you first call `useUpdateSectionDisplayOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSectionDisplayOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSectionDisplayOrderMutation, { data, loading, error }] = useUpdateSectionDisplayOrderMutation({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *      newDisplayOrder: // value for 'newDisplayOrder'
 *   },
 * });
 */
export function useUpdateSectionDisplayOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSectionDisplayOrderMutation, UpdateSectionDisplayOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSectionDisplayOrderMutation, UpdateSectionDisplayOrderMutationVariables>(UpdateSectionDisplayOrderDocument, options);
      }
export type UpdateSectionDisplayOrderMutationHookResult = ReturnType<typeof useUpdateSectionDisplayOrderMutation>;
export type UpdateSectionDisplayOrderMutationResult = Apollo.MutationResult<UpdateSectionDisplayOrderMutation>;
export type UpdateSectionDisplayOrderMutationOptions = Apollo.BaseMutationOptions<UpdateSectionDisplayOrderMutation, UpdateSectionDisplayOrderMutationVariables>;
export const AddTemplateCollaboratorDocument = gql`
    mutation AddTemplateCollaborator($templateId: Int!, $email: String!) {
  addTemplateCollaborator(templateId: $templateId, email: $email) {
    errors {
      general
      email
    }
    email
    id
  }
}
    `;
export type AddTemplateCollaboratorMutationFn = Apollo.MutationFunction<AddTemplateCollaboratorMutation, AddTemplateCollaboratorMutationVariables>;

/**
 * __useAddTemplateCollaboratorMutation__
 *
 * To run a mutation, you first call `useAddTemplateCollaboratorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTemplateCollaboratorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTemplateCollaboratorMutation, { data, loading, error }] = useAddTemplateCollaboratorMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useAddTemplateCollaboratorMutation(baseOptions?: Apollo.MutationHookOptions<AddTemplateCollaboratorMutation, AddTemplateCollaboratorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTemplateCollaboratorMutation, AddTemplateCollaboratorMutationVariables>(AddTemplateCollaboratorDocument, options);
      }
export type AddTemplateCollaboratorMutationHookResult = ReturnType<typeof useAddTemplateCollaboratorMutation>;
export type AddTemplateCollaboratorMutationResult = Apollo.MutationResult<AddTemplateCollaboratorMutation>;
export type AddTemplateCollaboratorMutationOptions = Apollo.BaseMutationOptions<AddTemplateCollaboratorMutation, AddTemplateCollaboratorMutationVariables>;
export const RemoveTemplateCollaboratorDocument = gql`
    mutation RemoveTemplateCollaborator($templateId: Int!, $email: String!) {
  removeTemplateCollaborator(templateId: $templateId, email: $email) {
    errors {
      general
      email
    }
  }
}
    `;
export type RemoveTemplateCollaboratorMutationFn = Apollo.MutationFunction<RemoveTemplateCollaboratorMutation, RemoveTemplateCollaboratorMutationVariables>;

/**
 * __useRemoveTemplateCollaboratorMutation__
 *
 * To run a mutation, you first call `useRemoveTemplateCollaboratorMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveTemplateCollaboratorMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeTemplateCollaboratorMutation, { data, loading, error }] = useRemoveTemplateCollaboratorMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useRemoveTemplateCollaboratorMutation(baseOptions?: Apollo.MutationHookOptions<RemoveTemplateCollaboratorMutation, RemoveTemplateCollaboratorMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveTemplateCollaboratorMutation, RemoveTemplateCollaboratorMutationVariables>(RemoveTemplateCollaboratorDocument, options);
      }
export type RemoveTemplateCollaboratorMutationHookResult = ReturnType<typeof useRemoveTemplateCollaboratorMutation>;
export type RemoveTemplateCollaboratorMutationResult = Apollo.MutationResult<RemoveTemplateCollaboratorMutation>;
export type RemoveTemplateCollaboratorMutationOptions = Apollo.BaseMutationOptions<RemoveTemplateCollaboratorMutation, RemoveTemplateCollaboratorMutationVariables>;
export const ArchiveTemplateDocument = gql`
    mutation ArchiveTemplate($templateId: Int!) {
  archiveTemplate(templateId: $templateId) {
    id
    errors {
      general
      name
      ownerId
    }
    name
  }
}
    `;
export type ArchiveTemplateMutationFn = Apollo.MutationFunction<ArchiveTemplateMutation, ArchiveTemplateMutationVariables>;

/**
 * __useArchiveTemplateMutation__
 *
 * To run a mutation, you first call `useArchiveTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useArchiveTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [archiveTemplateMutation, { data, loading, error }] = useArchiveTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useArchiveTemplateMutation(baseOptions?: Apollo.MutationHookOptions<ArchiveTemplateMutation, ArchiveTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ArchiveTemplateMutation, ArchiveTemplateMutationVariables>(ArchiveTemplateDocument, options);
      }
export type ArchiveTemplateMutationHookResult = ReturnType<typeof useArchiveTemplateMutation>;
export type ArchiveTemplateMutationResult = Apollo.MutationResult<ArchiveTemplateMutation>;
export type ArchiveTemplateMutationOptions = Apollo.BaseMutationOptions<ArchiveTemplateMutation, ArchiveTemplateMutationVariables>;
export const CreateTemplateVersionDocument = gql`
    mutation CreateTemplateVersion($templateId: Int!, $comment: String, $versionType: TemplateVersionType, $visibility: TemplateVisibility!) {
  createTemplateVersion(
    templateId: $templateId
    comment: $comment
    versionType: $versionType
    visibility: $visibility
  ) {
    errors {
      general
      name
      ownerId
    }
    name
  }
}
    `;
export type CreateTemplateVersionMutationFn = Apollo.MutationFunction<CreateTemplateVersionMutation, CreateTemplateVersionMutationVariables>;

/**
 * __useCreateTemplateVersionMutation__
 *
 * To run a mutation, you first call `useCreateTemplateVersionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTemplateVersionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTemplateVersionMutation, { data, loading, error }] = useCreateTemplateVersionMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      comment: // value for 'comment'
 *      versionType: // value for 'versionType'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function useCreateTemplateVersionMutation(baseOptions?: Apollo.MutationHookOptions<CreateTemplateVersionMutation, CreateTemplateVersionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTemplateVersionMutation, CreateTemplateVersionMutationVariables>(CreateTemplateVersionDocument, options);
      }
export type CreateTemplateVersionMutationHookResult = ReturnType<typeof useCreateTemplateVersionMutation>;
export type CreateTemplateVersionMutationResult = Apollo.MutationResult<CreateTemplateVersionMutation>;
export type CreateTemplateVersionMutationOptions = Apollo.BaseMutationOptions<CreateTemplateVersionMutation, CreateTemplateVersionMutationVariables>;
export const AddTemplateDocument = gql`
    mutation AddTemplate($name: String!, $copyFromTemplateId: Int) {
  addTemplate(name: $name, copyFromTemplateId: $copyFromTemplateId) {
    id
    errors {
      general
      name
      ownerId
    }
    description
    name
  }
}
    `;
export type AddTemplateMutationFn = Apollo.MutationFunction<AddTemplateMutation, AddTemplateMutationVariables>;

/**
 * __useAddTemplateMutation__
 *
 * To run a mutation, you first call `useAddTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTemplateMutation, { data, loading, error }] = useAddTemplateMutation({
 *   variables: {
 *      name: // value for 'name'
 *      copyFromTemplateId: // value for 'copyFromTemplateId'
 *   },
 * });
 */
export function useAddTemplateMutation(baseOptions?: Apollo.MutationHookOptions<AddTemplateMutation, AddTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTemplateMutation, AddTemplateMutationVariables>(AddTemplateDocument, options);
      }
export type AddTemplateMutationHookResult = ReturnType<typeof useAddTemplateMutation>;
export type AddTemplateMutationResult = Apollo.MutationResult<AddTemplateMutation>;
export type AddTemplateMutationOptions = Apollo.BaseMutationOptions<AddTemplateMutation, AddTemplateMutationVariables>;
export const UpdateTemplateDocument = gql`
    mutation UpdateTemplate($templateId: Int!, $name: String!, $visibility: TemplateVisibility!) {
  updateTemplate(templateId: $templateId, name: $name, visibility: $visibility) {
    id
    name
    visibility
    errors {
      general
      name
      description
    }
  }
}
    `;
export type UpdateTemplateMutationFn = Apollo.MutationFunction<UpdateTemplateMutation, UpdateTemplateMutationVariables>;

/**
 * __useUpdateTemplateMutation__
 *
 * To run a mutation, you first call `useUpdateTemplateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTemplateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTemplateMutation, { data, loading, error }] = useUpdateTemplateMutation({
 *   variables: {
 *      templateId: // value for 'templateId'
 *      name: // value for 'name'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function useUpdateTemplateMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTemplateMutation, UpdateTemplateMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTemplateMutation, UpdateTemplateMutationVariables>(UpdateTemplateDocument, options);
      }
export type UpdateTemplateMutationHookResult = ReturnType<typeof useUpdateTemplateMutation>;
export type UpdateTemplateMutationResult = Apollo.MutationResult<UpdateTemplateMutation>;
export type UpdateTemplateMutationOptions = Apollo.BaseMutationOptions<UpdateTemplateMutation, UpdateTemplateMutationVariables>;
export const UpdateUserProfileDocument = gql`
    mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
  updateUserProfile(input: $input) {
    id
    givenName
    surName
    errors {
      general
      email
      password
      role
    }
    affiliation {
      id
      name
      searchName
      uri
    }
    languageId
    email
  }
}
    `;
export type UpdateUserProfileMutationFn = Apollo.MutationFunction<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;

/**
 * __useUpdateUserProfileMutation__
 *
 * To run a mutation, you first call `useUpdateUserProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserProfileMutation, { data, loading, error }] = useUpdateUserProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>(UpdateUserProfileDocument, options);
      }
export type UpdateUserProfileMutationHookResult = ReturnType<typeof useUpdateUserProfileMutation>;
export type UpdateUserProfileMutationResult = Apollo.MutationResult<UpdateUserProfileMutation>;
export type UpdateUserProfileMutationOptions = Apollo.BaseMutationOptions<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const AddUserEmailDocument = gql`
    mutation AddUserEmail($email: String!, $isPrimary: Boolean!) {
  addUserEmail(email: $email, isPrimary: $isPrimary) {
    email
    errors {
      general
      userId
      email
    }
    isPrimary
    isConfirmed
    id
    userId
  }
}
    `;
export type AddUserEmailMutationFn = Apollo.MutationFunction<AddUserEmailMutation, AddUserEmailMutationVariables>;

/**
 * __useAddUserEmailMutation__
 *
 * To run a mutation, you first call `useAddUserEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddUserEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addUserEmailMutation, { data, loading, error }] = useAddUserEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *      isPrimary: // value for 'isPrimary'
 *   },
 * });
 */
export function useAddUserEmailMutation(baseOptions?: Apollo.MutationHookOptions<AddUserEmailMutation, AddUserEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddUserEmailMutation, AddUserEmailMutationVariables>(AddUserEmailDocument, options);
      }
export type AddUserEmailMutationHookResult = ReturnType<typeof useAddUserEmailMutation>;
export type AddUserEmailMutationResult = Apollo.MutationResult<AddUserEmailMutation>;
export type AddUserEmailMutationOptions = Apollo.BaseMutationOptions<AddUserEmailMutation, AddUserEmailMutationVariables>;
export const RemoveUserEmailDocument = gql`
    mutation RemoveUserEmail($email: String!) {
  removeUserEmail(email: $email) {
    errors {
      general
      userId
      email
    }
  }
}
    `;
export type RemoveUserEmailMutationFn = Apollo.MutationFunction<RemoveUserEmailMutation, RemoveUserEmailMutationVariables>;

/**
 * __useRemoveUserEmailMutation__
 *
 * To run a mutation, you first call `useRemoveUserEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserEmailMutation, { data, loading, error }] = useRemoveUserEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useRemoveUserEmailMutation(baseOptions?: Apollo.MutationHookOptions<RemoveUserEmailMutation, RemoveUserEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveUserEmailMutation, RemoveUserEmailMutationVariables>(RemoveUserEmailDocument, options);
      }
export type RemoveUserEmailMutationHookResult = ReturnType<typeof useRemoveUserEmailMutation>;
export type RemoveUserEmailMutationResult = Apollo.MutationResult<RemoveUserEmailMutation>;
export type RemoveUserEmailMutationOptions = Apollo.BaseMutationOptions<RemoveUserEmailMutation, RemoveUserEmailMutationVariables>;
export const SetPrimaryUserEmailDocument = gql`
    mutation SetPrimaryUserEmail($email: String!) {
  setPrimaryUserEmail(email: $email) {
    id
    errors {
      general
      userId
      email
    }
    email
    isConfirmed
    isPrimary
    userId
  }
}
    `;
export type SetPrimaryUserEmailMutationFn = Apollo.MutationFunction<SetPrimaryUserEmailMutation, SetPrimaryUserEmailMutationVariables>;

/**
 * __useSetPrimaryUserEmailMutation__
 *
 * To run a mutation, you first call `useSetPrimaryUserEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPrimaryUserEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPrimaryUserEmailMutation, { data, loading, error }] = useSetPrimaryUserEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSetPrimaryUserEmailMutation(baseOptions?: Apollo.MutationHookOptions<SetPrimaryUserEmailMutation, SetPrimaryUserEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetPrimaryUserEmailMutation, SetPrimaryUserEmailMutationVariables>(SetPrimaryUserEmailDocument, options);
      }
export type SetPrimaryUserEmailMutationHookResult = ReturnType<typeof useSetPrimaryUserEmailMutation>;
export type SetPrimaryUserEmailMutationResult = Apollo.MutationResult<SetPrimaryUserEmailMutation>;
export type SetPrimaryUserEmailMutationOptions = Apollo.BaseMutationOptions<SetPrimaryUserEmailMutation, SetPrimaryUserEmailMutationVariables>;
export const AffiliationsDocument = gql`
    query Affiliations($name: String!) {
  affiliations(name: $name) {
    totalCount
    nextCursor
    items {
      id
      displayName
      uri
      apiTarget
    }
  }
}
    `;

/**
 * __useAffiliationsQuery__
 *
 * To run a query within a React component, call `useAffiliationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAffiliationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAffiliationsQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useAffiliationsQuery(baseOptions: Apollo.QueryHookOptions<AffiliationsQuery, AffiliationsQueryVariables> & ({ variables: AffiliationsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AffiliationsQuery, AffiliationsQueryVariables>(AffiliationsDocument, options);
      }
export function useAffiliationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AffiliationsQuery, AffiliationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AffiliationsQuery, AffiliationsQueryVariables>(AffiliationsDocument, options);
        }
export function useAffiliationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AffiliationsQuery, AffiliationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AffiliationsQuery, AffiliationsQueryVariables>(AffiliationsDocument, options);
        }
export type AffiliationsQueryHookResult = ReturnType<typeof useAffiliationsQuery>;
export type AffiliationsLazyQueryHookResult = ReturnType<typeof useAffiliationsLazyQuery>;
export type AffiliationsSuspenseQueryHookResult = ReturnType<typeof useAffiliationsSuspenseQuery>;
export type AffiliationsQueryResult = Apollo.QueryResult<AffiliationsQuery, AffiliationsQueryVariables>;
export const AffiliationFundersDocument = gql`
    query AffiliationFunders($name: String!, $funderOnly: Boolean, $paginationOptions: PaginationOptions) {
  affiliations(
    name: $name
    funderOnly: $funderOnly
    paginationOptions: $paginationOptions
  ) {
    totalCount
    nextCursor
    items {
      id
      displayName
      apiTarget
      uri
    }
  }
}
    `;

/**
 * __useAffiliationFundersQuery__
 *
 * To run a query within a React component, call `useAffiliationFundersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAffiliationFundersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAffiliationFundersQuery({
 *   variables: {
 *      name: // value for 'name'
 *      funderOnly: // value for 'funderOnly'
 *      paginationOptions: // value for 'paginationOptions'
 *   },
 * });
 */
export function useAffiliationFundersQuery(baseOptions: Apollo.QueryHookOptions<AffiliationFundersQuery, AffiliationFundersQueryVariables> & ({ variables: AffiliationFundersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AffiliationFundersQuery, AffiliationFundersQueryVariables>(AffiliationFundersDocument, options);
      }
export function useAffiliationFundersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AffiliationFundersQuery, AffiliationFundersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AffiliationFundersQuery, AffiliationFundersQueryVariables>(AffiliationFundersDocument, options);
        }
export function useAffiliationFundersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AffiliationFundersQuery, AffiliationFundersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AffiliationFundersQuery, AffiliationFundersQueryVariables>(AffiliationFundersDocument, options);
        }
export type AffiliationFundersQueryHookResult = ReturnType<typeof useAffiliationFundersQuery>;
export type AffiliationFundersLazyQueryHookResult = ReturnType<typeof useAffiliationFundersLazyQuery>;
export type AffiliationFundersSuspenseQueryHookResult = ReturnType<typeof useAffiliationFundersSuspenseQuery>;
export type AffiliationFundersQueryResult = Apollo.QueryResult<AffiliationFundersQuery, AffiliationFundersQueryVariables>;
export const AnswerByVersionedQuestionIdDocument = gql`
    query AnswerByVersionedQuestionId($projectId: Int!, $planId: Int!, $versionedQuestionId: Int!) {
  answerByVersionedQuestionId(
    projectId: $projectId
    planId: $planId
    versionedQuestionId: $versionedQuestionId
  ) {
    id
    json
    versionedQuestion {
      id
    }
    plan {
      id
    }
    modified
    errors {
      general
      planId
      versionedSectionId
      versionedQuestionId
      json
    }
  }
}
    `;

/**
 * __useAnswerByVersionedQuestionIdQuery__
 *
 * To run a query within a React component, call `useAnswerByVersionedQuestionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useAnswerByVersionedQuestionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAnswerByVersionedQuestionIdQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *      planId: // value for 'planId'
 *      versionedQuestionId: // value for 'versionedQuestionId'
 *   },
 * });
 */
export function useAnswerByVersionedQuestionIdQuery(baseOptions: Apollo.QueryHookOptions<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables> & ({ variables: AnswerByVersionedQuestionIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables>(AnswerByVersionedQuestionIdDocument, options);
      }
export function useAnswerByVersionedQuestionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables>(AnswerByVersionedQuestionIdDocument, options);
        }
export function useAnswerByVersionedQuestionIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables>(AnswerByVersionedQuestionIdDocument, options);
        }
export type AnswerByVersionedQuestionIdQueryHookResult = ReturnType<typeof useAnswerByVersionedQuestionIdQuery>;
export type AnswerByVersionedQuestionIdLazyQueryHookResult = ReturnType<typeof useAnswerByVersionedQuestionIdLazyQuery>;
export type AnswerByVersionedQuestionIdSuspenseQueryHookResult = ReturnType<typeof useAnswerByVersionedQuestionIdSuspenseQuery>;
export type AnswerByVersionedQuestionIdQueryResult = Apollo.QueryResult<AnswerByVersionedQuestionIdQuery, AnswerByVersionedQuestionIdQueryVariables>;
export const ProjectFundingsDocument = gql`
    query ProjectFundings($projectId: Int!) {
  projectFundings(projectId: $projectId) {
    id
    status
    grantId
    funderOpportunityNumber
    funderProjectNumber
    affiliation {
      displayName
      uri
    }
  }
}
    `;

/**
 * __useProjectFundingsQuery__
 *
 * To run a query within a React component, call `useProjectFundingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectFundingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectFundingsQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectFundingsQuery(baseOptions: Apollo.QueryHookOptions<ProjectFundingsQuery, ProjectFundingsQueryVariables> & ({ variables: ProjectFundingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectFundingsQuery, ProjectFundingsQueryVariables>(ProjectFundingsDocument, options);
      }
export function useProjectFundingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectFundingsQuery, ProjectFundingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectFundingsQuery, ProjectFundingsQueryVariables>(ProjectFundingsDocument, options);
        }
export function useProjectFundingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProjectFundingsQuery, ProjectFundingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProjectFundingsQuery, ProjectFundingsQueryVariables>(ProjectFundingsDocument, options);
        }
export type ProjectFundingsQueryHookResult = ReturnType<typeof useProjectFundingsQuery>;
export type ProjectFundingsLazyQueryHookResult = ReturnType<typeof useProjectFundingsLazyQuery>;
export type ProjectFundingsSuspenseQueryHookResult = ReturnType<typeof useProjectFundingsSuspenseQuery>;
export type ProjectFundingsQueryResult = Apollo.QueryResult<ProjectFundingsQuery, ProjectFundingsQueryVariables>;
export const PlanFundingsDocument = gql`
    query PlanFundings($planId: Int!) {
  planFundings(planId: $planId) {
    id
    projectFunding {
      id
    }
  }
}
    `;

/**
 * __usePlanFundingsQuery__
 *
 * To run a query within a React component, call `usePlanFundingsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlanFundingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlanFundingsQuery({
 *   variables: {
 *      planId: // value for 'planId'
 *   },
 * });
 */
export function usePlanFundingsQuery(baseOptions: Apollo.QueryHookOptions<PlanFundingsQuery, PlanFundingsQueryVariables> & ({ variables: PlanFundingsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PlanFundingsQuery, PlanFundingsQueryVariables>(PlanFundingsDocument, options);
      }
export function usePlanFundingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlanFundingsQuery, PlanFundingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PlanFundingsQuery, PlanFundingsQueryVariables>(PlanFundingsDocument, options);
        }
export function usePlanFundingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PlanFundingsQuery, PlanFundingsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PlanFundingsQuery, PlanFundingsQueryVariables>(PlanFundingsDocument, options);
        }
export type PlanFundingsQueryHookResult = ReturnType<typeof usePlanFundingsQuery>;
export type PlanFundingsLazyQueryHookResult = ReturnType<typeof usePlanFundingsLazyQuery>;
export type PlanFundingsSuspenseQueryHookResult = ReturnType<typeof usePlanFundingsSuspenseQuery>;
export type PlanFundingsQueryResult = Apollo.QueryResult<PlanFundingsQuery, PlanFundingsQueryVariables>;
export const PopularFundersDocument = gql`
    query PopularFunders {
  popularFunders {
    displayName
    id
    nbrPlans
    uri
    apiTarget
  }
}
    `;

/**
 * __usePopularFundersQuery__
 *
 * To run a query within a React component, call `usePopularFundersQuery` and pass it any options that fit your needs.
 * When your component renders, `usePopularFundersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePopularFundersQuery({
 *   variables: {
 *   },
 * });
 */
export function usePopularFundersQuery(baseOptions?: Apollo.QueryHookOptions<PopularFundersQuery, PopularFundersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PopularFundersQuery, PopularFundersQueryVariables>(PopularFundersDocument, options);
      }
export function usePopularFundersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PopularFundersQuery, PopularFundersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PopularFundersQuery, PopularFundersQueryVariables>(PopularFundersDocument, options);
        }
export function usePopularFundersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PopularFundersQuery, PopularFundersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PopularFundersQuery, PopularFundersQueryVariables>(PopularFundersDocument, options);
        }
export type PopularFundersQueryHookResult = ReturnType<typeof usePopularFundersQuery>;
export type PopularFundersLazyQueryHookResult = ReturnType<typeof usePopularFundersLazyQuery>;
export type PopularFundersSuspenseQueryHookResult = ReturnType<typeof usePopularFundersSuspenseQuery>;
export type PopularFundersQueryResult = Apollo.QueryResult<PopularFundersQuery, PopularFundersQueryVariables>;
export const LanguagesDocument = gql`
    query Languages {
  languages {
    id
    isDefault
    name
  }
}
    `;

/**
 * __useLanguagesQuery__
 *
 * To run a query within a React component, call `useLanguagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLanguagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLanguagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useLanguagesQuery(baseOptions?: Apollo.QueryHookOptions<LanguagesQuery, LanguagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LanguagesQuery, LanguagesQueryVariables>(LanguagesDocument, options);
      }
export function useLanguagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LanguagesQuery, LanguagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LanguagesQuery, LanguagesQueryVariables>(LanguagesDocument, options);
        }
export function useLanguagesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<LanguagesQuery, LanguagesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<LanguagesQuery, LanguagesQueryVariables>(LanguagesDocument, options);
        }
export type LanguagesQueryHookResult = ReturnType<typeof useLanguagesQuery>;
export type LanguagesLazyQueryHookResult = ReturnType<typeof useLanguagesLazyQuery>;
export type LanguagesSuspenseQueryHookResult = ReturnType<typeof useLanguagesSuspenseQuery>;
export type LanguagesQueryResult = Apollo.QueryResult<LanguagesQuery, LanguagesQueryVariables>;
export const MemberRolesDocument = gql`
    query MemberRoles {
  memberRoles {
    id
    label
    uri
    description
    displayOrder
  }
}
    `;

/**
 * __useMemberRolesQuery__
 *
 * To run a query within a React component, call `useMemberRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMemberRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMemberRolesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMemberRolesQuery(baseOptions?: Apollo.QueryHookOptions<MemberRolesQuery, MemberRolesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MemberRolesQuery, MemberRolesQueryVariables>(MemberRolesDocument, options);
      }
export function useMemberRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MemberRolesQuery, MemberRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MemberRolesQuery, MemberRolesQueryVariables>(MemberRolesDocument, options);
        }
export function useMemberRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MemberRolesQuery, MemberRolesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MemberRolesQuery, MemberRolesQueryVariables>(MemberRolesDocument, options);
        }
export type MemberRolesQueryHookResult = ReturnType<typeof useMemberRolesQuery>;
export type MemberRolesLazyQueryHookResult = ReturnType<typeof useMemberRolesLazyQuery>;
export type MemberRolesSuspenseQueryHookResult = ReturnType<typeof useMemberRolesSuspenseQuery>;
export type MemberRolesQueryResult = Apollo.QueryResult<MemberRolesQuery, MemberRolesQueryVariables>;
export const PlanDocument = gql`
    query Plan($planId: Int!) {
  plan(planId: $planId) {
    id
    versionedTemplate {
      template {
        id
        name
      }
      name
    }
    fundings {
      id
      projectFunding {
        affiliation {
          displayName
        }
      }
    }
    visibility
    status
    project {
      fundings {
        affiliation {
          displayName
          name
        }
        funderOpportunityNumber
      }
      title
    }
    members {
      isPrimaryContact
      projectMember {
        givenName
        surName
        email
        orcid
        memberRoles {
          label
        }
      }
    }
    versionedSections {
      answeredQuestions
      displayOrder
      versionedSectionId
      title
      totalQuestions
    }
    created
    modified
    dmpId
    registered
    title
  }
}
    `;

/**
 * __usePlanQuery__
 *
 * To run a query within a React component, call `usePlanQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlanQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlanQuery({
 *   variables: {
 *      planId: // value for 'planId'
 *   },
 * });
 */
export function usePlanQuery(baseOptions: Apollo.QueryHookOptions<PlanQuery, PlanQueryVariables> & ({ variables: PlanQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PlanQuery, PlanQueryVariables>(PlanDocument, options);
      }
export function usePlanLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlanQuery, PlanQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PlanQuery, PlanQueryVariables>(PlanDocument, options);
        }
export function usePlanSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PlanQuery, PlanQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PlanQuery, PlanQueryVariables>(PlanDocument, options);
        }
export type PlanQueryHookResult = ReturnType<typeof usePlanQuery>;
export type PlanLazyQueryHookResult = ReturnType<typeof usePlanLazyQuery>;
export type PlanSuspenseQueryHookResult = ReturnType<typeof usePlanSuspenseQuery>;
export type PlanQueryResult = Apollo.QueryResult<PlanQuery, PlanQueryVariables>;
export const PlanMembersDocument = gql`
    query PlanMembers($planId: Int!) {
  planMembers(planId: $planId) {
    id
    isPrimaryContact
    errors {
      general
    }
    projectMember {
      id
      givenName
      surName
    }
    memberRoles {
      uri
      id
      label
      description
      displayOrder
    }
  }
}
    `;

/**
 * __usePlanMembersQuery__
 *
 * To run a query within a React component, call `usePlanMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlanMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlanMembersQuery({
 *   variables: {
 *      planId: // value for 'planId'
 *   },
 * });
 */
export function usePlanMembersQuery(baseOptions: Apollo.QueryHookOptions<PlanMembersQuery, PlanMembersQueryVariables> & ({ variables: PlanMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PlanMembersQuery, PlanMembersQueryVariables>(PlanMembersDocument, options);
      }
export function usePlanMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlanMembersQuery, PlanMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PlanMembersQuery, PlanMembersQueryVariables>(PlanMembersDocument, options);
        }
export function usePlanMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PlanMembersQuery, PlanMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PlanMembersQuery, PlanMembersQueryVariables>(PlanMembersDocument, options);
        }
export type PlanMembersQueryHookResult = ReturnType<typeof usePlanMembersQuery>;
export type PlanMembersLazyQueryHookResult = ReturnType<typeof usePlanMembersLazyQuery>;
export type PlanMembersSuspenseQueryHookResult = ReturnType<typeof usePlanMembersSuspenseQuery>;
export type PlanMembersQueryResult = Apollo.QueryResult<PlanMembersQuery, PlanMembersQueryVariables>;
export const ProjectFundingDocument = gql`
    query ProjectFunding($projectFundingId: Int!) {
  projectFunding(projectFundingId: $projectFundingId) {
    affiliation {
      name
      displayName
    }
    status
    grantId
    funderOpportunityNumber
    funderProjectNumber
  }
}
    `;

/**
 * __useProjectFundingQuery__
 *
 * To run a query within a React component, call `useProjectFundingQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectFundingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectFundingQuery({
 *   variables: {
 *      projectFundingId: // value for 'projectFundingId'
 *   },
 * });
 */
export function useProjectFundingQuery(baseOptions: Apollo.QueryHookOptions<ProjectFundingQuery, ProjectFundingQueryVariables> & ({ variables: ProjectFundingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectFundingQuery, ProjectFundingQueryVariables>(ProjectFundingDocument, options);
      }
export function useProjectFundingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectFundingQuery, ProjectFundingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectFundingQuery, ProjectFundingQueryVariables>(ProjectFundingDocument, options);
        }
export function useProjectFundingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProjectFundingQuery, ProjectFundingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProjectFundingQuery, ProjectFundingQueryVariables>(ProjectFundingDocument, options);
        }
export type ProjectFundingQueryHookResult = ReturnType<typeof useProjectFundingQuery>;
export type ProjectFundingLazyQueryHookResult = ReturnType<typeof useProjectFundingLazyQuery>;
export type ProjectFundingSuspenseQueryHookResult = ReturnType<typeof useProjectFundingSuspenseQuery>;
export type ProjectFundingQueryResult = Apollo.QueryResult<ProjectFundingQuery, ProjectFundingQueryVariables>;
export const ProjectMembersDocument = gql`
    query ProjectMembers($projectId: Int!) {
  projectMembers(projectId: $projectId) {
    id
    givenName
    surName
    orcid
    memberRoles {
      id
      label
      description
    }
    affiliation {
      displayName
    }
  }
}
    `;

/**
 * __useProjectMembersQuery__
 *
 * To run a query within a React component, call `useProjectMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectMembersQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectMembersQuery(baseOptions: Apollo.QueryHookOptions<ProjectMembersQuery, ProjectMembersQueryVariables> & ({ variables: ProjectMembersQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectMembersQuery, ProjectMembersQueryVariables>(ProjectMembersDocument, options);
      }
export function useProjectMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectMembersQuery, ProjectMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectMembersQuery, ProjectMembersQueryVariables>(ProjectMembersDocument, options);
        }
export function useProjectMembersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProjectMembersQuery, ProjectMembersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProjectMembersQuery, ProjectMembersQueryVariables>(ProjectMembersDocument, options);
        }
export type ProjectMembersQueryHookResult = ReturnType<typeof useProjectMembersQuery>;
export type ProjectMembersLazyQueryHookResult = ReturnType<typeof useProjectMembersLazyQuery>;
export type ProjectMembersSuspenseQueryHookResult = ReturnType<typeof useProjectMembersSuspenseQuery>;
export type ProjectMembersQueryResult = Apollo.QueryResult<ProjectMembersQuery, ProjectMembersQueryVariables>;
export const ProjectMemberDocument = gql`
    query ProjectMember($projectMemberId: Int!) {
  projectMember(projectMemberId: $projectMemberId) {
    email
    memberRoles {
      id
      label
      displayOrder
      uri
    }
    givenName
    surName
    affiliation {
      id
      displayName
      uri
    }
    orcid
  }
}
    `;

/**
 * __useProjectMemberQuery__
 *
 * To run a query within a React component, call `useProjectMemberQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectMemberQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectMemberQuery({
 *   variables: {
 *      projectMemberId: // value for 'projectMemberId'
 *   },
 * });
 */
export function useProjectMemberQuery(baseOptions: Apollo.QueryHookOptions<ProjectMemberQuery, ProjectMemberQueryVariables> & ({ variables: ProjectMemberQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectMemberQuery, ProjectMemberQueryVariables>(ProjectMemberDocument, options);
      }
export function useProjectMemberLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectMemberQuery, ProjectMemberQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectMemberQuery, ProjectMemberQueryVariables>(ProjectMemberDocument, options);
        }
export function useProjectMemberSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProjectMemberQuery, ProjectMemberQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProjectMemberQuery, ProjectMemberQueryVariables>(ProjectMemberDocument, options);
        }
export type ProjectMemberQueryHookResult = ReturnType<typeof useProjectMemberQuery>;
export type ProjectMemberLazyQueryHookResult = ReturnType<typeof useProjectMemberLazyQuery>;
export type ProjectMemberSuspenseQueryHookResult = ReturnType<typeof useProjectMemberSuspenseQuery>;
export type ProjectMemberQueryResult = Apollo.QueryResult<ProjectMemberQuery, ProjectMemberQueryVariables>;
export const MyProjectsDocument = gql`
    query MyProjects {
  myProjects {
    totalCount
    nextCursor
    items {
      title
      id
      startDate
      endDate
      fundings {
        name
        grantId
      }
      members {
        name
        role
        orcid
      }
      errors {
        general
        title
      }
    }
  }
}
    `;

/**
 * __useMyProjectsQuery__
 *
 * To run a query within a React component, call `useMyProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyProjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyProjectsQuery(baseOptions?: Apollo.QueryHookOptions<MyProjectsQuery, MyProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyProjectsQuery, MyProjectsQueryVariables>(MyProjectsDocument, options);
      }
export function useMyProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyProjectsQuery, MyProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyProjectsQuery, MyProjectsQueryVariables>(MyProjectsDocument, options);
        }
export function useMyProjectsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyProjectsQuery, MyProjectsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyProjectsQuery, MyProjectsQueryVariables>(MyProjectsDocument, options);
        }
export type MyProjectsQueryHookResult = ReturnType<typeof useMyProjectsQuery>;
export type MyProjectsLazyQueryHookResult = ReturnType<typeof useMyProjectsLazyQuery>;
export type MyProjectsSuspenseQueryHookResult = ReturnType<typeof useMyProjectsSuspenseQuery>;
export type MyProjectsQueryResult = Apollo.QueryResult<MyProjectsQuery, MyProjectsQueryVariables>;
export const ProjectDocument = gql`
    query Project($projectId: Int!) {
  project(projectId: $projectId) {
    title
    abstractText
    startDate
    endDate
    isTestProject
    fundings {
      id
      grantId
      affiliation {
        name
        displayName
        searchName
      }
    }
    members {
      givenName
      surName
      memberRoles {
        description
        displayOrder
        label
        uri
      }
      email
    }
    outputs {
      title
    }
    researchDomain {
      id
      parentResearchDomainId
    }
    plans {
      versionedSections {
        answeredQuestions
        displayOrder
        versionedSectionId
        title
        totalQuestions
      }
      templateTitle
      id
      funding
      dmpId
      modified
      created
    }
  }
}
    `;

/**
 * __useProjectQuery__
 *
 * To run a query within a React component, call `useProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProjectQuery({
 *   variables: {
 *      projectId: // value for 'projectId'
 *   },
 * });
 */
export function useProjectQuery(baseOptions: Apollo.QueryHookOptions<ProjectQuery, ProjectQueryVariables> & ({ variables: ProjectQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, options);
      }
export function useProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProjectQuery, ProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, options);
        }
export function useProjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProjectQuery, ProjectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProjectQuery, ProjectQueryVariables>(ProjectDocument, options);
        }
export type ProjectQueryHookResult = ReturnType<typeof useProjectQuery>;
export type ProjectLazyQueryHookResult = ReturnType<typeof useProjectLazyQuery>;
export type ProjectSuspenseQueryHookResult = ReturnType<typeof useProjectSuspenseQuery>;
export type ProjectQueryResult = Apollo.QueryResult<ProjectQuery, ProjectQueryVariables>;
export const QuestionTypesDocument = gql`
    query QuestionTypes {
  questionTypes {
    id
    errors {
      general
      name
      usageDescription
    }
    name
    usageDescription
    json
  }
}
    `;

/**
 * __useQuestionTypesQuery__
 *
 * To run a query within a React component, call `useQuestionTypesQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionTypesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionTypesQuery({
 *   variables: {
 *   },
 * });
 */
export function useQuestionTypesQuery(baseOptions?: Apollo.QueryHookOptions<QuestionTypesQuery, QuestionTypesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QuestionTypesQuery, QuestionTypesQueryVariables>(QuestionTypesDocument, options);
      }
export function useQuestionTypesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QuestionTypesQuery, QuestionTypesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QuestionTypesQuery, QuestionTypesQueryVariables>(QuestionTypesDocument, options);
        }
export function useQuestionTypesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QuestionTypesQuery, QuestionTypesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<QuestionTypesQuery, QuestionTypesQueryVariables>(QuestionTypesDocument, options);
        }
export type QuestionTypesQueryHookResult = ReturnType<typeof useQuestionTypesQuery>;
export type QuestionTypesLazyQueryHookResult = ReturnType<typeof useQuestionTypesLazyQuery>;
export type QuestionTypesSuspenseQueryHookResult = ReturnType<typeof useQuestionTypesSuspenseQuery>;
export type QuestionTypesQueryResult = Apollo.QueryResult<QuestionTypesQuery, QuestionTypesQueryVariables>;
export const QuestionsDisplayOrderDocument = gql`
    query QuestionsDisplayOrder($sectionId: Int!) {
  questions(sectionId: $sectionId) {
    displayOrder
  }
}
    `;

/**
 * __useQuestionsDisplayOrderQuery__
 *
 * To run a query within a React component, call `useQuestionsDisplayOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionsDisplayOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionsDisplayOrderQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function useQuestionsDisplayOrderQuery(baseOptions: Apollo.QueryHookOptions<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables> & ({ variables: QuestionsDisplayOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables>(QuestionsDisplayOrderDocument, options);
      }
export function useQuestionsDisplayOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables>(QuestionsDisplayOrderDocument, options);
        }
export function useQuestionsDisplayOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables>(QuestionsDisplayOrderDocument, options);
        }
export type QuestionsDisplayOrderQueryHookResult = ReturnType<typeof useQuestionsDisplayOrderQuery>;
export type QuestionsDisplayOrderLazyQueryHookResult = ReturnType<typeof useQuestionsDisplayOrderLazyQuery>;
export type QuestionsDisplayOrderSuspenseQueryHookResult = ReturnType<typeof useQuestionsDisplayOrderSuspenseQuery>;
export type QuestionsDisplayOrderQueryResult = Apollo.QueryResult<QuestionsDisplayOrderQuery, QuestionsDisplayOrderQueryVariables>;
export const PlanSectionQuestionsDocument = gql`
    query PlanSectionQuestions($sectionId: Int!) {
  questions(sectionId: $sectionId) {
    id
    questionText
    displayOrder
    guidanceText
    requirementText
    sampleText
    sectionId
    templateId
    isDirty
  }
}
    `;

/**
 * __usePlanSectionQuestionsQuery__
 *
 * To run a query within a React component, call `usePlanSectionQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlanSectionQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlanSectionQuestionsQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function usePlanSectionQuestionsQuery(baseOptions: Apollo.QueryHookOptions<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables> & ({ variables: PlanSectionQuestionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables>(PlanSectionQuestionsDocument, options);
      }
export function usePlanSectionQuestionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables>(PlanSectionQuestionsDocument, options);
        }
export function usePlanSectionQuestionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables>(PlanSectionQuestionsDocument, options);
        }
export type PlanSectionQuestionsQueryHookResult = ReturnType<typeof usePlanSectionQuestionsQuery>;
export type PlanSectionQuestionsLazyQueryHookResult = ReturnType<typeof usePlanSectionQuestionsLazyQuery>;
export type PlanSectionQuestionsSuspenseQueryHookResult = ReturnType<typeof usePlanSectionQuestionsSuspenseQuery>;
export type PlanSectionQuestionsQueryResult = Apollo.QueryResult<PlanSectionQuestionsQuery, PlanSectionQuestionsQueryVariables>;
export const QuestionDocument = gql`
    query Question($questionId: Int!) {
  question(questionId: $questionId) {
    id
    guidanceText
    errors {
      general
      questionText
      requirementText
      sampleText
      displayOrder
      questionConditionIds
      sectionId
      templateId
    }
    displayOrder
    questionText
    json
    requirementText
    sampleText
    useSampleTextAsDefault
    sectionId
    templateId
    isDirty
    required
  }
}
    `;

/**
 * __useQuestionQuery__
 *
 * To run a query within a React component, call `useQuestionQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionQuery({
 *   variables: {
 *      questionId: // value for 'questionId'
 *   },
 * });
 */
export function useQuestionQuery(baseOptions: Apollo.QueryHookOptions<QuestionQuery, QuestionQueryVariables> & ({ variables: QuestionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<QuestionQuery, QuestionQueryVariables>(QuestionDocument, options);
      }
export function useQuestionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<QuestionQuery, QuestionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<QuestionQuery, QuestionQueryVariables>(QuestionDocument, options);
        }
export function useQuestionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<QuestionQuery, QuestionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<QuestionQuery, QuestionQueryVariables>(QuestionDocument, options);
        }
export type QuestionQueryHookResult = ReturnType<typeof useQuestionQuery>;
export type QuestionLazyQueryHookResult = ReturnType<typeof useQuestionLazyQuery>;
export type QuestionSuspenseQueryHookResult = ReturnType<typeof useQuestionSuspenseQuery>;
export type QuestionQueryResult = Apollo.QueryResult<QuestionQuery, QuestionQueryVariables>;
export const PublishedQuestionsDocument = gql`
    query PublishedQuestions($versionedSectionId: Int!) {
  publishedQuestions(versionedSectionId: $versionedSectionId) {
    id
    questionText
    displayOrder
    guidanceText
    requirementText
    sampleText
    versionedSectionId
    versionedTemplateId
  }
}
    `;

/**
 * __usePublishedQuestionsQuery__
 *
 * To run a query within a React component, call `usePublishedQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublishedQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublishedQuestionsQuery({
 *   variables: {
 *      versionedSectionId: // value for 'versionedSectionId'
 *   },
 * });
 */
export function usePublishedQuestionsQuery(baseOptions: Apollo.QueryHookOptions<PublishedQuestionsQuery, PublishedQuestionsQueryVariables> & ({ variables: PublishedQuestionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PublishedQuestionsQuery, PublishedQuestionsQueryVariables>(PublishedQuestionsDocument, options);
      }
export function usePublishedQuestionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PublishedQuestionsQuery, PublishedQuestionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PublishedQuestionsQuery, PublishedQuestionsQueryVariables>(PublishedQuestionsDocument, options);
        }
export function usePublishedQuestionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PublishedQuestionsQuery, PublishedQuestionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PublishedQuestionsQuery, PublishedQuestionsQueryVariables>(PublishedQuestionsDocument, options);
        }
export type PublishedQuestionsQueryHookResult = ReturnType<typeof usePublishedQuestionsQuery>;
export type PublishedQuestionsLazyQueryHookResult = ReturnType<typeof usePublishedQuestionsLazyQuery>;
export type PublishedQuestionsSuspenseQueryHookResult = ReturnType<typeof usePublishedQuestionsSuspenseQuery>;
export type PublishedQuestionsQueryResult = Apollo.QueryResult<PublishedQuestionsQuery, PublishedQuestionsQueryVariables>;
export const PublishedQuestionDocument = gql`
    query PublishedQuestion($versionedQuestionId: Int!) {
  publishedQuestion(versionedQuestionId: $versionedQuestionId) {
    id
    guidanceText
    errors {
      general
      questionText
      requirementText
      sampleText
      displayOrder
      versionedSectionId
    }
    displayOrder
    questionText
    json
    requirementText
    sampleText
    versionedSectionId
    versionedTemplateId
    required
  }
}
    `;

/**
 * __usePublishedQuestionQuery__
 *
 * To run a query within a React component, call `usePublishedQuestionQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublishedQuestionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublishedQuestionQuery({
 *   variables: {
 *      versionedQuestionId: // value for 'versionedQuestionId'
 *   },
 * });
 */
export function usePublishedQuestionQuery(baseOptions: Apollo.QueryHookOptions<PublishedQuestionQuery, PublishedQuestionQueryVariables> & ({ variables: PublishedQuestionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PublishedQuestionQuery, PublishedQuestionQueryVariables>(PublishedQuestionDocument, options);
      }
export function usePublishedQuestionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PublishedQuestionQuery, PublishedQuestionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PublishedQuestionQuery, PublishedQuestionQueryVariables>(PublishedQuestionDocument, options);
        }
export function usePublishedQuestionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PublishedQuestionQuery, PublishedQuestionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PublishedQuestionQuery, PublishedQuestionQueryVariables>(PublishedQuestionDocument, options);
        }
export type PublishedQuestionQueryHookResult = ReturnType<typeof usePublishedQuestionQuery>;
export type PublishedQuestionLazyQueryHookResult = ReturnType<typeof usePublishedQuestionLazyQuery>;
export type PublishedQuestionSuspenseQueryHookResult = ReturnType<typeof usePublishedQuestionSuspenseQuery>;
export type PublishedQuestionQueryResult = Apollo.QueryResult<PublishedQuestionQuery, PublishedQuestionQueryVariables>;
export const TopLevelResearchDomainsDocument = gql`
    query TopLevelResearchDomains {
  topLevelResearchDomains {
    name
    id
  }
}
    `;

/**
 * __useTopLevelResearchDomainsQuery__
 *
 * To run a query within a React component, call `useTopLevelResearchDomainsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTopLevelResearchDomainsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTopLevelResearchDomainsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTopLevelResearchDomainsQuery(baseOptions?: Apollo.QueryHookOptions<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>(TopLevelResearchDomainsDocument, options);
      }
export function useTopLevelResearchDomainsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>(TopLevelResearchDomainsDocument, options);
        }
export function useTopLevelResearchDomainsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>(TopLevelResearchDomainsDocument, options);
        }
export type TopLevelResearchDomainsQueryHookResult = ReturnType<typeof useTopLevelResearchDomainsQuery>;
export type TopLevelResearchDomainsLazyQueryHookResult = ReturnType<typeof useTopLevelResearchDomainsLazyQuery>;
export type TopLevelResearchDomainsSuspenseQueryHookResult = ReturnType<typeof useTopLevelResearchDomainsSuspenseQuery>;
export type TopLevelResearchDomainsQueryResult = Apollo.QueryResult<TopLevelResearchDomainsQuery, TopLevelResearchDomainsQueryVariables>;
export const ChildResearchDomainsDocument = gql`
    query ChildResearchDomains($parentResearchDomainId: Int!) {
  childResearchDomains(parentResearchDomainId: $parentResearchDomainId) {
    id
    name
  }
}
    `;

/**
 * __useChildResearchDomainsQuery__
 *
 * To run a query within a React component, call `useChildResearchDomainsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChildResearchDomainsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChildResearchDomainsQuery({
 *   variables: {
 *      parentResearchDomainId: // value for 'parentResearchDomainId'
 *   },
 * });
 */
export function useChildResearchDomainsQuery(baseOptions: Apollo.QueryHookOptions<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables> & ({ variables: ChildResearchDomainsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables>(ChildResearchDomainsDocument, options);
      }
export function useChildResearchDomainsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables>(ChildResearchDomainsDocument, options);
        }
export function useChildResearchDomainsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables>(ChildResearchDomainsDocument, options);
        }
export type ChildResearchDomainsQueryHookResult = ReturnType<typeof useChildResearchDomainsQuery>;
export type ChildResearchDomainsLazyQueryHookResult = ReturnType<typeof useChildResearchDomainsLazyQuery>;
export type ChildResearchDomainsSuspenseQueryHookResult = ReturnType<typeof useChildResearchDomainsSuspenseQuery>;
export type ChildResearchDomainsQueryResult = Apollo.QueryResult<ChildResearchDomainsQuery, ChildResearchDomainsQueryVariables>;
export const SectionVersionsDocument = gql`
    query SectionVersions($sectionId: Int!) {
  sectionVersions(sectionId: $sectionId) {
    id
    versionedQuestions {
      id
      questionText
      json
      questionId
    }
    section {
      id
    }
  }
}
    `;

/**
 * __useSectionVersionsQuery__
 *
 * To run a query within a React component, call `useSectionVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSectionVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSectionVersionsQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function useSectionVersionsQuery(baseOptions: Apollo.QueryHookOptions<SectionVersionsQuery, SectionVersionsQueryVariables> & ({ variables: SectionVersionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SectionVersionsQuery, SectionVersionsQueryVariables>(SectionVersionsDocument, options);
      }
export function useSectionVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SectionVersionsQuery, SectionVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SectionVersionsQuery, SectionVersionsQueryVariables>(SectionVersionsDocument, options);
        }
export function useSectionVersionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SectionVersionsQuery, SectionVersionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SectionVersionsQuery, SectionVersionsQueryVariables>(SectionVersionsDocument, options);
        }
export type SectionVersionsQueryHookResult = ReturnType<typeof useSectionVersionsQuery>;
export type SectionVersionsLazyQueryHookResult = ReturnType<typeof useSectionVersionsLazyQuery>;
export type SectionVersionsSuspenseQueryHookResult = ReturnType<typeof useSectionVersionsSuspenseQuery>;
export type SectionVersionsQueryResult = Apollo.QueryResult<SectionVersionsQuery, SectionVersionsQueryVariables>;
export const SectionsDisplayOrderDocument = gql`
    query SectionsDisplayOrder($templateId: Int!) {
  sections(templateId: $templateId) {
    displayOrder
  }
}
    `;

/**
 * __useSectionsDisplayOrderQuery__
 *
 * To run a query within a React component, call `useSectionsDisplayOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useSectionsDisplayOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSectionsDisplayOrderQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useSectionsDisplayOrderQuery(baseOptions: Apollo.QueryHookOptions<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables> & ({ variables: SectionsDisplayOrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables>(SectionsDisplayOrderDocument, options);
      }
export function useSectionsDisplayOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables>(SectionsDisplayOrderDocument, options);
        }
export function useSectionsDisplayOrderSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables>(SectionsDisplayOrderDocument, options);
        }
export type SectionsDisplayOrderQueryHookResult = ReturnType<typeof useSectionsDisplayOrderQuery>;
export type SectionsDisplayOrderLazyQueryHookResult = ReturnType<typeof useSectionsDisplayOrderLazyQuery>;
export type SectionsDisplayOrderSuspenseQueryHookResult = ReturnType<typeof useSectionsDisplayOrderSuspenseQuery>;
export type SectionsDisplayOrderQueryResult = Apollo.QueryResult<SectionsDisplayOrderQuery, SectionsDisplayOrderQueryVariables>;
export const PublishedSectionsDocument = gql`
    query PublishedSections($term: String!) {
  publishedSections(term: $term) {
    totalCount
    nextCursor
    items {
      id
      name
      displayOrder
      bestPractice
      modified
      created
      versionedTemplateId
      versionedTemplateName
      versionedQuestionCount
    }
  }
}
    `;

/**
 * __usePublishedSectionsQuery__
 *
 * To run a query within a React component, call `usePublishedSectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublishedSectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublishedSectionsQuery({
 *   variables: {
 *      term: // value for 'term'
 *   },
 * });
 */
export function usePublishedSectionsQuery(baseOptions: Apollo.QueryHookOptions<PublishedSectionsQuery, PublishedSectionsQueryVariables> & ({ variables: PublishedSectionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PublishedSectionsQuery, PublishedSectionsQueryVariables>(PublishedSectionsDocument, options);
      }
export function usePublishedSectionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PublishedSectionsQuery, PublishedSectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PublishedSectionsQuery, PublishedSectionsQueryVariables>(PublishedSectionsDocument, options);
        }
export function usePublishedSectionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PublishedSectionsQuery, PublishedSectionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PublishedSectionsQuery, PublishedSectionsQueryVariables>(PublishedSectionsDocument, options);
        }
export type PublishedSectionsQueryHookResult = ReturnType<typeof usePublishedSectionsQuery>;
export type PublishedSectionsLazyQueryHookResult = ReturnType<typeof usePublishedSectionsLazyQuery>;
export type PublishedSectionsSuspenseQueryHookResult = ReturnType<typeof usePublishedSectionsSuspenseQuery>;
export type PublishedSectionsQueryResult = Apollo.QueryResult<PublishedSectionsQuery, PublishedSectionsQueryVariables>;
export const PublishedSectionDocument = gql`
    query PublishedSection($versionedSectionId: Int!) {
  publishedSection(versionedSectionId: $versionedSectionId) {
    id
    introduction
    name
    requirements
    guidance
    displayOrder
    tags {
      id
      description
      name
    }
    errors {
      general
      name
      displayOrder
    }
  }
}
    `;

/**
 * __usePublishedSectionQuery__
 *
 * To run a query within a React component, call `usePublishedSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublishedSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublishedSectionQuery({
 *   variables: {
 *      versionedSectionId: // value for 'versionedSectionId'
 *   },
 * });
 */
export function usePublishedSectionQuery(baseOptions: Apollo.QueryHookOptions<PublishedSectionQuery, PublishedSectionQueryVariables> & ({ variables: PublishedSectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PublishedSectionQuery, PublishedSectionQueryVariables>(PublishedSectionDocument, options);
      }
export function usePublishedSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PublishedSectionQuery, PublishedSectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PublishedSectionQuery, PublishedSectionQueryVariables>(PublishedSectionDocument, options);
        }
export function usePublishedSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PublishedSectionQuery, PublishedSectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PublishedSectionQuery, PublishedSectionQueryVariables>(PublishedSectionDocument, options);
        }
export type PublishedSectionQueryHookResult = ReturnType<typeof usePublishedSectionQuery>;
export type PublishedSectionLazyQueryHookResult = ReturnType<typeof usePublishedSectionLazyQuery>;
export type PublishedSectionSuspenseQueryHookResult = ReturnType<typeof usePublishedSectionSuspenseQuery>;
export type PublishedSectionQueryResult = Apollo.QueryResult<PublishedSectionQuery, PublishedSectionQueryVariables>;
export const SectionDocument = gql`
    query Section($sectionId: Int!) {
  section(sectionId: $sectionId) {
    id
    introduction
    name
    requirements
    guidance
    displayOrder
    bestPractice
    isDirty
    questions {
      errors {
        general
        templateId
        sectionId
        questionText
        displayOrder
      }
      displayOrder
      guidanceText
      id
      questionText
      sectionId
      templateId
    }
    tags {
      id
      description
      name
    }
    errors {
      general
      name
      displayOrder
    }
    template {
      id
      bestPractice
      isDirty
      languageId
      name
      visibility
    }
  }
}
    `;

/**
 * __useSectionQuery__
 *
 * To run a query within a React component, call `useSectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useSectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSectionQuery({
 *   variables: {
 *      sectionId: // value for 'sectionId'
 *   },
 * });
 */
export function useSectionQuery(baseOptions: Apollo.QueryHookOptions<SectionQuery, SectionQueryVariables> & ({ variables: SectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SectionQuery, SectionQueryVariables>(SectionDocument, options);
      }
export function useSectionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SectionQuery, SectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SectionQuery, SectionQueryVariables>(SectionDocument, options);
        }
export function useSectionSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SectionQuery, SectionQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SectionQuery, SectionQueryVariables>(SectionDocument, options);
        }
export type SectionQueryHookResult = ReturnType<typeof useSectionQuery>;
export type SectionLazyQueryHookResult = ReturnType<typeof useSectionLazyQuery>;
export type SectionSuspenseQueryHookResult = ReturnType<typeof useSectionSuspenseQuery>;
export type SectionQueryResult = Apollo.QueryResult<SectionQuery, SectionQueryVariables>;
export const TagsDocument = gql`
    query Tags {
  tags {
    id
    name
    description
  }
}
    `;

/**
 * __useTagsQuery__
 *
 * To run a query within a React component, call `useTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useTagsQuery(baseOptions?: Apollo.QueryHookOptions<TagsQuery, TagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
      }
export function useTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TagsQuery, TagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
        }
export function useTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TagsQuery, TagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TagsQuery, TagsQueryVariables>(TagsDocument, options);
        }
export type TagsQueryHookResult = ReturnType<typeof useTagsQuery>;
export type TagsLazyQueryHookResult = ReturnType<typeof useTagsLazyQuery>;
export type TagsSuspenseQueryHookResult = ReturnType<typeof useTagsSuspenseQuery>;
export type TagsQueryResult = Apollo.QueryResult<TagsQuery, TagsQueryVariables>;
export const TemplateVersionsDocument = gql`
    query TemplateVersions($templateId: Int!) {
  templateVersions(templateId: $templateId) {
    name
    version
    versionType
    created
    comment
    id
    modified
    versionedBy {
      givenName
      surName
      affiliation {
        displayName
      }
      modified
    }
  }
}
    `;

/**
 * __useTemplateVersionsQuery__
 *
 * To run a query within a React component, call `useTemplateVersionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateVersionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateVersionsQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useTemplateVersionsQuery(baseOptions: Apollo.QueryHookOptions<TemplateVersionsQuery, TemplateVersionsQueryVariables> & ({ variables: TemplateVersionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TemplateVersionsQuery, TemplateVersionsQueryVariables>(TemplateVersionsDocument, options);
      }
export function useTemplateVersionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TemplateVersionsQuery, TemplateVersionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TemplateVersionsQuery, TemplateVersionsQueryVariables>(TemplateVersionsDocument, options);
        }
export function useTemplateVersionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TemplateVersionsQuery, TemplateVersionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TemplateVersionsQuery, TemplateVersionsQueryVariables>(TemplateVersionsDocument, options);
        }
export type TemplateVersionsQueryHookResult = ReturnType<typeof useTemplateVersionsQuery>;
export type TemplateVersionsLazyQueryHookResult = ReturnType<typeof useTemplateVersionsLazyQuery>;
export type TemplateVersionsSuspenseQueryHookResult = ReturnType<typeof useTemplateVersionsSuspenseQuery>;
export type TemplateVersionsQueryResult = Apollo.QueryResult<TemplateVersionsQuery, TemplateVersionsQueryVariables>;
export const MyVersionedTemplatesDocument = gql`
    query MyVersionedTemplates {
  myVersionedTemplates {
    id
    templateId
    name
    description
    visibility
    bestPractice
    version
    modified
    modifiedById
    modifiedByName
    ownerId
    ownerURI
    ownerDisplayName
    ownerSearchName
  }
}
    `;

/**
 * __useMyVersionedTemplatesQuery__
 *
 * To run a query within a React component, call `useMyVersionedTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyVersionedTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyVersionedTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyVersionedTemplatesQuery(baseOptions?: Apollo.QueryHookOptions<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>(MyVersionedTemplatesDocument, options);
      }
export function useMyVersionedTemplatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>(MyVersionedTemplatesDocument, options);
        }
export function useMyVersionedTemplatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>(MyVersionedTemplatesDocument, options);
        }
export type MyVersionedTemplatesQueryHookResult = ReturnType<typeof useMyVersionedTemplatesQuery>;
export type MyVersionedTemplatesLazyQueryHookResult = ReturnType<typeof useMyVersionedTemplatesLazyQuery>;
export type MyVersionedTemplatesSuspenseQueryHookResult = ReturnType<typeof useMyVersionedTemplatesSuspenseQuery>;
export type MyVersionedTemplatesQueryResult = Apollo.QueryResult<MyVersionedTemplatesQuery, MyVersionedTemplatesQueryVariables>;
export const PublishedTemplatesDocument = gql`
    query PublishedTemplates {
  publishedTemplates {
    totalCount
    nextCursor
    items {
      id
      templateId
      name
      description
      visibility
      bestPractice
      version
      modified
      modifiedById
      modifiedByName
      ownerId
      ownerURI
      ownerDisplayName
      ownerSearchName
    }
  }
}
    `;

/**
 * __usePublishedTemplatesQuery__
 *
 * To run a query within a React component, call `usePublishedTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublishedTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublishedTemplatesQuery({
 *   variables: {
 *   },
 * });
 */
export function usePublishedTemplatesQuery(baseOptions?: Apollo.QueryHookOptions<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>(PublishedTemplatesDocument, options);
      }
export function usePublishedTemplatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>(PublishedTemplatesDocument, options);
        }
export function usePublishedTemplatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>(PublishedTemplatesDocument, options);
        }
export type PublishedTemplatesQueryHookResult = ReturnType<typeof usePublishedTemplatesQuery>;
export type PublishedTemplatesLazyQueryHookResult = ReturnType<typeof usePublishedTemplatesLazyQuery>;
export type PublishedTemplatesSuspenseQueryHookResult = ReturnType<typeof usePublishedTemplatesSuspenseQuery>;
export type PublishedTemplatesQueryResult = Apollo.QueryResult<PublishedTemplatesQuery, PublishedTemplatesQueryVariables>;
export const TemplatesDocument = gql`
    query Templates($term: String) {
  myTemplates(term: $term) {
    totalCount
    nextCursor
    items {
      id
      name
      description
      visibility
      isDirty
      latestPublishVersion
      latestPublishDate
      ownerId
      ownerDisplayName
      modified
      modifiedById
      modifiedByName
    }
  }
}
    `;

/**
 * __useTemplatesQuery__
 *
 * To run a query within a React component, call `useTemplatesQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplatesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplatesQuery({
 *   variables: {
 *      term: // value for 'term'
 *   },
 * });
 */
export function useTemplatesQuery(baseOptions?: Apollo.QueryHookOptions<TemplatesQuery, TemplatesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TemplatesQuery, TemplatesQueryVariables>(TemplatesDocument, options);
      }
export function useTemplatesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TemplatesQuery, TemplatesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TemplatesQuery, TemplatesQueryVariables>(TemplatesDocument, options);
        }
export function useTemplatesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TemplatesQuery, TemplatesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TemplatesQuery, TemplatesQueryVariables>(TemplatesDocument, options);
        }
export type TemplatesQueryHookResult = ReturnType<typeof useTemplatesQuery>;
export type TemplatesLazyQueryHookResult = ReturnType<typeof useTemplatesLazyQuery>;
export type TemplatesSuspenseQueryHookResult = ReturnType<typeof useTemplatesSuspenseQuery>;
export type TemplatesQueryResult = Apollo.QueryResult<TemplatesQuery, TemplatesQueryVariables>;
export const TemplateDocument = gql`
    query Template($templateId: Int!) {
  template(templateId: $templateId) {
    id
    name
    description
    errors {
      general
      name
      ownerId
    }
    latestPublishVersion
    latestPublishDate
    created
    sections {
      id
      name
      bestPractice
      displayOrder
      isDirty
      questions {
        errors {
          general
          templateId
          sectionId
          questionText
          displayOrder
        }
        displayOrder
        guidanceText
        id
        questionText
        sectionId
        templateId
      }
    }
    owner {
      displayName
      id
    }
    visibility
    bestPractice
    isDirty
  }
}
    `;

/**
 * __useTemplateQuery__
 *
 * To run a query within a React component, call `useTemplateQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useTemplateQuery(baseOptions: Apollo.QueryHookOptions<TemplateQuery, TemplateQueryVariables> & ({ variables: TemplateQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TemplateQuery, TemplateQueryVariables>(TemplateDocument, options);
      }
export function useTemplateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TemplateQuery, TemplateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TemplateQuery, TemplateQueryVariables>(TemplateDocument, options);
        }
export function useTemplateSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TemplateQuery, TemplateQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TemplateQuery, TemplateQueryVariables>(TemplateDocument, options);
        }
export type TemplateQueryHookResult = ReturnType<typeof useTemplateQuery>;
export type TemplateLazyQueryHookResult = ReturnType<typeof useTemplateLazyQuery>;
export type TemplateSuspenseQueryHookResult = ReturnType<typeof useTemplateSuspenseQuery>;
export type TemplateQueryResult = Apollo.QueryResult<TemplateQuery, TemplateQueryVariables>;
export const TemplateCollaboratorsDocument = gql`
    query TemplateCollaborators($templateId: Int!) {
  template(templateId: $templateId) {
    id
    name
    collaborators {
      email
      id
      user {
        id
        email
        givenName
        surName
      }
    }
    admins {
      givenName
      surName
      email
    }
    owner {
      name
    }
  }
}
    `;

/**
 * __useTemplateCollaboratorsQuery__
 *
 * To run a query within a React component, call `useTemplateCollaboratorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useTemplateCollaboratorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTemplateCollaboratorsQuery({
 *   variables: {
 *      templateId: // value for 'templateId'
 *   },
 * });
 */
export function useTemplateCollaboratorsQuery(baseOptions: Apollo.QueryHookOptions<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables> & ({ variables: TemplateCollaboratorsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables>(TemplateCollaboratorsDocument, options);
      }
export function useTemplateCollaboratorsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables>(TemplateCollaboratorsDocument, options);
        }
export function useTemplateCollaboratorsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables>(TemplateCollaboratorsDocument, options);
        }
export type TemplateCollaboratorsQueryHookResult = ReturnType<typeof useTemplateCollaboratorsQuery>;
export type TemplateCollaboratorsLazyQueryHookResult = ReturnType<typeof useTemplateCollaboratorsLazyQuery>;
export type TemplateCollaboratorsSuspenseQueryHookResult = ReturnType<typeof useTemplateCollaboratorsSuspenseQuery>;
export type TemplateCollaboratorsQueryResult = Apollo.QueryResult<TemplateCollaboratorsQuery, TemplateCollaboratorsQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    givenName
    surName
    languageId
    emails {
      id
      email
      isPrimary
      isConfirmed
    }
    errors {
      general
      email
      password
      role
    }
    affiliation {
      id
      name
      searchName
      uri
    }
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;