import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const allowedEmails = [
  "sidxloadxr@gmail.com",
  "paolo14giuliano2001@gmail.com",
  // add more if needed
];

export async function middleware(req: any) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in → send to login
  if (!token?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in but email not allowed → block
  if (!allowedEmails.includes(token.email)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}

// Apply to all routes except auth & static files
export const config = {
  matcher: [
    "/((?!api/auth|_next|favicon.ico|login|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.gif|.*\\.ico).*)",
  ],
};
