import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --- Mentorship Note ---
// This file was previously called "middleware.ts" but Next.js 16+ renamed it to "proxy.ts".
// The concept is identical: it runs BEFORE every page request on the server edge.
// It is the perfect place to protect routes without the user ever seeing a flash of
// protected content.
//
// IMPORTANT: Firebase Auth uses the browser (client-side) to track login state.
// Proxy/Middleware runs on the server, so it cannot read Firebase Auth directly.
// Instead, we use a simple browser cookie as a "signal":
//   - When the user logs in → AuthContext sets the cookie "chitti-auth-session=true"
//   - When the user logs out → AuthContext deletes the cookie
//   - This file reads that cookie to decide if the user can access the page.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for our session cookie (set by AuthContext when Firebase confirms login)
  const session = request.cookies.get("chitti-auth-session")?.value;

  // Public routes — accessible without being logged in
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If the user is already logged in and tries to visit a public route (login/register),
  // redirect them to the dashboard — no need to log in or register again.
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the user is NOT logged in and tries to access a protected page,
  // redirect them to the login page.
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Otherwise, allow the request to proceed normally.
  return NextResponse.next();
}

// This config tells Next.js WHICH routes this proxy should intercept.
// We exclude static files, images, and Next.js internals — only protect page routes.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
