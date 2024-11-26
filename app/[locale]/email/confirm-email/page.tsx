import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'

async function verifyEmail(userId: string, token: string) {
  // Verify the email address
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token }),
  });
  return response.ok;
}

export default async function ConfirmEmailPage({
  params,
}: {
  params: { userId: string; token: string };
}) {
  const { userId, token } = params;
  const isVerified = await verifyEmail(userId, token);

  if (isVerified) {
    redirect('/email-confirmed');
  } else {
    redirect('/verification-failed');
  }
}
