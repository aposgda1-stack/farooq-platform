import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// FIX #9: Protect authenticated routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/final-exam(.*)',
  '/quiz(.*)',
  '/leaderboard(.*)',
  '/review(.*)',
  '/achievements(.*)',
  '/speed(.*)',
  '/random-exam(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
