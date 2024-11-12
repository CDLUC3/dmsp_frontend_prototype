import { redirect } from 'next/navigation';

async function verifyEmail(userId: string, token: string) {
  // Verify the email address
  const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token }),
  });
  return response.ok;
}

interface PageProps {
  params: { userId: string; token: string };
}

const ConfirmEmailPage = async ({ params }: PageProps) => {
  const { userId, token } = params;

  const isVerified = await verifyEmail(userId, token);

  if (isVerified) {
    redirect('/email-confirmed');
  } else {
    redirect('/verification-failed');
  }

  return null;
};

export default ConfirmEmailPage;