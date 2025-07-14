import React from 'react';
import {
  DatePicker,
  Label,
  Group,
  DateInput,
  DateSegment,
  Button,
  Popover,
  Dialog,
  Calendar,
  Heading,
  CalendarGrid,
  CalendarCell,
} from "react-aria-components";
import { parseDate, DateValue } from "@internationalized/date";
import { DmpIcon } from "@/components/Icons";
import styles from './datePicker.module.scss';


/*eslint-disable @typescript-eslint/no-explicit-any*/
interface DateComponentProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  label: string;
  minValue?: DateValue | string;
  maxValue?: DateValue | string;
}

function toDateValue(value?: string | DateValue) {
  if (!value) return undefined;
  if (typeof value === 'string') return parseDate(value);
  return value;
}


const DateComponent: React.FC<DateComponentProps> = ({
  name,
  value,
  onChange,
  label,
  minValue,
  maxValue,
}) => (
  <DatePicker
    name={name}
    value={value}
    data-testid="date-picker"
    onChange={onChange}
    minValue={toDateValue(minValue)}
    maxValue={toDateValue(maxValue)}

  >
    <Label>{label}</Label>
    <Group>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      <Button>
        <DmpIcon 
          icon="solid-down_arrow" 
          width="30px"
          height="30px"
          classes={styles.arrow}
         />
        </Button>
    </Group>
    <Popover>
      <Dialog>
        <Calendar>
          <header>
            <Button slot="previous">
              <DmpIcon 
                icon="solid-left_arrow"
                width="30px"
                height="30px"
                classes={styles.arrow}
               />
              </Button>
            <Heading className={styles.dateHeading} />
            <Button slot="next">
              <DmpIcon
                icon="solid-right_arrow"
                width="30px"
                height="30px"
                classes={styles.arrow}
              />
            </Button>
          </header>
          <CalendarGrid>
            {(date) => <CalendarCell date={date} />}
          </CalendarGrid>
        </Calendar>
      </Dialog>
    </Popover>
  </DatePicker>
);

export default DateComponent;
