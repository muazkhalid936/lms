import { NextResponse } from "next/server";
import { verifyToken } from "./lib/utils/auth";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip static assets (images, css, js, fonts, etc.)
  if (/\.(.*)$/.test(pathname)) {
    return NextResponse.next();
  }

  const protectedRoutes = ["/profile", "/dashboard"];
  const authRoutes = ["/auth/login", "/auth/signup"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isStudentRoute = pathname.startsWith("/dashboard/student");
  const isInstructorRoute = pathname.startsWith("/dashboard/instructor");

  // Get cookies
  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("userId")?.value;

  // 🚫 Block access if no token or no userId cookie
  if (isProtectedRoute && (!token || !userId)) {
    const url = new URL("/auth/login", request.url);
    return NextResponse.redirect(url);
  }

  // If accessing auth routes with valid token → redirect to home
  if (isAuthRoute && token && userId) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/", request.url));
    } catch {
      // Invalid/expired token → allow to stay on login/signup
    }
  }

  // ✅ Verify token and role for dashboard access
  if (token && (isStudentRoute || isInstructorRoute)) {
    try {
      const payload = await verifyToken(token);
      const userType = payload.userType.toLowerCase();

      // Student trying to access instructor dashboard
      if (userType === "student" && isInstructorRoute) {
        return NextResponse.redirect(new URL("/dashboard/student", request.url));
      }

      // Instructor trying to access student dashboard
      if (userType === "instructor" && isStudentRoute) {
        return NextResponse.redirect(new URL("/dashboard/instructor", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("userId");
      return response;
    }
  }

  return NextResponse.next();
}

// ✅ Middleware will only apply to these routes
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/auth/:path*"],
};
