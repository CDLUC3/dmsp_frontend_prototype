import {useFormatter} from 'next-intl';

export const useFormatDate = () => {
  const formatter = useFormatter();

  return (date: string | null | undefined) => {
    let formattedDate;
    if (date) {
      formattedDate = formatter.dateTime(new Date(Number(date)), {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } else {
      formattedDate = '';
    }

    return formattedDate.replace(/\//g, '-');
  };
};
