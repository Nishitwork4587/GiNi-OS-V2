import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const securedProxy = clerkMiddleware(async (auth, req) => {
  if (!publicRoute(req)) await auth.protect();
});
export default function proxy(request: Parameters<typeof securedProxy>[0], event: Parameters<typeof securedProxy>[1]) {
  // Offline browser-local mode works without external secrets. This does NOT
  // expose the legacy Postgres actions: their database must remain unconfigured.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    // Prevent unauthenticated clients from invoking unscoped legacy server actions.
    if (request.method !== 'GET' && request.method !== 'HEAD') return new NextResponse('Server actions unavailable without authentication', { status:403 });
    return NextResponse.next();
  }
  return securedProxy(request,event);
}
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
