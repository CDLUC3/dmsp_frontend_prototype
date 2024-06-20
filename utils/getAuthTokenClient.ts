'use client'

export const getAuthTokenClient = async () => {
    if (typeof window === 'undefined') return null;

    const cookie = document.cookie.split('; ').find(row => row.startsWith('dmspt'));
    return cookie ? cookie.split('=')[1] : null;
}