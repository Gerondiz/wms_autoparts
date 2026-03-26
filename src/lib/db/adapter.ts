/**
 * Drizzle Adapter для NextAuth v5
 * 
 * Адаптер для работы с сессиями в базе данных PostgreSQL через Drizzle ORM
 */

import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  users,
  accounts as dbAccounts,
  sessions as dbSessions,
  verificationTokens as dbVerificationTokens,
} from '@/lib/db/schema';
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken } from 'next-auth/adapters';

export function DrizzleAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
      const inserted = await db
        .insert(users)
        .values({
          email: user.email,
          passwordHash: user.passwordHash ?? '',
          fullName: user.name,
          isActive: true,
        })
        .returning();

      const created = inserted[0];

      return {
        id: created.id.toString(),
        email: created.email,
        emailVerified: null,
        name: created.fullName,
        passwordHash: created.passwordHash,
        createdAt: created.createdAt ?? new Date(),
      };
    },

    async getUser(userId: string) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId, 10)),
      });

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: null,
        name: user.fullName,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt ?? new Date(),
      };
    },

    async getUserByEmail(email: string) {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: null,
        name: user.fullName,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt ?? new Date(),
      };
    },

    async getUserByAccount({
      providerAccountId,
      provider,
    }: Pick<AdapterAccount, 'providerAccountId' | 'provider'>): Promise<AdapterUser | null> {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(dbAccounts.provider, provider),
          eq(dbAccounts.providerAccountId, providerAccountId)
        ),
      });

      if (!account) return null;

      const user = await db.query.users.findFirst({
        where: eq(users.id, account.userId),
      });

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        emailVerified: null,
        name: user.fullName,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt ?? new Date(),
      };
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>): Promise<AdapterUser> {
      const userId = parseInt(user.id, 10);

      const updateData: Record<string, unknown> = {};
      if (user.name !== undefined) updateData.fullName = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.passwordHash !== undefined) updateData.passwordHash = user.passwordHash;

      await db.update(users).set(updateData).where(eq(users.id, userId));

      const updated = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!updated) {
        throw new Error(`User with id ${user.id} not found`);
      }

      return {
        id: updated.id.toString(),
        email: updated.email,
        emailVerified: null,
        name: updated.fullName,
        passwordHash: updated.passwordHash,
        createdAt: updated.createdAt ?? new Date(),
      };
    },

    async deleteUser(userId: string): Promise<void> {
      await db.delete(users).where(eq(users.id, parseInt(userId, 10)));
    },

    async linkAccount(account: AdapterAccount): Promise<void> {
      const values = {
        userId: parseInt(account.userId, 10),
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      } as unknown as {
        userId: number;
        type: 'oauth' | 'oidc' | 'email' | 'webauthn';
        provider: string;
        providerAccountId: string;
        refresh_token: string | null;
        access_token: string | null;
        expires_at: number | null;
        token_type: string | null;
        scope: string | null;
        id_token: string | null;
        session_state: string | null;
      };

      await db.insert(dbAccounts).values(values);
    },

    async unlinkAccount(
      providerAccountId: Pick<AdapterAccount, 'providerAccountId' | 'provider'>
    ): Promise<void> {
      await db
        .delete(dbAccounts)
        .where(
          and(
            eq(dbAccounts.provider, providerAccountId.provider),
            eq(dbAccounts.providerAccountId, providerAccountId.providerAccountId)
          )
        );
    },

    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<AdapterSession> {
      await db.insert(dbSessions).values({
        sessionToken: session.sessionToken,
        userId: parseInt(session.userId, 10),
        expires: session.expires,
      });

      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      };
    },

    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const session = await db.query.sessions.findFirst({
        where: eq(dbSessions.sessionToken, sessionToken),
        with: {
          user: true,
        },
      }) as { sessionToken: string; userId: number; expires: Date; user: { id: number; email: string; fullName: string | null; passwordHash: string; createdAt: Date | null } } | null;

      if (!session) return null;

      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId.toString(),
          expires: session.expires,
        },
        user: {
          id: session.user.id.toString(),
          email: session.user.email,
          emailVerified: null,
          name: session.user.fullName,
          passwordHash: session.user.passwordHash,
          createdAt: session.user.createdAt ?? new Date(),
        },
      };
    },

    async updateSession(session: {
      sessionToken: string;
      expires: Date;
    }): Promise<AdapterSession | null> {
      await db
        .update(dbSessions)
        .set({ expires: session.expires })
        .where(eq(dbSessions.sessionToken, session.sessionToken));

      const updated = await db.query.sessions.findFirst({
        where: eq(dbSessions.sessionToken, session.sessionToken),
      });

      if (!updated) return null;

      return {
        sessionToken: updated.sessionToken,
        userId: updated.userId.toString(),
        expires: updated.expires,
      };
    },

    async deleteSession(sessionToken: string): Promise<void> {
      await db.delete(dbSessions).where(eq(dbSessions.sessionToken, sessionToken));
    },

    async createVerificationToken(token: VerificationToken): Promise<VerificationToken> {
      await db.insert(dbVerificationTokens).values({
        identifier: token.identifier,
        token: token.token,
        expires: token.expires,
      });

      return token;
    },

    async useVerificationToken(token: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> {
      const existing = await db.query.verificationTokens.findFirst({
        where: and(
          eq(dbVerificationTokens.identifier, token.identifier),
          eq(dbVerificationTokens.token, token.token)
        ),
      });

      if (!existing) return null;

      await db
        .delete(dbVerificationTokens)
        .where(
          and(
            eq(dbVerificationTokens.identifier, token.identifier),
            eq(dbVerificationTokens.token, token.token)
          )
        );

      return {
        identifier: existing.identifier,
        token: existing.token,
        expires: existing.expires,
      };
    },
  };
}
