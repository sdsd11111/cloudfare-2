import { withAuth } from "next-auth/middleware";

const proxy = withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export { proxy };

export const config = {
  matcher: ["/admin/:path*"]
};
