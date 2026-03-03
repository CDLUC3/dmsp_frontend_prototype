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
  DefaultResearchOutputAccessLevelColumn
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

// These match the schema defaults in ResearchOutputAccessLevelColumnSchema
export const defaultAccessLevels = DefaultResearchOutputAccessLevelColumn.content.options;