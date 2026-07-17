import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Protected route matcher — all routes under /(app)/ require authentication.
 * Marketing page (/) and auth pages (/sign-in, /sign-up) are public.
 */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/goals(.*)',
  '/tasks(.*)',
  '/collections(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
