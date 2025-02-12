import * as Apollo from '@apollo/client';
import {gql} from '@apollo/client';

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

export type AddProjectContributorInput = {
  /** The contributor's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The research project */
  projectId: Scalars['Int']['input'];
  /** The roles the contributor has on the research project */
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The contributor's last/sur name */
  surname?: InputMaybe<Scalars['String']['input']>;
};

export type AddProjectFunderInput = {
  /** The funder URI */
  funder: Scalars['String']['input'];
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project */
  projectId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFunderStatus>;
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
  /** This will be used as a sort of title for the Question */
  questionText?: InputMaybe<Scalars['String']['input']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: InputMaybe<Scalars['Int']['input']>;
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
  /** The primary contact email */
  contactEmail?: Maybe<Scalars['String']['output']>;
  /** The primary contact name */
  contactName?: Maybe<Scalars['String']['output']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['output'];
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

/** Input options for adding an Affiliation */
export type AffiliationInput = {
  /** Acronyms for the affiliation */
  acronyms?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether or not the Affiliation is active and available in search results */
  active: Scalars['Boolean']['input'];
  /** Alias names for the affiliation */
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The primary contact email */
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  /** The primary contact name */
  contactName?: InputMaybe<Scalars['String']['input']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['input'];
  /** The email address(es) to notify when feedback has been requested (stored as JSON array) */
  feedbackEmails?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the affiliation wants to use the feedback workflow */
  feedbackEnabled: Scalars['Boolean']['input'];
  /** The message to display to users when they request feedback */
  feedbackMessage?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['input'];
  /** The Crossref Funder id */
  fundrefId?: InputMaybe<Scalars['String']['input']>;
  /** The official homepage for the affiliation */
  homepage?: InputMaybe<Scalars['String']['input']>;
  /** The logo file name */
  logoName?: InputMaybe<Scalars['String']['input']>;
  /** The URI of the logo */
  logoURI?: InputMaybe<Scalars['String']['input']>;
  /** Whether or not the affiliation is allowed to have administrators */
  managed: Scalars['Boolean']['input'];
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['input'];
  /** The email domains associated with the affiliation (for SSO) */
  ssoEmailDomains?: InputMaybe<Array<AffiliationEmailDomainInput>>;
  /** The SSO entityId */
  ssoEntityId?: InputMaybe<Scalars['String']['input']>;
  /** The links the affiliation's users can use to get help */
  subHeaderLinks?: InputMaybe<Array<AffiliationLinkInput>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types: Array<AffiliationType>;
  /** The unique identifer for the affiliation (Not editable!) */
  uri: Scalars['String']['input'];
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
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The unique identifer for the affiliation (typically the ROR id) */
  id: Scalars['Int']['output'];
  /** The categories the Affiliation belongs to */
  types: Array<AffiliationType>;
  /** The URI of the affiliation */
  uri: Scalars['String']['output'];
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
  /** The answer to the question */
  answerText?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The DMP that the answer belongs to */
  plan: Plan;
  /** The question in the template the answer is for */
  versionedQuestion: VersionedQuestion;
  /** The question in the template the answer is for */
  versionedSection: VersionedSection;
};

export type AnswerComment = {
  __typename?: 'AnswerComment';
  /** The answer the comment is associated with */
  answer: Answer;
  /** The comment */
  commentText: Scalars['String']['output'];
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
};

/** The result of the findCollaborator query */
export type CollaboratorSearchResult = {
  __typename?: 'CollaboratorSearchResult';
  /** The collaborator's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The collaborator's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The collaborator's last/sur name */
  surName?: Maybe<Scalars['String']['output']>;
};

export type ContributorRole = {
  __typename?: 'ContributorRole';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A longer description of the contributor role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  /** The order in which to display these items when displayed in the UI */
  displayOrder: Scalars['Int']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The Ui label to display for the contributor role */
  label: Scalars['String']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The URL for the contributor role */
  url: Scalars['URL']['output'];
};

export type ContributorRoleMutationResponse = {
  __typename?: 'ContributorRoleMutationResponse';
  /** Similar to HTTP status code, represents the status of the mutation */
  code: Scalars['Int']['output'];
  /**
   * The contributor role that was impacted by the mutation.
   * The new one if we were adding, the one that was updated when updating, or the one deletd when removing
   */
  contributorRole?: Maybe<ContributorRole>;
  /** Human-readable message for the UI */
  message: Scalars['String']['output'];
  /** Indicates whether the mutation was successful */
  success: Scalars['Boolean']['output'];
};

export type EditProjectContributorInput = {
  /** The contributor's affiliation URI */
  affiliationId?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's first/given name */
  givenName?: InputMaybe<Scalars['String']['input']>;
  /** The contributor's ORCID */
  orcid?: InputMaybe<Scalars['String']['input']>;
  /** The project contributor */
  projectContributorId: Scalars['Int']['input'];
  /** The roles the contributor has on the research project */
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The contributor's last/sur name */
  surname?: InputMaybe<Scalars['String']['input']>;
};

export type EditProjectFunderInput = {
  /** The funder's unique id/url for the call for submissions to apply for a grant */
  funderOpportunityNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the research project (normally assigned after the grant has been awarded) */
  funderProjectNumber?: InputMaybe<Scalars['String']['input']>;
  /** The funder's unique id/url for the award/grant (normally assigned after the grant has been awarded) */
  grantId?: InputMaybe<Scalars['String']['input']>;
  /** The project funder */
  projectFunderId: Scalars['Int']['input'];
  /** The status of the funding resquest */
  status?: InputMaybe<ProjectFunderStatus>;
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

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Reactivate the specified user Account (Admin only) */
  activateUser?: Maybe<User>;
  /** Create a new Affiliation */
  addAffiliation?: Maybe<Affiliation>;
  /** Add a new contributor role (URL and label must be unique!) */
  addContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Add a comment to an answer within a round of feedback */
  addFeedbackComment?: Maybe<PlanFeedbackComment>;
  /** Create a plan */
  addPlan?: Maybe<Plan>;
  /** Answer a question */
  addPlanAnswer?: Maybe<Answer>;
  /** Add a collaborator to a Plan */
  addPlanCollaborator?: Maybe<PlanCollaborator>;
  /** Add a Contributor to a Plan */
  addPlanContributor?: Maybe<PlanContributor>;
  /** Add a contributor to a research project */
  addProjectContributor?: Maybe<ProjectContributor>;
  /** Add a Funder to a research project */
  addProjectFunder?: Maybe<ProjectFunder>;
  /** Create a new Question */
  addQuestion: Question;
  /** Create a new QuestionCondition associated with a question */
  addQuestionCondition: QuestionCondition;
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
  /** Archive a Template (unpublishes any associated PublishedTemplate */
  archiveTemplate?: Maybe<Scalars['Boolean']['output']>;
  /** Mark the feedback round as complete */
  completeFeedback?: Maybe<PlanFeedback>;
  /** Publish the template or save as a draft */
  createTemplateVersion?: Maybe<Template>;
  /** Deactivate the specified user Account (Admin only) */
  deactivateUser?: Maybe<User>;
  /** Download the plan */
  downloadPlan?: Maybe<Scalars['String']['output']>;
  /** Edit an answer */
  editPlanAnswer?: Maybe<Answer>;
  /** Update a contributor on the research project */
  editProjectContributor?: Maybe<ProjectContributor>;
  /** Update a Funder on the research project */
  editProjectFunder?: Maybe<ProjectFunder>;
  /** Change the plan's status to COMPLETE (cannot be done once the plan is PUBLISHED) */
  markPlanComplete?: Maybe<Plan>;
  /** Change the plan's status to DRAFT (cannot be done once the plan is PUBLISHED) */
  markPlanDraft?: Maybe<Plan>;
  /** Merge the 2 user accounts (Admin only) */
  mergeUsers?: Maybe<User>;
  /** Publish a plan (changes status to PUBLISHED) */
  publishPlan?: Maybe<Plan>;
  /** Delete an Affiliation (only applicable to AffiliationProvenance == DMPTOOL) */
  removeAffiliation?: Maybe<Affiliation>;
  /** Delete the contributor role */
  removeContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Remove a comment to an answer within a round of feedback */
  removeFeedbackComment?: Maybe<Scalars['Boolean']['output']>;
  /** Remove a PlanCollaborator from a Plan */
  removePlanCollaborator?: Maybe<Scalars['Boolean']['output']>;
  /** Remove a PlanContributor from a Plan */
  removePlanContributor?: Maybe<Scalars['Boolean']['output']>;
  /** Remove a research project contributor */
  removeProjectContributor?: Maybe<Scalars['Boolean']['output']>;
  /** Remove a research project Funder */
  removeProjectFunder?: Maybe<Scalars['Boolean']['output']>;
  /** Remove a PlanFunder from a Plan */
  removeProjectFunderFromPlan?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a Question */
  removeQuestion?: Maybe<Question>;
  /** Remove a QuestionCondition using a specific QuestionCondition id */
  removeQuestionCondition?: Maybe<QuestionCondition>;
  /** Delete a section */
  removeSection: Section;
  /** Delete a tag */
  removeTag?: Maybe<Tag>;
  /** Remove a TemplateCollaborator from a Template */
  removeTemplateCollaborator?: Maybe<Scalars['Boolean']['output']>;
  /** Anonymize the current user's account (essentially deletes their account without orphaning things) */
  removeUser?: Maybe<User>;
  /** Remove an email address from the current user */
  removeUserEmail?: Maybe<UserEmail>;
  /** Request a round of admin feedback */
  requestFeedback?: Maybe<PlanFeedback>;
  /** Add a Funder to a Plan */
  selectProjectFunderForPlan?: Maybe<ProjectFunder>;
  /** Designate the email as the current user's primary email address */
  setPrimaryUserEmail?: Maybe<Array<Maybe<UserEmail>>>;
  /** Set the user's ORCID */
  setUserOrcid?: Maybe<User>;
  /** Update an Affiliation */
  updateAffiliation?: Maybe<Affiliation>;
  /** Update the contributor role */
  updateContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Change the current user's password */
  updatePassword?: Maybe<User>;
  /** Chnage a collaborator's accessLevel on a Plan */
  updatePlanCollaborator?: Maybe<PlanCollaborator>;
  /** Chnage a Contributor's accessLevel on a Plan */
  updatePlanContributor?: Maybe<PlanContributor>;
  /** Update a Question */
  updateQuestion: Question;
  /** Update a QuestionCondition for a specific QuestionCondition id */
  updateQuestionCondition?: Maybe<QuestionCondition>;
  /** Separate Question update specifically for options */
  updateQuestionOptions?: Maybe<Question>;
  /** Update a Section */
  updateSection: Section;
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


export type MutationAddContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationAddFeedbackCommentArgs = {
  answerId: Scalars['Int']['input'];
  commentText: Scalars['String']['input'];
  planFeedbackId: Scalars['Int']['input'];
};


export type MutationAddPlanArgs = {
  projectId: Scalars['Int']['input'];
  versionedTemplateId: Scalars['Int']['input'];
};


export type MutationAddPlanAnswerArgs = {
  answerText?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['Int']['input'];
  versionedQuestionId: Scalars['Int']['input'];
  versionedSectionId: Scalars['Int']['input'];
};


export type MutationAddPlanCollaboratorArgs = {
  email: Scalars['String']['input'];
  planId: Scalars['Int']['input'];
};


export type MutationAddPlanContributorArgs = {
  planId: Scalars['Int']['input'];
  projectContributorId: Scalars['Int']['input'];
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationAddProjectContributorArgs = {
  input: AddProjectContributorInput;
};


export type MutationAddProjectFunderArgs = {
  input: AddProjectFunderInput;
};


export type MutationAddQuestionArgs = {
  input: AddQuestionInput;
};


export type MutationAddQuestionConditionArgs = {
  input: AddQuestionConditionInput;
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


export type MutationDownloadPlanArgs = {
  format: PlanDownloadFormat;
  planId: Scalars['Int']['input'];
};


export type MutationEditPlanAnswerArgs = {
  answerId: Scalars['Int']['input'];
  answerText?: InputMaybe<Scalars['String']['input']>;
};


export type MutationEditProjectContributorArgs = {
  input: EditProjectContributorInput;
};


export type MutationEditProjectFunderArgs = {
  input: EditProjectFunderInput;
};


export type MutationMarkPlanCompleteArgs = {
  planId: Scalars['Int']['input'];
};


export type MutationMarkPlanDraftArgs = {
  planId: Scalars['Int']['input'];
};


export type MutationMergeUsersArgs = {
  userIdToBeMerged: Scalars['Int']['input'];
  userIdToKeep: Scalars['Int']['input'];
};


export type MutationPublishPlanArgs = {
  planId: Scalars['Int']['input'];
  visibility?: InputMaybe<PlanVisibility>;
};


export type MutationRemoveAffiliationArgs = {
  affiliationId: Scalars['Int']['input'];
};


export type MutationRemoveContributorRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveFeedbackCommentArgs = {
  PlanFeedbackCommentId: Scalars['Int']['input'];
};


export type MutationRemovePlanCollaboratorArgs = {
  planCollaboratorId: Scalars['Int']['input'];
};


export type MutationRemovePlanContributorArgs = {
  planContributorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectContributorArgs = {
  projectContributorId: Scalars['Int']['input'];
};


export type MutationRemoveProjectFunderArgs = {
  projectFunderId: Scalars['Int']['input'];
};


export type MutationRemoveProjectFunderFromPlanArgs = {
  planId: Scalars['Int']['input'];
  projectFunderId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionArgs = {
  questionId: Scalars['Int']['input'];
};


export type MutationRemoveQuestionConditionArgs = {
  questionConditionId: Scalars['Int']['input'];
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


export type MutationSelectProjectFunderForPlanArgs = {
  planId: Scalars['Int']['input'];
  projectFunderId: Scalars['Int']['input'];
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


export type MutationUpdateContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationUpdatePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationUpdatePlanCollaboratorArgs = {
  accessLevel: PlanCollaboratorAccessLevel;
  planCollaboratorId: Scalars['Int']['input'];
};


export type MutationUpdatePlanContributorArgs = {
  planContributorId: Scalars['Int']['input'];
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateQuestionArgs = {
  input: UpdateQuestionInput;
};


export type MutationUpdateQuestionConditionArgs = {
  input: UpdateQuestionConditionInput;
};


export type MutationUpdateQuestionOptionsArgs = {
  questionId: Scalars['Int']['input'];
  required?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationUpdateSectionArgs = {
  input: UpdateSectionInput;
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

/** A Data Managament Plan (DMP) */
export type Plan = {
  __typename?: 'Plan';
  /** The plan's answers to the template questions */
  answers?: Maybe<Array<Answer>>;
  /** People who are collaborating on the the DMP content */
  collaborators?: Maybe<Array<PlanCollaborator>>;
  /** People who are contributing to the research project (not just the DMP) */
  contributors?: Maybe<Array<PlanContributor>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The DMP ID/DOI for the plan */
  dmpId?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** Rounds of administrator feedback provided for the Plan */
  feedback?: Maybe<Array<PlanFeedback>>;
  /** The funder who is supporting the work defined by the DMP */
  funders?: Maybe<Array<ProjectFunder>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The last person to have changed any part of the DMP (add collaborators, answer questions, etc.) */
  lastUpdatedBy?: Maybe<Scalars['String']['output']>;
  /** The last time any part of the DMP was updated (add collaborators, answer questions, etc.) */
  lastUpdatedOn?: Maybe<Scalars['String']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The status of the plan */
  status?: Maybe<PlanStatus>;
  /** The template the plan is based on */
  versionedTemplate: VersionedTemplate;
  /** The name/title of the plan (typically copied over from the project) */
  visibility?: Maybe<PlanVisibility>;
};

/** A user that that belongs to a different affiliation that can edit the Plan */
export type PlanCollaborator = {
  __typename?: 'PlanCollaborator';
  /** The user's access level */
  accessLevel?: Maybe<PlanCollaboratorAccessLevel>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The collaborator's email */
  email: Scalars['String']['output'];
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user who invited the collaborator */
  invitedBy?: Maybe<User>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The plan the collaborator may edit */
  plan?: Maybe<Plan>;
  /** The collaborator (if they have an account) */
  user?: Maybe<User>;
};

export enum PlanCollaboratorAccessLevel {
  /** The user is able to perform all actions on a Plan (typically restricted to the owner/creator) */
  Admin = 'ADMIN',
  /** The user is ONLY able to comment on the Plan's answers */
  Commenter = 'COMMENTER',
  /** The user is able to comment and edit the Plan's answers, add/edit/delete contributors and research outputs */
  Editor = 'EDITOR'
}

/** A person involved with the research project who will appear in the Plan's citation and landing page */
export type PlanContributor = {
  __typename?: 'PlanContributor';
  /** The contributor's affiliation */
  ProjectContributor?: Maybe<ProjectContributor>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The Plan */
  plan: Plan;
  /** The roles the contributor has for this specific plan (can differ from the project) */
  roles?: Maybe<Array<ContributorRole>>;
};

export enum PlanDownloadFormat {
  Csv = 'CSV',
  Docx = 'DOCX',
  Html = 'HTML',
  Json = 'JSON',
  Pdf = 'PDF',
  Text = 'TEXT'
}

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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
};

export enum PlanStatus {
  /** The Plan is ready for submission or download */
  Complete = 'COMPLETE',
  /** The Plan is still being written and reviewed */
  Draft = 'DRAFT',
  /** The Plan's DMP ID (DOI) has been registered */
  Published = 'PUBLISHED'
}

export enum PlanVisibility {
  /** Visible only to people at the user's (or editor's) affiliation */
  Organizational = 'ORGANIZATIONAL',
  /** Visible only to people who have been invited to collaborate (or provide feedback) */
  Private = 'PRIVATE',
  /** Visible to anyone */
  Public = 'PUBLIC'
}

export type Project = {
  __typename?: 'Project';
  /** The research project abstract */
  abstract?: Maybe<Scalars['String']['output']>;
  /** People who are contributing to the research project (not just the DMP) */
  contributors?: Maybe<Array<ProjectContributor>>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The estimated date the research project will end (use YYYY-MM-DD format) */
  endDate?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The funders who are supporting the research project */
  funders?: Maybe<Array<ProjectFunder>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is test/mock research project */
  isTestProject?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The type of research being done */
  researchDomain?: Maybe<ResearchDomain>;
  /** The estimated date the research project will begin (use YYYY-MM-DD format) */
  startDate?: Maybe<Scalars['String']['output']>;
  /** The name/title of the research project */
  title: Scalars['String']['output'];
};

/** A person involved with a research project */
export type ProjectContributor = {
  __typename?: 'ProjectContributor';
  /** The contributor's affiliation */
  affiliation?: Maybe<Affiliation>;
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** The contributor's email address */
  email?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The contributor's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The contributor's ORCID */
  orcid?: Maybe<Scalars['String']['output']>;
  /** The research project */
  project: Project;
  /** The roles the contributor has on the research project */
  roles?: Maybe<Array<ContributorRole>>;
  /** The contributor's last/sur name */
  surname?: Maybe<Scalars['String']['output']>;
};

/** A funder affiliation that is supporting a research project */
export type ProjectFunder = {
  __typename?: 'ProjectFunder';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The funder */
  funder: Affiliation;
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
  project: Project;
  /** The status of the funding resquest */
  status?: Maybe<ProjectFunderStatus>;
};

/** The status of the funding */
export enum ProjectFunderStatus {
  /** The funder did not award the project */
  Denied = 'DENIED',
  /** The funding has been awarded to the project */
  Granted = 'GRANTED',
  /** The project will be submitting a grant, or has not yet heard back from the funder */
  Planned = 'PLANNED'
}

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
  affiliations?: Maybe<Array<Maybe<AffiliationSearch>>>;
  /** Archive a plan */
  archivePlan?: Maybe<Plan>;
  /** Get the contributor role by it's id */
  contributorRoleById?: Maybe<ContributorRole>;
  /** Get the contributor role by it's URL */
  contributorRoleByURL?: Maybe<ContributorRole>;
  /** Get all of the contributor role types */
  contributorRoles?: Maybe<Array<Maybe<ContributorRole>>>;
  /** Search for a User to add as a collaborator */
  findCollaborator?: Maybe<Array<Maybe<CollaboratorSearchResult>>>;
  /** Get all of the supported Languages */
  languages?: Maybe<Array<Maybe<Language>>>;
  /** Returns the currently logged in user's information */
  me?: Maybe<User>;
  /** Get a specific plan */
  plan?: Maybe<Plan>;
  /** Get all of the Users that are collaborators for the Plan */
  planCollaborators?: Maybe<Array<Maybe<PlanCollaborator>>>;
  /** Get all of the Users that are contributors for the specific Plan */
  planContributors?: Maybe<Array<Maybe<PlanContributor>>>;
  /** Get all rounds of admin feedback for the plan */
  planFeedback?: Maybe<Array<Maybe<PlanFeedback>>>;
  /** Get all of the comments associated with the round of admin feedback */
  planFeedbackComments?: Maybe<Array<Maybe<PlanFeedbackComment>>>;
  /** Get all of the Users that are Funders for the specific Plan */
  planFunders?: Maybe<Array<Maybe<ProjectFunder>>>;
  /** Get all of the comments associated with the round of admin feedback */
  planQuestionAnswer?: Maybe<Answer>;
  /** Get all rounds of admin feedback for the plan */
  planSectionAnswers?: Maybe<Array<Maybe<Answer>>>;
  /** Get all plans for the research project */
  plans?: Maybe<Array<Maybe<Plan>>>;
  /** Get all of the Users that a contributors to the research project */
  projectContributors?: Maybe<Array<Maybe<ProjectContributor>>>;
  /** Get all of the Users that a Funders to the research project */
  projectFunders?: Maybe<Array<Maybe<ProjectFunder>>>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedConditionsForQuestion?: Maybe<Array<Maybe<VersionedQuestionCondition>>>;
  /** Search for VersionedQuestions that belong to Section specified by sectionId */
  publishedQuestions?: Maybe<Array<Maybe<VersionedQuestion>>>;
  /** Search for VersionedSection whose name contains the search term */
  publishedSections?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Search for VersionedTemplate whose name or owning Org's name contains the search term */
  publishedTemplates?: Maybe<Array<Maybe<VersionedTemplate>>>;
  /** Get the specific Question based on questionId */
  question?: Maybe<Question>;
  /** Get the QuestionConditions that belong to a specific question */
  questionConditions?: Maybe<Array<Maybe<QuestionCondition>>>;
  /** Get all the QuestionTypes */
  questionTypes?: Maybe<Array<Maybe<QuestionType>>>;
  /** Get the Questions that belong to the associated sectionId */
  questions?: Maybe<Array<Maybe<Question>>>;
  /** Get all the QuestionTypes */
  researchDomains?: Maybe<Array<Maybe<ResearchDomain>>>;
  /** Get the specified section */
  section?: Maybe<Section>;
  /** Get all of the VersionedSection for the specified Section ID */
  sectionVersions?: Maybe<Array<Maybe<VersionedSection>>>;
  /** Get the Sections that belong to the associated templateId */
  sections?: Maybe<Array<Maybe<Section>>>;
  /** Get all available tags to display */
  tags: Array<Tag>;
  tagsBySectionId?: Maybe<Array<Maybe<Tag>>>;
  /** Get the specified Template (user must be an Admin) */
  template?: Maybe<Template>;
  /** Get all of the Users that belong to another affiliation that can edit the Template */
  templateCollaborators?: Maybe<Array<Maybe<TemplateCollaborator>>>;
  /** Get all of the VersionedTemplate for the specified Template (a.k. the Template history) */
  templateVersions?: Maybe<Array<Maybe<VersionedTemplate>>>;
  /** Get the Templates that belong to the current user's affiliation (user must be an Admin) */
  templates?: Maybe<Array<Maybe<Template>>>;
  /** Returns the specified user (Admin only) */
  user?: Maybe<User>;
  /** Returns all of the users associated with the current user's affiliation (Admin only) */
  users?: Maybe<Array<Maybe<User>>>;
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
};


export type QueryArchivePlanArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryContributorRoleByIdArgs = {
  contributorRoleId: Scalars['Int']['input'];
};


export type QueryContributorRoleByUrlArgs = {
  contributorRoleURL: Scalars['URL']['input'];
};


export type QueryFindCollaboratorArgs = {
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanCollaboratorsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanContributorsArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanFeedbackCommentsArgs = {
  planFeedbackId: Scalars['Int']['input'];
};


export type QueryPlanFundersArgs = {
  planId: Scalars['Int']['input'];
};


export type QueryPlanQuestionAnswerArgs = {
  answerId: Scalars['Int']['input'];
  questionId: Scalars['Int']['input'];
};


export type QueryPlanSectionAnswersArgs = {
  planId: Scalars['Int']['input'];
  sectionId: Scalars['Int']['input'];
};


export type QueryPlansArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectContributorsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectFundersArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryPublishedConditionsForQuestionArgs = {
  versionedQuestionId: Scalars['Int']['input'];
};


export type QueryPublishedQuestionsArgs = {
  versionedSectionId: Scalars['Int']['input'];
};


export type QueryPublishedSectionsArgs = {
  term: Scalars['String']['input'];
};


export type QueryPublishedTemplatesArgs = {
  term: Scalars['String']['input'];
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


export type QuerySectionArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionVersionsArgs = {
  sectionId: Scalars['Int']['input'];
};


export type QuerySectionsArgs = {
  templateId: Scalars['Int']['input'];
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the Question has had any changes since the related template was last published */
  isDirty?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The conditional logic triggered by this question */
  questionConditions?: Maybe<Array<QuestionCondition>>;
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: Maybe<Scalars['Int']['output']>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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

/** The type of Question, such as text field, radio buttons, etc */
export type QuestionType = {
  __typename?: 'QuestionType';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not this is the default question type */
  isDefault: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the QuestionType, like 'Short text question' */
  name: Scalars['String']['output'];
  /** The description of the QuestionType */
  usageDescription: Scalars['String']['output'];
};

/** An aread of research (e.g. Electrical Engineering, Cellular biology, etc.) */
export type ResearchDomain = {
  __typename?: 'ResearchDomain';
  /** The timestamp when the Object was created */
  created?: Maybe<Scalars['String']['output']>;
  /** The user who created the Object */
  createdById?: Maybe<Scalars['Int']['output']>;
  /** A description of the type of research covered by the domain */
  description?: Maybe<Scalars['String']['output']>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The name of the domain */
  name: Scalars['String']['output'];
  /** The URL of the research domain */
  uri: Scalars['String']['output'];
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The tag name */
  name: Scalars['String']['output'];
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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

/** Template version type */
export enum TemplateVersionType {
  /** Draft - saved state for internal review */
  Draft = 'DRAFT',
  /** Published - saved state for use when creating DMPs */
  Published = 'PUBLISHED'
}

/** Template visibility */
export enum TemplateVisibility {
  /** Visible only to users of your institution */
  Private = 'PRIVATE',
  /** Visible to all users */
  Public = 'PUBLIC'
}

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
  email: Scalars['EmailAddress']['output'];
  /** The user's email addresses */
  emails?: Maybe<Array<Maybe<UserEmail>>>;
  /** Errors associated with the Object */
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The number of failed login attempts */
  failed_sign_in_attemps?: Maybe<Scalars['Int']['output']>;
  /** The user's first/given name */
  givenName?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The user's preferred language */
  languageId: Scalars['String']['output'];
  /** The timestamp of the last login */
  last_sign_in?: Maybe<Scalars['String']['output']>;
  /** The method user for the last login: PASSWORD or SSO */
  last_sign_in_via?: Maybe<Scalars['String']['output']>;
  /** Whether or not the account is locked from failed login attempts */
  locked?: Maybe<Scalars['Boolean']['output']>;
  /** The timestamp when the Object was last modifed */
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** Whether or not the email address has been confirmed */
  isConfirmed: Scalars['Boolean']['output'];
  /** Whether or not this is the primary email address */
  isPrimary: Scalars['Boolean']['output'];
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** The user the email belongs to */
  userId: Scalars['Int']['output'];
};

/** The types of roles supported by the DMPTool */
export enum UserRole {
  Admin = 'ADMIN',
  Researcher = 'RESEARCHER',
  Superadmin = 'SUPERADMIN'
}

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
  errors?: Maybe<Array<Scalars['String']['output']>>;
  /** Guidance to complete the question */
  guidanceText?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the Object */
  id?: Maybe<Scalars['Int']['output']>;
  /** The timestamp when the Object was last modifed */
  modified?: Maybe<Scalars['String']['output']>;
  /** The user who last modified the Object */
  modifiedById?: Maybe<Scalars['Int']['output']>;
  /** Id of the original question that was versioned */
  questionId: Scalars['Int']['output'];
  /** This will be used as a sort of title for the Question */
  questionText?: Maybe<Scalars['String']['output']>;
  /** The type of question, such as text field, select box, radio buttons, etc */
  questionTypeId?: Maybe<Scalars['Int']['output']>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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
  errors?: Maybe<Array<Scalars['String']['output']>>;
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

export type AddSectionMutationVariables = Exact<{
  input: AddSectionInput;
}>;


export type AddSectionMutation = { __typename?: 'Mutation', addSection: { __typename?: 'Section', id?: number | null, guidance?: string | null, errors?: Array<string> | null, displayOrder?: number | null, introduction?: string | null, isDirty: boolean, name: string, requirements?: string | null, tags?: Array<{ __typename?: 'Tag', name: string } | null> | null, questions?: Array<{ __typename?: 'Question', id?: number | null, errors?: Array<string> | null }> | null } };

export type UpdateSectionMutationVariables = Exact<{
  input: UpdateSectionInput;
}>;


export type UpdateSectionMutation = { __typename?: 'Mutation', updateSection: { __typename?: 'Section', id?: number | null, name: string, introduction?: string | null, requirements?: string | null, guidance?: string | null, displayOrder?: number | null, errors?: Array<string> | null, bestPractice?: boolean | null, tags?: Array<{ __typename?: 'Tag', id?: number | null, description?: string | null, name: string } | null> | null } };

export type ArchiveTemplateMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type ArchiveTemplateMutation = { __typename?: 'Mutation', archiveTemplate?: boolean | null };

export type CreateTemplateVersionMutationVariables = Exact<{
  templateId: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  versionType?: InputMaybe<TemplateVersionType>;
  visibility: TemplateVisibility;
}>;


export type CreateTemplateVersionMutation = { __typename?: 'Mutation', createTemplateVersion?: { __typename?: 'Template', errors?: Array<string> | null, name: string } | null };

export type UpdateUserProfileMutationVariables = Exact<{
  input: UpdateUserProfileInput;
}>;


export type UpdateUserProfileMutation = { __typename?: 'Mutation', updateUserProfile?: { __typename?: 'User', id?: number | null, givenName?: string | null, surName?: string | null, errors?: Array<string> | null, languageId: string, email: any, affiliation?: { __typename?: 'Affiliation', id?: number | null, name: string, searchName: string, uri: string } | null } | null };

export type AddUserEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
  isPrimary: Scalars['Boolean']['input'];
}>;


export type AddUserEmailMutation = { __typename?: 'Mutation', addUserEmail?: { __typename?: 'UserEmail', email: string, errors?: Array<string> | null, isPrimary: boolean, isConfirmed: boolean, id?: number | null, userId: number } | null };

export type RemoveUserEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type RemoveUserEmailMutation = { __typename?: 'Mutation', removeUserEmail?: { __typename?: 'UserEmail', errors?: Array<string> | null } | null };

export type SetPrimaryUserEmailMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type SetPrimaryUserEmailMutation = { __typename?: 'Mutation', setPrimaryUserEmail?: Array<{ __typename?: 'UserEmail', id?: number | null, errors?: Array<string> | null, email: string, isConfirmed: boolean, isPrimary: boolean, userId: number } | null> | null };

export type AffiliationsQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AffiliationsQuery = { __typename?: 'Query', affiliations?: Array<{ __typename?: 'AffiliationSearch', id: number, displayName: string, uri: string } | null> | null };

export type ContributorRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type ContributorRolesQuery = { __typename?: 'Query', contributorRoles?: Array<{ __typename?: 'ContributorRole', id?: number | null, label: string, url: any } | null> | null };

export type LanguagesQueryVariables = Exact<{ [key: string]: never; }>;


export type LanguagesQuery = { __typename?: 'Query', languages?: Array<{ __typename?: 'Language', id: string, isDefault: boolean, name: string } | null> | null };

export type SectionsDisplayOrderQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type SectionsDisplayOrderQuery = { __typename?: 'Query', sections?: Array<{ __typename?: 'Section', displayOrder?: number | null } | null> | null };

export type SectionQueryVariables = Exact<{
  sectionId: Scalars['Int']['input'];
}>;


export type SectionQuery = { __typename?: 'Query', section?: { __typename?: 'Section', id?: number | null, introduction?: string | null, name: string, requirements?: string | null, guidance?: string | null, displayOrder?: number | null, bestPractice?: boolean | null, errors?: Array<string> | null, tags?: Array<{ __typename?: 'Tag', id?: number | null, description?: string | null, name: string } | null> | null, template?: { __typename?: 'Template', id?: number | null } | null } | null };

export type TagsQueryVariables = Exact<{ [key: string]: never; }>;


export type TagsQuery = { __typename?: 'Query', tags: Array<{ __typename?: 'Tag', id?: number | null, name: string, description?: string | null }> };

export type TemplateVersionsQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type TemplateVersionsQuery = { __typename?: 'Query', templateVersions?: Array<{ __typename?: 'VersionedTemplate', name: string, version: string, versionType?: TemplateVersionType | null, created?: string | null, comment?: string | null, id?: number | null, modified?: string | null, versionedBy?: { __typename?: 'User', givenName?: string | null, surName?: string | null, modified?: string | null, affiliation?: { __typename?: 'Affiliation', displayName: string } | null } | null } | null> | null };

export type TemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type TemplatesQuery = { __typename?: 'Query', templates?: Array<{ __typename?: 'Template', name: string, description?: string | null, modified?: string | null, id?: number | null, owner?: { __typename?: 'Affiliation', name: string, displayName: string, searchName: string } | null } | null> | null };

export type TemplateQueryVariables = Exact<{
  templateId: Scalars['Int']['input'];
}>;


export type TemplateQuery = { __typename?: 'Query', template?: { __typename?: 'Template', name: string, description?: string | null, errors?: Array<string> | null, latestPublishVersion?: string | null, latestPublishDate?: string | null, created?: string | null, sections?: Array<{ __typename?: 'Section', id?: number | null, name: string, bestPractice?: boolean | null, displayOrder?: number | null, isDirty: boolean, questions?: Array<{ __typename?: 'Question', errors?: Array<string> | null, displayOrder?: number | null, guidanceText?: string | null, id?: number | null, questionText?: string | null, sectionId: number, templateId: number }> | null } | null> | null, owner?: { __typename?: 'Affiliation', displayName: string, id?: number | null } | null } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id?: number | null, givenName?: string | null, surName?: string | null, languageId: string, errors?: Array<string> | null, emails?: Array<{ __typename?: 'UserEmail', id?: number | null, email: string, isPrimary: boolean, isConfirmed: boolean } | null> | null, affiliation?: { __typename?: 'Affiliation', id?: number | null, name: string, searchName: string, uri: string } | null } | null };


export const AddSectionDocument = gql`
    mutation AddSection($input: AddSectionInput!) {
  addSection(input: $input) {
    id
    tags {
      name
    }
    guidance
    errors
    displayOrder
    introduction
    isDirty
    name
    questions {
      id
      errors
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
    errors
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
export const ArchiveTemplateDocument = gql`
    mutation ArchiveTemplate($templateId: Int!) {
  archiveTemplate(templateId: $templateId)
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
    errors
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
export const UpdateUserProfileDocument = gql`
    mutation UpdateUserProfile($input: updateUserProfileInput!) {
  updateUserProfile(input: $input) {
    id
    givenName
    surName
    errors
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
    errors
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
    errors
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
    errors
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
    id
    displayName
    uri
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
export const ContributorRolesDocument = gql`
    query ContributorRoles {
  contributorRoles {
    id
    label
    url
  }
}
    `;

/**
 * __useContributorRolesQuery__
 *
 * To run a query within a React component, call `useContributorRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useContributorRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContributorRolesQuery({
 *   variables: {
 *   },
 * });
 */
export function useContributorRolesQuery(baseOptions?: Apollo.QueryHookOptions<ContributorRolesQuery, ContributorRolesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContributorRolesQuery, ContributorRolesQueryVariables>(ContributorRolesDocument, options);
      }
export function useContributorRolesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContributorRolesQuery, ContributorRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContributorRolesQuery, ContributorRolesQueryVariables>(ContributorRolesDocument, options);
        }
export function useContributorRolesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ContributorRolesQuery, ContributorRolesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ContributorRolesQuery, ContributorRolesQueryVariables>(ContributorRolesDocument, options);
        }
export type ContributorRolesQueryHookResult = ReturnType<typeof useContributorRolesQuery>;
export type ContributorRolesLazyQueryHookResult = ReturnType<typeof useContributorRolesLazyQuery>;
export type ContributorRolesSuspenseQueryHookResult = ReturnType<typeof useContributorRolesSuspenseQuery>;
export type ContributorRolesQueryResult = Apollo.QueryResult<ContributorRolesQuery, ContributorRolesQueryVariables>;
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
    tags {
      id
      description
      name
    }
    errors
    template {
      id
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
export const TemplatesDocument = gql`
    query Templates {
  templates {
    name
    description
    modified
    id
    owner {
      name
      displayName
      searchName
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
    name
    description
    errors
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
        errors
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
    errors
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
