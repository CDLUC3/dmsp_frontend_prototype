import { LicensesQuery } from '@/generated/graphql';
import { AnyTableColumnAnswerType } from '@dmptool/types';


export type DataFlagsConfig = {
  showSensitiveData: boolean;
  showPersonalData: boolean;
  mode: 'sensitiveOnly' | 'personalOnly' | 'both';
};

export type RepoConfig = {
  hasCustomRepos: boolean;
  customRepos: RepositoryInterface[];
}

export type MetaDataConfig = {
  hasCustomStandards: boolean;
  customStandards: MetaDataStandardInterface[];
}

export type StandardField = {
  id: string;
  label: string;
  enabled: boolean;
  required?: boolean;
  heading?: string;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  maxLength?: string;
  content?: any;
  value?: string;
  byteSizeConfig?: {
    selectedUnit: 'bytes' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb';
    availableUnits: {
      label: string;
      value: 'bytes' | 'kb' | 'mb' | 'gb' | 'tb' | 'pb';
      selected: boolean;
    }[];
  };
  byteSizeFieldConfig?: {
    enabled: boolean;
    maxByteSize: number;
  };
  customLabel?: string; // For additional custom fields
  licensesConfig?: LicensesConfig;
  accessLevelsConfig?: {
    mode: 'defaults' | 'mine';
    selectedDefaults: string[];
    customLevels: AccessLevelInterface[];
  };
  outputTypeConfig?: {
    mode: 'defaults' | 'mine';
    selectedDefaults: string[];
    customTypes: OutputTypeInterface[];
  };
  flagsConfig?: DataFlagsConfig;
  repoConfig?: RepoConfig;
  metaDataConfig?: MetaDataConfig;
};

export interface RepositoryInterface {
  id?: string;
  name: string;
  description?: string;
  uri: string;
  website?: string;
  keywords?: string[];
  repositoryType?: string[];
}

export interface RepositoryFieldInterface {
  id: string;
  label: string;
  enabled: boolean;
  placeholder?: string;
  helpText?: string;
  value?: string;
  repoConfig?: {
    hasCustomRepos: boolean;
    customRepos: RepositoryInterface[];
  }
}

export interface MetaDataStandardInterface {
  id?: number | string;
  name: string;
  uri: string;
  description?: string;
}

export interface MetaDataStandardFieldInterface {
  id: string;
  label: string;
  enabled: boolean;
  helpText?: string;
  value?: string;
  metaDataConfig: {
    hasCustomStandards: boolean;
    customStandards: MetaDataStandardInterface[];
  }
}

export interface LicensesFieldInterface {
  id: string;
  label: string;
  enabled: boolean;
  defaultValue?: string;
  helpText?: string;
  licensesConfig: LicensesConfig;
}

export type LicensesConfig = {
  mode: 'defaults' | 'addToDefaults';
  selectedDefaults: string[];
  customTypes: { name: string; uri: string }[];
};

// Define the structure for each column in a row
export type ColumnAnswer =
  | { type: 'affiliationSearch'; answer: { affiliationId: string; affiliationName: string }; meta: any }
  | { type: 'boolean'; answer: boolean; meta: any }
  | { type: 'checkBoxes'; answer: string[]; meta: any }
  | { type: 'currency'; answer: number | null; meta: any }
  | { type: 'date'; answer: string | null; meta: any }
  | { type: 'dateRange'; answer: { start: string | null; end: string | null }; meta: any }
  | { type: 'email'; answer: string | null; meta: any }
  | { type: 'licenseSearch'; answer: string; meta: any }
  | { type: 'metadataStandardSearch'; answer: string; preferences?: Array<{ label: string; value: string }>; meta: any }
  | { type: 'multiselectBox'; answer: string[]; meta: any }
  | { type: 'number'; answer: number | null; meta: any }
  | { type: 'numberWithContext'; answer: { number: number | null; context: string }; meta: any }
  | { type: 'numberRange'; answer: { start: number | null; end: number | null }; meta: any }
  | { type: 'radioButtons'; answer: string; meta: any }
  | { type: 'repositorySearch'; answer: string; preferences?: Array<{ label: string; value: string }>; meta: any }
  | { type: 'selectBox'; answer: string; meta: any }
  | { type: 'text'; answer: string | null; meta: any }
  | { type: 'textArea'; answer: string; meta: any }
  | { type: 'url'; answer: string | null; meta: any };

// Define the row structure
export type ResearchOutputTable = {
  columns: AnyTableColumnAnswerType[];
};

export type AccessLevelsConfig = {
  mode: 'defaults' | 'addToDefaults';
  selectedDefaults: string[];
  customTypes: string[];
};

export interface LicenseFieldProps {
  field: StandardField;
  newLicenseType: string;
  licensesData?: LicensesQuery;
  setNewLicenseType: (value: string) => void;
  onModeChange: (mode: 'defaults' | 'addToDefaults') => void;
  onAddCustomType: () => void;
  onRemoveCustomType: (type: string) => void;
}

export interface AccessLevelsFieldProps {
  field: StandardField;
}

export interface OutputTypeInterface {
  type?: string;
  description?: string;
}

export interface AccessLevelInterface {
  label: string;
  value: string;
  description?: string;
}

export interface OutputTypeFieldConfigProps {
  field: StandardField;
  newOutputType: OutputTypeInterface;
  setNewOutputType: (value: OutputTypeInterface) => void;
  onModeChange: (mode: 'defaults' | 'mine') => void;
  onAddCustomType: () => void;
  onRemoveCustomType: (type: string) => void;
}

export type AdditionalFieldsType = {
  id: string;
  label: string;
  enabled: boolean;
  defaultValue: string;
  customLabel: string;
  helpText: string;
  maxLength: string;
}
