import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";

// Expose role + tenantId on the session/JWT.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tenantId: string | null;
    } & DefaultSession["user"];
  }
  interface User {
    role: Role;
    tenantId: string | null;
  }
}
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// OAuth providers enable only when both env vars are present.
const oauthProviders = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(Google);
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  oauthProviders.push(GitHub);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: "/api/v1/auth",
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  trustHost: true,
  providers: [
    ...oauthProviders,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, find-or-create the user in our DB so role/tenantId are available.
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) return false;
        try {
          const tenant = await getActiveTenant();
          let dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name ?? user.email.split("@")[0],
                role: "CUSTOMER",
                tenantId: tenant.id,
              },
            });
          }
          // Attach DB fields so jwt() callback can read them.
          user.id = dbUser.id;
          (user as { role: Role }).role = dbUser.role;
          (user as { tenantId: string | null }).tenantId = dbUser.tenantId;
        } catch {
          return false;
        }
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as { sub?: string; role?: Role; tenantId?: string | null };
      if (session.user) {
        session.user.id = t.sub ?? "";
        session.user.role = (t.role ?? "CUSTOMER") as Role;
        session.user.tenantId = t.tenantId ?? null;
      }
      return session;
    },
  },
});
