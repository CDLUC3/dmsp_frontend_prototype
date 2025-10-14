import React from "react";
import { fieldTypeConfigs, FieldControl } from "./fieldTypeConfigs";
import OutputTypeManager, { OutputTypeConfig } from "./OutputTypeManager";
import styles from "./CustomizeFieldForm.module.scss";

interface CustomizeFieldFormProps {
  field: {
    id: string;
    label: string;
    [key: string]: any; // Allow any additional properties for different field types
  };
  onChange: (fieldId: string, updatedValues: Record<string, any>) => void;
}

const CustomizeFieldForm = ({ field, onChange }: CustomizeFieldFormProps) => {
  const handleChange = (key: string, value: any) => {
    onChange(field.id, { [key]: value });
  };

  // Get the configuration for this field type
  const config = fieldTypeConfigs[field.id];

  if (!config) {
    return
  }

  const renderControl = (control: FieldControl) => {
    const controlId = `${control.key}-${field.id}`;
    const value = field[control.key] || "";

    switch (control.type) {
      case 'text':
        return (
          <input
            id={controlId}
            type="text"
            value={value}
            placeholder={control.placeholder}
            onChange={(e) => handleChange(control.key, e.target.value)}
          />
        );

      case 'number':
        return (
          <input
            id={controlId}
            type="number"
            value={value}
            placeholder={control.placeholder}
            onChange={(e) => handleChange(control.key, e.target.value ? parseInt(e.target.value) : "")}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={controlId}
            rows={control.rows || 2}
            value={value}
            placeholder={control.placeholder}
            onChange={(e) => handleChange(control.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <select
            id={controlId}
            value={value}
            onChange={(e) => handleChange(control.key, e.target.value)}
          >
            {control.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(control.key, e.target.checked)}
            />
            {control.label}
          </label>
        );

      case 'outputTypeManager':
        // Provide default values if outputTypeConfig doesn't exist
        const defaultConfig: OutputTypeConfig = {
          mode: 'defaults',
          selectedDefaults: [],
          customTypes: []
        };

        return (
          <OutputTypeManager
            value={value || defaultConfig}
            onChange={(newConfig) => handleChange(control.key, newConfig)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.customizeFieldForm}>
      {config.controls.map((control) => (
        <div key={control.key} className={styles.formRow}>
          {control.type !== 'checkbox' && control.type !== 'outputTypeManager' && (
            <label htmlFor={`${control.key}-${field.id}`}>
              {control.label}
            </label>
          )}
          {renderControl(control)}
        </div>
      ))}
    </div>
  );
}


export default CustomizeFieldForm;