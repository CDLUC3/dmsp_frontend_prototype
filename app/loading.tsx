'use client';

import Loading from '@/components/Loading';

{/** Next.js only shows this if it takes longer than ~300ms to load */ }
export default function GlobalLoading() {
  return <Loading />;
}