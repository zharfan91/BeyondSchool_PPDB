import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/", "/info", "/faq", "/contact", "/announcements"];
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const roleProtectedRoutes: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["ADMIN", "SUPER_ADMIN"] },
  { prefix: "/staff", roles: ["STAFF", "ADMIN", "SUPER_ADMIN"] },
  { prefix: "/finance", roles: ["FINANCE", "ADMIN", "SUPER_ADMIN"] },
  { prefix: "/principal", roles: ["PRINCIPAL", "ADMIN", "SUPER_ADMIN"] },
  { prefix: "/selection", roles: ["STAFF", "ADMIN", "SUPER_ADMIN"] },
  { prefix: "/reports", roles: ["ADMIN", "PRINCIPAL", "SUPER_ADMIN"] },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("__Secure-better-auth.session_token");
    return response;
  }

  const roleEntry = roleProtectedRoutes.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(entry.prefix + "/")
  );

  if (roleEntry) {
    const userRole = (session.user as { role?: string }).role;
    if (!userRole || !roleEntry.roles.includes(userRole)) {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts|api/auth).*)"],
};
