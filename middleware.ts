import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_MOBILE_NUMBER = "09306613683";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes - only allow admin mobile number
    if (pathname.startsWith("/admin")) {
      const userMobileNumber = (token?.mobileNumber as string)?.trim().replace(/\s+/g, "");
      if (userMobileNumber !== ADMIN_MOBILE_NUMBER) {
        // Not admin, redirect to dashboard or home
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

