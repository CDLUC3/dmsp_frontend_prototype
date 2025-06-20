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

interface DateComponentProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  label: string;
}

const DateComponent: React.FC<DateComponentProps> = ({
  name,
  value,
  onChange,
  label,
}) => (
  <DatePicker
    name={name}
    value={value}
    onChange={onChange}
  >
    <Label>{label}</Label>
    <Group>
      <DateInput>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      <Button>▼</Button>
    </Group>
    <Popover>
      <Dialog>
        <Calendar>
          <header>
            <Button slot="previous">◀</Button>
            <Heading />
            <Button slot="next">▶</Button>
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
