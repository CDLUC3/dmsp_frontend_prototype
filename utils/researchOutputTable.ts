import {
  DefaultTextAnswer,
  DefaultTextAreaAnswer,
  DefaultSelectBoxAnswer,
  DefaultRadioButtonsAnswer,
  DefaultCheckboxesAnswer,
  DefaultLicenseSearchAnswer,
  DefaultRepositorySearchAnswer,
  DefaultMetadataStandardSearchAnswer,
  AnyTableColumnAnswerType,
} from '@dmptool/types';

import {
  AccessLevelInterface,
} from '@/app/types';

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
    case "radioButtons":
      return { ...DefaultRadioButtonsAnswer, meta: { schemaVersion } };
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




// Frontend will hard-code these for now
// These match the schema defaults in ResearchOutputAccessLevelColumnSchema
// TODO: Consider moving to backend
export const defaultAccessLevels: AccessLevelInterface[] = [
  { label: 'Unrestricted Access', value: 'open', description: 'Allows open access to all areas', selected: false },
  { label: 'Controlled Access', value: 'restricted', description: 'Restricts access to certain areas', selected: false },
  { label: 'Other', value: 'closed', description: 'Other type of access', selected: false },
];