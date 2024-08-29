'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();

    return (
        <button className="back-link-button" onClick={() => router.back()}>
            &larr; Back
        </button>
    );
}