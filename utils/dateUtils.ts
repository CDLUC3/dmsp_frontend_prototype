import {DateValue, parseDate} from "@internationalized/date";

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
