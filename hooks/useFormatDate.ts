import { useFormatter } from 'next-intl';

export const useFormatDate = () => {
  const formatter = useFormatter();

  return (date: string | null | undefined) => {
    let formattedDate = '';
    if (date) {
      let dateObj: Date | null = null;
      // Try to parse as number (timestamp)
      if (!isNaN(Number(date)) && date.trim() !== '') {
        dateObj = new Date(Number(date));
      } else {
        // Try to parse as ISO or other string
        dateObj = new Date(date);
      }
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        formattedDate = formatter.dateTime(dateObj, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        return formattedDate.replace(/\//g, '-');
      } else {
        console.warn('Invalid date value passed to useFormatDate:', date);
        return '';
      }
    }
    return '';
  };
};
