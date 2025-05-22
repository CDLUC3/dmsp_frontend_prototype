import { useSearchParams } from 'next/navigation';

export const useQueryStep = () => {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const step = stepParam ? parseInt(stepParam, 10) : 1;
  return isNaN(step) ? 1 : step;
};
