import {
  AccessLevelInterface,
  OutputTypeInterface,
  StandardField,
  RepositoryInterface,
  MetaDataStandardInterface,
} from '@/app/types';

// Initial Standard Fields data
export const initialStandardFields: StandardField[] = [
  {
    id: 'title',
    label: 'Title',
    enabled: true,
    required: true
  },
  {
    id: 'description',
    label: 'Description',
    enabled: false,
    placeholder: '',
    helpText: '',
    maxLength: '',
    required: true,
    value: ''
  },
  {
    id: 'outputType',
    label: 'Output Type',
    enabled: true,
    helpText: '',
    required: true,
    outputTypeConfig: {
      mode: 'defaults' as 'defaults' | 'mine',
      selectedDefaults: [] as string[],
      customTypes: [] as OutputTypeInterface[],
    }
  },
  {
    id: 'dataFlags',
    label: 'Data Flags',
    enabled: false,
    helpText: '',
    flagsConfig: {
      showSensitiveData: true,
      showPersonalData: true,
      mode: 'both' as 'sensitiveOnly' | 'personalOnly' | 'both'
    }
  },
  {
    id: 'repoSelector',
    label: 'Repositories',
    enabled: false,
    placeholder: '',
    helpText: '',
    value: '',
    repoConfig: {
      hasCustomRepos: false,
      customRepos: [] as RepositoryInterface[],
    }
  },
  {
    id: 'metadataStandards',
    label: 'Metadata Standards',
    enabled: false,
    helpText: '',
    metaDataConfig: {
      hasCustomStandards: false,
      customStandards: [] as MetaDataStandardInterface[],
    }
  },
  {
    id: 'licenses',
    label: 'Licenses',
    enabled: false,
    defaultValue: '',
    helpText: '',
    licensesConfig: {
      mode: 'defaults' as 'defaults' | 'addToDefaults',
      selectedDefaults: [] as string[],
      customTypes: [] as { name: string; uri: string }[]
    }
  },
  {
    id: 'accessLevels',
    label: 'Initial Access Levels',
    enabled: false,
    defaultValue: '',
    helpText: '',
    accessLevelsConfig: {
      mode: 'defaults' as 'defaults' | 'mine',
      selectedDefaults: [] as string[],
      customLevels: [] as AccessLevelInterface[],
    }
  },
];