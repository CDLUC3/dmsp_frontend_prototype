import React from 'react';
import {
  NumberField,
  Label,
  Group,
  Button,
  Input
} from 'react-aria-components';
import styles from './numberComponent.module.scss';

interface NumberFieldProps {
  label: string;
  value?: number | string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
}

const NumberComponent: React.FC<NumberFieldProps> = ({
  label,
  value = 0, // Default value to 0 if not provided
  minValue,
  maxValue,
  step,
  onChange,
  placeholder,
  disabled,
  formatOptions,
  ...props
}) => {

  return (
    <NumberField
      value={Number(value)}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      onChange={onChange}
      isDisabled={disabled}
      formatOptions={formatOptions}
      {...props}
    >
      <Label>{label}</Label>
      <Group className={`${styles.numberWrapper} react-aria-Group`}>
        <Button slot="decrement" className={`${styles.leftButton} ${styles.numberButton} react-aria-Button`}>-</Button>
        <Input
          placeholder={placeholder}
          className={`${styles.numberInput} 
        react-aria-Input`}
        />
        <Button slot="increment" className={`${styles.rightButton} ${styles.numberButton} react-aria-Button`}>+</Button>
      </Group>
    </NumberField>
  );
};

export default NumberComponent;
