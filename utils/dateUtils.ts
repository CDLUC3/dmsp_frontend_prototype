export const formatWithTimeAndDate = (isoString: Date) => {
    if (isoString) {
        // Parse the ISO date string into a Date object
        const date = new Date(isoString);

        // Define arrays for month names
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Extract date components
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const day = date.getUTCDate();
        const month = date.getUTCMonth(); // Month is 0-based
        const year = date.getUTCFullYear();

        // Format hours and minutes
        const formattedHours = hours.toString().padStart(2, '0'); // Add leading zero if needed
        const formattedMinutes = minutes.toString().padStart(2, '0'); // Add leading zero if needed

        // Format the final string
        return `${formattedHours}:${formattedMinutes} on ${months[month]} ${day}, ${year}`;
    } else {
        return 'No date';
    }
}

export const formatShortMonthDayYear = (isoString: Date) => {
    if (isoString) {
        const date = new Date(isoString);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } else {
        return 'No date';
    }

}