import { NextResponse } from 'next/server';

export const deleteCookie = (response: NextResponse, name: string) => {
    response.cookies.set({
        name,
        value: '',
        expires: new Date(0), //set expiration to past date to delete the cookie
        path: '/',
    })
}