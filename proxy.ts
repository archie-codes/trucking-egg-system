// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Load the exact same secret we used to create the token
const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // 1. Are they trying to access a restricted area?
  if (
    pathname.startsWith("/trucking") ||
    pathname.startsWith("/egg-sales") ||
    pathname.startsWith("/admin")
  ) {
    // No token at all? Kick to login.
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Decode the token to see who they actually are
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const dept = payload.department as string;
      const role = payload.role as string;

      // RULE A: Protect the Admin Portal (Only 'admin' role allowed)
      if (pathname.startsWith("/admin") && role !== "admin") {
        // Kick them back to their own department
        const fallbackRoute =
          dept === "eggs" ? "/egg-sales/dashboard" : "/trucking/dashboard";
        return NextResponse.redirect(new URL(fallbackRoute, request.url));
      }

      // RULE B: Protect Trucking (Only 'trucking' or 'all' allowed)
      if (
        pathname.startsWith("/trucking") &&
        dept !== "trucking" &&
        dept !== "all"
      ) {
        // You belong in the egg department, get out of trucking!
        return NextResponse.redirect(
          new URL("/egg-sales/dashboard", request.url),
        );
      }

      // RULE C: Protect Eggs (Only 'eggs' or 'all' allowed)
      if (
        pathname.startsWith("/egg-sales") &&
        dept !== "eggs" &&
        dept !== "all"
      ) {
        // You belong in trucking, get out of the eggs!
        return NextResponse.redirect(
          new URL("/trucking/dashboard", request.url),
        );
      }
    } catch {
      // If the token is fake or expired, delete it and kick them out
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // 2. Are they trying to log in when they already have a valid session?
  if (pathname === "/" || pathname.startsWith("/login")) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        const dept = payload.department as string;

        // Auto-route them to their correct dashboard
        if (dept === "eggs") {
          return NextResponse.redirect(
            new URL("/egg-sales/dashboard", request.url),
          );
        } else {
          return NextResponse.redirect(
            new URL("/trucking/dashboard", request.url),
          );
        }
      } catch {
        // Token invalid, let them see the login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
