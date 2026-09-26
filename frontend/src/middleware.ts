import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = new Set(["/login", "/register"]);
const CUSTOMER_PREFIXES = ["/dashboard", "/loans", "/payments", "/profile"];
const ADMIN_PREFIXES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const rawToken = request.cookies.get("lms.auth.token")?.value;
  const token = rawToken && isTokenValid(rawToken) ? rawToken : undefined;

  console.log("[MW]", {
    pathname,
    hasToken: Boolean(token),
    tokenPrefix: token ? token.slice(0, 20) : null,
    allCookies: request.cookies.getAll().map((c) => c.name),
  });

  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const isCustomerPath = CUSTOMER_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminPath = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const isRootPath = pathname === "/";

  if (isRootPath) {
    if (token) {
      const role = decodeRoleFromToken(token);
      const target =
        role === "ADMIN" || role === "EMPLOYEE" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicPath) {
    if (token) {
      const role = decodeRoleFromToken(token);
      const target =
        role === "ADMIN" || role === "EMPLOYEE" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if ((isCustomerPath || isAdminPath) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function decodeRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

// function isTokenExpired(token: string): boolean {
//   try {
//     const parts = token.split(".");
//     if (parts.length !== 3) return true;
//     const payload = JSON.parse(
//       atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
//     );
//     if (typeof payload.exp !== "number") return true;
//     // exp is Unix seconds; Date.now() is ms
//     return Date.now() >= payload.exp * 1000;
//   } catch {
//     return true;
//   }
// }

interface JwtPayload {
  role?: string;
  userId?: number;
  email?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  if (typeof payload.exp !== "number") return false;
  // exp is Unix seconds; Date.now() is milliseconds
  return Date.now() < payload.exp * 1000;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
