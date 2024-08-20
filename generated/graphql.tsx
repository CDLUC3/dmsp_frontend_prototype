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

/** A respresentation of an institution, organization or company */
export type Affiliation = {
  __typename?: 'Affiliation';
  /** Acronyms for the affiliation */
  acronyms?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Whether or not the affiliation is active. Inactive records shoould not appear in typeaheads! */
  active: Scalars['Boolean']['output'];
  /** The address(es) for the affiliation */
  addresses?: Maybe<Array<Maybe<AffiliationAddress>>>;
  /** Alias names for the affiliation */
  aliases?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The official ISO 2 character country code for the affiliation */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** The country name for the affiliation */
  countryName?: Maybe<Scalars['String']['output']>;
  /** The display name to help disambiguate similar names (typically with domain or country appended) */
  displayName: Scalars['String']['output'];
  /** The official homepage for the affiliation */
  domain?: Maybe<Scalars['String']['output']>;
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The Crossref Funder id */
  fundref?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (typically the ROR id) */
  id: Scalars['String']['output'];
  /** URL links associated with the affiliation */
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Localization options for the affiliation name */
  locales?: Maybe<Array<Maybe<AffiliationLocale>>>;
  /** The official name for the affiliation (defined by the system of provenance) */
  name: Scalars['String']['output'];
  /** The system the affiliation's data came from (e.g. ROR, DMPTool, etc.) */
  provenance: Scalars['String']['output'];
  /** The last time the data for the affiliation was synced with the system of provenance */
  provenanceSyncDate: Scalars['String']['output'];
  /** Other related affiliations */
  relationships?: Maybe<Array<Maybe<AffiliationRelationship>>>;
  /** The types of the affiliation (e.g. Company, Education, Government, etc.) */
  types?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The URL for the affiliation's Wikipedia entry */
  wikipediaURL?: Maybe<Scalars['URL']['output']>;
};

export type AffiliationAddress = {
  __typename?: 'AffiliationAddress';
  /** The name of the affiliation's city */
  city?: Maybe<Scalars['String']['output']>;
  /** The Geonames identify of the affiliation's country */
  countryGeonamesId?: Maybe<Scalars['Int']['output']>;
  /** The latitude coordinate */
  lat?: Maybe<Scalars['Float']['output']>;
  /** The longitude coordinate */
  lng?: Maybe<Scalars['Float']['output']>;
  /** The name of the affiliation's state/province */
  state?: Maybe<Scalars['String']['output']>;
  /** The code of the affiliation's state/province */
  stateCode?: Maybe<Scalars['String']['output']>;
};

export type AffiliationLocale = {
  __typename?: 'AffiliationLocale';
  /** The localized name of the affiliation */
  label: Scalars['String']['output'];
  /** The language code */
  locale: Scalars['String']['output'];
};

export type AffiliationRelationship = {
  __typename?: 'AffiliationRelationship';
  /** The unique identifer for the related affiliation (typically the ROR id) */
  id: Scalars['String']['output'];
  /** The official name of the related affiliation */
  name: Scalars['String']['output'];
  /** The relationship type (e.g. Parent) */
  type: Scalars['String']['output'];
};

/** Search result - An abbreviated version of an Affiliation */
export type AffiliationSearch = {
  __typename?: 'AffiliationSearch';
  /** Alias names and acronyms for the affiliation */
  aliases?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The official ISO 2 character country code for the affiliation */
  countryCode?: Maybe<Scalars['String']['output']>;
  /** The country name for the affiliation */
  countryName?: Maybe<Scalars['String']['output']>;
  /** The official display name */
  displayName: Scalars['String']['output'];
  /** Whether or not this affiliation is a funder */
  funder: Scalars['Boolean']['output'];
  /** The Crossref Funder id */
  fundref?: Maybe<Scalars['String']['output']>;
  /** The unique identifer for the affiliation (typically the ROR id) */
  id: Scalars['String']['output'];
  /** URL links associated with the affiliation */
  links?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Localization options for the affiliation name */
  locales?: Maybe<Array<Maybe<AffiliationLocale>>>;
  /** The official name of the affiliation from the system of provenance */
  name: Scalars['String']['output'];
};

export type Contributor = Person & {
  __typename?: 'Contributor';
  contributorId?: Maybe<PersonIdentifier>;
  dmproadmap_affiliation?: Maybe<DmpRoadmapAffiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  role: Array<Scalars['String']['output']>;
};

export type ContributorRole = {
  __typename?: 'ContributorRole';
  /** The timestamp of when the contributor role was created */
  created: Scalars['DateTimeISO']['output'];
  /** A longer description of the contributor role useful for tooltips */
  description?: Maybe<Scalars['String']['output']>;
  /** The order in which to display these items when displayed in the UI */
  displayOrder: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  /** The Ui label to display for the contributor role */
  label: Scalars['String']['output'];
  /** The timestamp of when the contributor role last modified */
  modified: Scalars['DateTimeISO']['output'];
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

export type DmpRoadmapAffiliation = {
  __typename?: 'DmpRoadmapAffiliation';
  affiliation_id?: Maybe<OrganizationIdentifier>;
  name: Scalars['String']['output'];
};

export type Dmsp = {
  __typename?: 'Dmsp';
  contact: PrimaryContact;
  contributor?: Maybe<Array<Maybe<Contributor>>>;
  created: Scalars['DateTimeISO']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dmp_id: DmspIdentifier;
  dmproadmap_featured?: Maybe<Scalars['String']['output']>;
  dmproadmap_related_identifiers?: Maybe<Array<Maybe<RelatedIdentifier>>>;
  dmproadmap_visibility?: Maybe<Scalars['String']['output']>;
  ethical_issues_description?: Maybe<Scalars['String']['output']>;
  ethical_issues_exist: YesNoUnknown;
  ethical_issues_report?: Maybe<Scalars['URL']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  modified: Scalars['DateTimeISO']['output'];
  title: Scalars['String']['output'];
};

export type DmspIdentifier = {
  __typename?: 'DmspIdentifier';
  identifier: Scalars['DmspId']['output'];
  type: Scalars['String']['output'];
};

export type Identifier = {
  __typename?: 'Identifier';
  identifier: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Add a new contributor role (URL and label must be unique!) */
  addContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Delete the contributor role */
  removeContributorRole?: Maybe<ContributorRoleMutationResponse>;
  /** Update the contributor role */
  updateContributorRole?: Maybe<ContributorRoleMutationResponse>;
};


export type MutationAddContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};


