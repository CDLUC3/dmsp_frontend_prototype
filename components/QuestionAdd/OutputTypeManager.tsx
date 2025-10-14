import React, { useState } from 'react';
import { DEFAULT_OUTPUT_TYPES } from './fieldTypeConfigs';
import styles from './OutputTypeManager.module.scss';

interface OutputTypeConfig {
  mode: 'defaults' | 'custom' | 'combined'; // Use defaults, Use mine, Add mine to defaults
  selectedDefaults: string[];
  customTypes: string[];
}

interface OutputTypeManagerProps {
  value: OutputTypeConfig;
  onChange: (value: OutputTypeConfig) => void;
}

const OutputTypeManager: React.FC<OutputTypeManagerProps> = ({ value, onChange }) => {
  const [newTypeName, setNewTypeName] = useState('');

  const handleModeChange = (mode: OutputTypeConfig['mode']) => {
    onChange({
      ...value,
      mode,
      // Reset selections when changing modes
      selectedDefaults: mode === 'custom' ? [] : value.selectedDefaults,
    });
  };

  const handleDefaultToggle = (outputType: string) => {
    const isSelected = value.selectedDefaults.includes(outputType);
    const newSelected = isSelected
      ? value.selectedDefaults.filter(type => type !== outputType)
      : [...value.selectedDefaults, outputType];

    onChange({
      ...value,
      selectedDefaults: newSelected,
    });
  };

  const handleAddCustomType = () => {
    if (newTypeName.trim() && !value.customTypes.includes(newTypeName.trim())) {
      onChange({
        ...value,
        customTypes: [...value.customTypes, newTypeName.trim()],
      });
      setNewTypeName('');
    }
  };

  const handleRemoveCustomType = (typeToRemove: string) => {
    onChange({
      ...value,
      customTypes: value.customTypes.filter(type => type !== typeToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomType();
    }
  };

  return (
    <div className={styles.outputTypeManager}>
      <div className={styles.modeSelector}>
        <label htmlFor="output-type-mode">Define output types:</label>
        <select
          id="output-type-mode"
          value={value.mode}
          onChange={(e) => handleModeChange(e.target.value as OutputTypeConfig['mode'])}
        >
          <option value="defaults">Use defaults</option>
          <option value="custom">Use mine</option>
          <option value="combined">Add mine to defaults</option>
        </select>
      </div>

      <div className={styles.typeConfiguration}>
        {/* Default Output Types Section */}
        {(value.mode === 'defaults' || value.mode === 'combined') && (
          <div className={styles.defaultTypes}>
            <fieldset>
              <legend>Default Output Types</legend>
              <ul className={styles.typeList}>
                {DEFAULT_OUTPUT_TYPES.map((outputType) => (
                  <li key={outputType} className={styles.typeItem}>
                    <label className={styles.typeLabel}>
                      <input
                        type="checkbox"
                        checked={value.selectedDefaults.includes(outputType)}
                        onChange={() => handleDefaultToggle(outputType)}
                      />
                      <span>{outputType}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          </div>
        )}

        {/* Custom Output Types Section */}
        {(value.mode === 'custom' || value.mode === 'combined') && (
          <div className={styles.customTypes}>
            <fieldset>
              <legend>My Output Types</legend>

              {/* Add new type interface */}
              <div className={styles.addTypeForm}>
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter an output type"
                  aria-label="Enter an output type"
                />
                <button
                  type="button"
                  onClick={handleAddCustomType}
                  disabled={!newTypeName.trim()}
                >
                  Add output type
                </button>
              </div>

              {/* Custom types list */}
              {value.customTypes.length > 0 && (
                <ul className={styles.typeList}>
                  {value.customTypes.map((customType) => (
                    <li key={customType} className={styles.typeItem}>
                      <span className={styles.typeLabel}>
                        <span>{customType}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomType(customType)}
                          aria-label={`Remove Output Type ${customType}`}
                          className={styles.removeButton}
                        >
                          ×
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputTypeManager;
export type { OutputTypeConfig };