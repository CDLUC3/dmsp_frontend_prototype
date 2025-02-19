'use client'

import {useSearchParams} from 'next/navigation';

export const useQueryStep = () => {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  return stepParam ? parseInt(stepParam, 10) : 1;
};
