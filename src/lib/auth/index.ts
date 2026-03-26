/**
 * NextAuth v5 Configuration для WMS Autoparts
 * 
 * Конфигурация аутентификации с:
 * - Credentials provider (email + password)
 * - bcryptjs для проверки паролей
 * - Сессии в базе данных (Drizzle adapter)
 * - JWT стратегия для production
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, roleTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { DrizzleAdapter } from '@/lib/db/adapter';

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(),
  
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new Error(parsed.error.errors.map(e => e.message).join(', '));
        }

        const { email, password } = parsed.data;

        // Поиск пользователя с ролью и permissions
        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase().trim()),
          with: {
            roleType: true,
          },
        });

        if (!user || !user.isActive) {
          throw new Error('Неверный email или пароль');
        }

        // Проверка пароля с bcrypt
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
          throw new Error('Неверный email или пароль');
        }

        // Возвращаем пользователя с permissions
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          roleTypeId: user.roleTypeId?.toString() ?? null,
          roleName: (user.roleType as any)?.name ?? null,
          roleDisplayName: (user.roleType as any)?.displayName ?? null,
          permissions: ((user.roleType as any)?.permissions as string[]) ?? [],
        };
      },
    }),
  ],

  // Стратегия сессий: JWT для production, database для development
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    updateAge: 24 * 60 * 60, // Обновлять токен раз в 24 часа
  },

  // Настройка JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // При первом входе добавляем данные пользователя в токен
      if (user) {
        token.id = user.id;
        token.roleTypeId = user.roleTypeId;
        token.roleName = user.roleName;
        token.roleDisplayName = user.roleDisplayName;
        token.permissions = user.permissions;
      }

      // Обновление сессии через useSession().update()
      if (trigger === 'update' && session) {
        return {
          ...token,
          ...session.user,
        };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roleTypeId = token.roleTypeId as string | null;
        session.user.roleName = token.roleName as string | null;
        session.user.roleDisplayName = token.roleDisplayName as string | null;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },

    // Логирование событий безопасности
    async signIn({ user, account }) {
      // Можно добавить логирование успешных входов
      // await logSecurityEvent('SIGN_IN', { userId: user.id, provider: account?.provider });
      return true;
    },
  },

  // Страницы аутентификации
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin', // Страница ошибок
  },

  // Настройки безопасности
  secret: process.env.AUTH_SECRET,
  
  // Включение для HTTPS в production
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  // Обработка событий
  events: {
    async signIn({ user }) {
      // Логирование входа (можно отправить в систему мониторинга)
      console.log(`[AUTH] User signed in: ${user.email}`);
    },
    async signOut(message) {
      // Логирование выхода
      const token = (message as Record<string, unknown>)?.token as Record<string, unknown> | undefined;
      const email = token?.email as string | undefined;
      console.log(`[AUTH] User signed out: ${email ?? 'unknown'}`);
    },
    async createUser({ user }) {
      console.log(`[AUTH] New user created: ${user.email}`);
    },
  },

  // Debug режим только в development
  debug: process.env.NODE_ENV === 'development',
});
