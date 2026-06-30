import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }
  return session;
}