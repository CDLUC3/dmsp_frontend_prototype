// Configuration for different field types in research output questions
export interface FieldControl {
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'outputTypeManager';
  label: string;
  key: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  rows?: number;
}

export interface FieldTypeConfig {
  controls: FieldControl[];
}

// Default output types list
export const DEFAULT_OUTPUT_TYPES = [
  'Audiovisual',
  'Collection',
  'Data paper',
  'Dataset',
  'Event',
  'Image',
  'Interactive resource',
  'Model representation',
  'Physical object',
  'Service',
  'Software',
  'Sound',
  'Text',
  'Workflow'
];

export const fieldTypeConfigs: Record<string, FieldTypeConfig> = {
  title: {
    controls: [
      {
        type: 'text',
        label: 'Placeholder Text',
        key: 'placeholder',
        placeholder: 'Enter a descriptive title for your research output...'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3,
        placeholder: 'Provide guidance for users filling out this field...'
      },
      {
        type: 'checkbox',
        label: 'Required field',
        key: 'required'
      }
    ]
  },
  description: {
    controls: [
      {
        type: 'text',
        label: 'Placeholder Text',
        key: 'placeholder',
        placeholder: 'Describe your research output in detail...'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3
      },
      {
        type: 'number',
        label: 'Maximum Character Length',
        key: 'maxLength',
        placeholder: '500'
      },
      {
        type: 'checkbox',
        label: 'Required field',
        key: 'required'
      }
    ]
  },
  outputType: {
    controls: [
      {
        type: 'outputTypeManager',
        label: 'Output Type Configuration',
        key: 'outputTypeConfig'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 2,
        placeholder: 'Provide guidance about selecting output types...'
      }
    ]
  },
  dataFlags: {
    controls: [
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3,
        placeholder: 'Explain what data flags are and how they should be used...'
      },
      {
        type: 'select',
        label: 'Default Selection',
        key: 'defaultValue',
        options: [
          { value: '', label: 'No default' },
          { value: 'sensitive', label: 'Sensitive Data' },
          { value: 'restricted', label: 'Restricted Access' },
          { value: 'public', label: 'Public Data' }
        ]
      },
      {
        type: 'checkbox',
        label: 'Allow multiple selections',
        key: 'allowMultiple'
      }
    ]
  },
  intendedRepos: {
    controls: [
      {
        type: 'text',
        label: 'Placeholder Text',
        key: 'placeholder',
        placeholder: 'e.g., Zenodo, Dryad, institutional repository...'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3
      },
      {
        type: 'checkbox',
        label: 'Enable repository search',
        key: 'enableSearch'
      }
    ]
  },
  metadataStandards: {
    controls: [
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3,
        placeholder: 'Describe relevant metadata standards for this type of research...'
      },
      {
        type: 'checkbox',
        label: 'Show common standards as suggestions',
        key: 'showSuggestions'
      }
    ]
  },
  licenses: {
    controls: [
      {
        type: 'select',
        label: 'Default License',
        key: 'defaultValue',
        options: [
          { value: '', label: 'No default' },
          { value: 'cc-by', label: 'CC BY 4.0' },
          { value: 'cc-by-sa', label: 'CC BY-SA 4.0' },
          { value: 'cc0', label: 'CC0 (Public Domain)' },
          { value: 'mit', label: 'MIT License' },
          { value: 'apache', label: 'Apache 2.0' }
        ]
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3
      },
      {
        type: 'checkbox',
        label: 'Show license descriptions',
        key: 'showDescriptions'
      }
    ]
  },
  retentionPeriod: {
    controls: [
      {
        type: 'select',
        label: 'Default Period',
        key: 'defaultValue',
        options: [
          { value: '', label: 'No default' },
          { value: '5', label: '5 years' },
          { value: '10', label: '10 years' },
          { value: 'indefinite', label: 'Indefinite' }
        ]
      },
      {
        type: 'text',
        label: 'Custom Period Label',
        key: 'customLabel',
        placeholder: 'As required by funding agency'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 2
      }
    ]
  },
  fundingSource: {
    controls: [
      {
        type: 'text',
        label: 'Placeholder Text',
        key: 'placeholder',
        placeholder: 'e.g., NSF Grant #12345, NIH R01...'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 2
      },
      {
        type: 'checkbox',
        label: 'Link to institutional grant database',
        key: 'linkToDatabase'
      }
    ]
  },
  conclusions: {
    controls: [
      {
        type: 'text',
        label: 'Placeholder Text',
        key: 'placeholder',
        placeholder: 'Summarize key findings and implications...'
      },
      {
        type: 'number',
        label: 'Maximum Character Length',
        key: 'maxLength',
        placeholder: '1000'
      },
      {
        type: 'textarea',
        label: 'Help Text',
        key: 'helpText',
        rows: 3
      }
    ]
  }
};