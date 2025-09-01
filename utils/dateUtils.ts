import {
  DateValue,
  parseDate,
} from "@internationalized/date";


export const formatWithTimeAndDate = (timestamp: string): string => {
  if (timestamp) {
    // Parse the ISO date string into a Date object
    const date = new Date(parseInt(timestamp));

    // Define arrays for month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Extract date components
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth(); // Month is 0-based
    const year = date.getFullYear();

    // Format the final string
    return `${hours}:${minutes} on ${months[month]} ${day}, ${year}`;
  } else {
    return 'No date';
  }
}

export const formatShortMonthDayYear = (timestamp: string): string => {
  if (timestamp) {
    const date = new Date(parseInt(timestamp));
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } else {
    return 'No date';
  }

}

// Helper function to safely get a CalendarDate value
export const getCalendarDateValue = (dateValue: DateValue | string | null) => {
  if (!dateValue) return null;
  return typeof dateValue === 'string' ? parseDate(dateValue) : dateValue;
};


// Convert Timestamp into relative time - like "2 days ago"
export const formatRelativeFromTimestamp = (timestampMs: string, locale: string) => {
  const now = Date.now();
  const diffMs = Number(timestampMs) - now;

  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHrs = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHrs / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, "day");
  if (Math.abs(diffHrs) >= 1) return rtf.format(diffHrs, "hour");
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, "minute");

  return rtf.format(diffSec, "second");
}