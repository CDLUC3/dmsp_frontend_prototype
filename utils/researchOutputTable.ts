import {
  DefaultTextAnswer,
  DefaultTextAreaAnswer,
  DefaultSelectBoxAnswer,
  DefaultCheckboxesAnswer,
  DefaultLicenseSearchAnswer,
  DefaultRepositorySearchAnswer,
  DefaultMetadataStandardSearchAnswer,
  AnyTableColumnAnswerType,
} from '@dmptool/types';

export const getDefaultAnswerForType = (
  type: string,
  schemaVersion: string = "1.0"
): AnyTableColumnAnswerType => {
  switch (type) {
    case "text":
      return { ...DefaultTextAnswer, meta: { schemaVersion } };
    case "textArea":
      return { ...DefaultTextAreaAnswer, meta: { schemaVersion } };
    case "selectBox":
      return { ...DefaultSelectBoxAnswer, meta: { schemaVersion } };
    case "checkBoxes":
      return { ...DefaultCheckboxesAnswer, meta: { schemaVersion } };
    case "date":
      return { ...DefaultTextAnswer, meta: { schemaVersion } };
    case "numberWithContext":
      return { ...DefaultTextAnswer, meta: { schemaVersion } };
    case "repositorySearch":
      return { ...DefaultRepositorySearchAnswer, meta: { schemaVersion } };
    case "metadataStandardSearch":
      return { ...DefaultMetadataStandardSearchAnswer, meta: { schemaVersion } };
    case "licenseSearch":
      return { ...DefaultLicenseSearchAnswer, meta: { schemaVersion } };
    default:
      throw new Error(`Unknown column type: ${type}`);
  }
};


export const DEFAULT_ACCESS_LEVELS = [
  {
    label: 'Unrestricted Access',
    value: 'open',
    selected: false
  },
  {
    label: 'Controlled Access',
    value: 'restricted',
    selected: false
  },
  {
    label: 'Other',
    value: 'closed',
    selected: false
  },
];
