import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'GiNi OS — Your personal universe',
  description: 'A calm, beautiful home for your projects, tasks, calendar, expenses, habits and notes.',
  manifest: '/manifest.json',
  icons: { icon: [{url:'/G-logo.png',type:'image/png'}], apple: [{url:'/Golden G-logo.png',type:'image/png'}] },
  appleWebApp: { capable:true, title:'GiNi OS', statusBarStyle:'default' },
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  const content=<html lang="en"><body>{children}</body></html>;
  // For local-only use the app works without Clerk keys. With keys, preserve the
  // original Clerk authentication boundary. The new data layer is browser-local.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return content;
  return <ClerkProvider>{content}</ClerkProvider>;
}
