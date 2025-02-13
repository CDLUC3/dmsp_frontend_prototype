import React from 'react';
import {
  Checkbox,
  CheckboxGroup,
  Label,
  Text,
} from "react-aria-components";
import classNames from 'classnames';

import { CheckboxGroupProps } from '@/app/types';
import styles from './radioGroup.module.scss';

const CheckboxGroupComponent: React.FC<CheckboxGroupProps> = ({
  checkboxGroupLabel,
  checkboxGroupDescription,
  checkboxData
}) => {

  return (
    <>
      <CheckboxGroup className="checkbox-group">
        <Label>{checkboxGroupLabel}</Label>
        <Text slot="description" className="help">
          {checkboxGroupDescription}
        </Text>
        {checkboxData.map((checkbox, index) => (
          <>
            <Checkbox value={checkbox.value}>
              <div className="checkbox">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              </div>
              <div className="">
                <span>
                  {checkbox.label}
                </span>
                <br />
                <span className="help">
                  {checkbox.description}
                </span>
              </div>
            </Checkbox>
          </>
        ))}
      </CheckboxGroup>
    </>
  );
};

export default CheckboxGroupComponent;
