export type DataFlagsConfig = {
  showSensitiveData: boolean;
  showPersonalData: boolean;
  mode: 'sensitiveOnly' | 'personalOnly' | 'both';
};

export type RepoConfig = {
  hasCustomRepos: boolean;
  customRepos: string[];
}

export type MetaDataConfig = {
  hasCustomStandards: boolean;
  customStandards: string[];
}

export type StandardField = {
  id: string;
  label: string;
  enabled: boolean;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  maxLength?: string;
  value?: string;
  licensesConfig?: LicensesConfig;
  outputTypeConfig?: {
    mode: 'defaults' | 'mine' | 'addToDefaults';
    selectedDefaults: string[];
    customTypes: string[];
  };
  flagsConfig?: DataFlagsConfig;
  repoConfig?: RepoConfig;
  metaDataConfig?: MetaDataConfig;
};

export interface RepositoryInterface {
  id: number;
  name: string;
  description: string;
  url: string;
  contact: string;
  access: string;
  identifier: string;
  tags: string[];
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
    customRepos: string[];
  }
}

export interface MetaDataStandardInterface {
  id: number;
  name: string;
  description: string;
  url: string;
}

export interface MetaDataStandardFieldInterface {
  id: string;
  label: string;
  enabled: boolean;
  helpText?: string;
  metaDataConfig: {
    hasCustomStandards: boolean;
    customStandards: string[];
  }
}

export type LicensesConfig = {
  mode: 'defaults' | 'addToDefaults';
  selectedDefaults: string[];
  customTypes: string[];
};

export interface LicenseFieldProps {
  field: StandardField;
  newLicenseType: string;
  setNewLicenseType: (value: string) => void;
  onModeChange: (mode: 'defaults' | 'addToDefaults') => void;
  onAddCustomType: () => void;
  onRemoveCustomType: (type: string) => void;
}

export interface OutputTypeFieldConfigProps {
  field: StandardField;
  newOutputType: string;
  setNewOutputType: (value: string) => void;
  onModeChange: (mode: 'defaults' | 'mine' | 'addToDefaults') => void;
  onAddCustomType: () => void;
  onRemoveCustomType: (type: string) => void;
}
