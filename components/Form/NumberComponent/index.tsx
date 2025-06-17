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
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  formatOptions?: Intl.NumberFormatOptions;
  locales?: string | string[];
}

const NumberComponent: React.FC<NumberFieldProps> = ({
  label,
  value,
  defaultValue,
  minValue,
  maxValue,
  step,
  onChange,
  placeholder,
  disabled,
  formatOptions,
  locales = 'en-US',
  ...props
}) => {
  return (
    <NumberField
      value={Number(value)}
      defaultValue={defaultValue}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      onChange={onChange}
      isDisabled={disabled}
      formatOptions={formatOptions}
      {...props}
    >
      <Label>{label}</Label>
      <Group>
        <Button slot="decrement" className={`${styles.leftButton} react-aria-Button`}>-</Button>
        <Input placeholder={placeholder} />
        <Button slot="increment">+</Button>
      </Group>
    </NumberField>
  );
};

export default NumberComponent;
