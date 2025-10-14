import { OutputTypeConfig } from './OutputTypeManager';
import { DEFAULT_OUTPUT_TYPES } from './fieldTypeConfigs';

/**
 * Utility functions for working with output type configurations
 */

export const getEnabledOutputTypes = (config: OutputTypeConfig): string[] => {
  switch (config.mode) {
    case 'defaults':
      return config.selectedDefaults.length > 0 ? config.selectedDefaults : DEFAULT_OUTPUT_TYPES;

    case 'custom':
      return config.customTypes;

    case 'combined':
      const selectedDefaults = config.selectedDefaults.length > 0 ? config.selectedDefaults : DEFAULT_OUTPUT_TYPES;
      return [...selectedDefaults, ...config.customTypes];

    default:
      return DEFAULT_OUTPUT_TYPES;
  }
};

export const getOutputTypeDisplayName = (config: OutputTypeConfig): string => {
  const enabledTypes = getEnabledOutputTypes(config);

  if (enabledTypes.length === 0) {
    return 'No output types enabled';
  }

  if (enabledTypes.length <= 3) {
    return enabledTypes.join(', ');
  }

  return `${enabledTypes.slice(0, 3).join(', ')} and ${enabledTypes.length - 3} more`;
};

export const validateOutputTypeConfig = (config: OutputTypeConfig): string[] => {
  const errors: string[] = [];

  if (config.mode === 'custom' && config.customTypes.length === 0) {
    errors.push('At least one custom output type must be defined when using "Use mine" mode');
  }

  if (config.mode === 'defaults' && config.selectedDefaults.length === 0) {
    // This is actually okay - it means use all defaults
  }

  if (config.mode === 'combined' && config.selectedDefaults.length === 0 && config.customTypes.length === 0) {
    errors.push('At least one output type must be selected or defined when using "Add mine to defaults" mode');
  }

  return errors;
};

export const serializeOutputTypeConfig = (config: OutputTypeConfig): string => {
  return JSON.stringify(config);
};

export const deserializeOutputTypeConfig = (serialized: string): OutputTypeConfig => {
  try {
    const parsed = JSON.parse(serialized);
    return {
      mode: parsed.mode || 'defaults',
      selectedDefaults: parsed.selectedDefaults || [],
      customTypes: parsed.customTypes || []
    };
  } catch {
    return {
      mode: 'defaults',
      selectedDefaults: [],
      customTypes: []
    };
  }
};