export type MutationRemoveContributorRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateContributorRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  label: Scalars['String']['input'];
  url: Scalars['URL']['input'];
};

export type OrganizationIdentifier = {
  __typename?: 'OrganizationIdentifier';
  identifier: Scalars['Ror']['output'];
  type: Scalars['String']['output'];
};

export type Person = {
  dmproadmap_affiliation?: Maybe<DmpRoadmapAffiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type PersonIdentifier = {
  __typename?: 'PersonIdentifier';
  identifier: Scalars['Orcid']['output'];
  type: Scalars['String']['output'];
};

export type PrimaryContact = Person & {
  __typename?: 'PrimaryContact';
  contact_id?: Maybe<Identifier>;
  dmproadmap_affiliation?: Maybe<DmpRoadmapAffiliation>;
  mbox?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  /** Retrieve a specific Affiliation by its ID */
  affiliation?: Maybe<Affiliation>;
  /** Perform a search for Affiliations matching the specified name */
  affiliations?: Maybe<Array<Maybe<AffiliationSearch>>>;
  /** Get the contributor role by it's id */
  contributorRoleById?: Maybe<ContributorRole>;
  /** Get the contributor role by it's URL */
  contributorRoleByURL?: Maybe<ContributorRole>;
  /** Get all of the contributor role types */
  contributorRoles?: Maybe<Array<Maybe<ContributorRole>>>;
  /** Get the DMSP by its DMP ID */
  dmspById?: Maybe<SingleDmspResponse>;
  me?: Maybe<User>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryAffiliationArgs = {
  affiliationId: Scalars['String']['input'];
};


export type QueryAffiliationsArgs = {
  funderOnly?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};


export type QueryContributorRoleByIdArgs = {
  contributorRoleId: Scalars['Int']['input'];
};


export type QueryContributorRoleByUrlArgs = {
  contributorRoleURL: Scalars['URL']['input'];
};


export type QueryDmspByIdArgs = {
  dmspId: Scalars['DmspId']['input'];
};


export type QueryUserArgs = {
  userId: Scalars['String']['input'];
};

export type RelatedIdentifier = {
  __typename?: 'RelatedIdentifier';
  descriptor: Scalars['String']['output'];
  identifier: Scalars['URL']['output'];
  type: Scalars['String']['output'];
  work_type: Scalars['String']['output'];
};

export type SingleDmspResponse = {
  __typename?: 'SingleDmspResponse';
  /** Similar to HTTP status code, represents the status of the mutation */
  code: Scalars['Int']['output'];
  /** The DMSP */
  dmsp?: Maybe<Dmsp>;
  /** Human-readable message for the UI */
  message: Scalars['String']['output'];
  /** Indicates whether the mutation was successful */
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  affiliation?: Maybe<Affiliation>;
  created: Scalars['DateTimeISO']['output'];
  email: Scalars['EmailAddress']['output'];
  givenName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  modified: Scalars['DateTimeISO']['output'];
  orcid?: Maybe<Scalars['Orcid']['output']>;
  role: UserRole;
  surName?: Maybe<Scalars['String']['output']>;
};

export enum UserRole {
  Admin = 'ADMIN',
  Researcher = 'RESEARCHER',
  SuperAdmin = 'SUPER_ADMIN'
}

export enum YesNoUnknown {
  No = 'no',
  Unknown = 'unknown',
  Yes = 'yes'
}

export type AffiliationsQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AffiliationsQuery = { __typename?: 'Query', affiliations?: Array<{ __typename?: 'AffiliationSearch', id: string, name: string } | null> | null };

export type ContributorRolesQueryVariables = Exact<{ [key: string]: never; }>;


export type ContributorRolesQuery = { __typename?: 'Query', contributorRoles?: Array<{ __typename?: 'ContributorRole', id: number, label: string, url: any } | null> | null };


export const AffiliationsDocument = gql`
    query Affiliations($name: String!) {
  affiliations(name: $name) {
    id
    name
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
export function useAffiliationsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<AffiliationsQuery, AffiliationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
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
export function useContributorRolesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<ContributorRolesQuery, ContributorRolesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ContributorRolesQuery, ContributorRolesQueryVariables>(ContributorRolesDocument, options);
        }
export type ContributorRolesQueryHookResult = ReturnType<typeof useContributorRolesQuery>;
export type ContributorRolesLazyQueryHookResult = ReturnType<typeof useContributorRolesLazyQuery>;
export type ContributorRolesSuspenseQueryHookResult = ReturnType<typeof useContributorRolesSuspenseQuery>;
export type ContributorRolesQueryResult = Apollo.QueryResult<ContributorRolesQuery, ContributorRolesQueryVariables>;