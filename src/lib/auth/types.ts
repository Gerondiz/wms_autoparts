/**
 * Типы NextAuth для WMS Autoparts
 * 
 * Расширяет типы next-auth для поддержки:
 * - Ролевой модели (roleTypeId, roleName, roleDisplayName)
 * - Системы разрешений (permissions)
 */

import 'next-auth';
import 'next-auth/jwt';
import type { DefaultSession } from 'next-auth';

// Расширение типов сессии
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      roleTypeId?: string | null;
      roleName?: string | null;
      roleDisplayName?: string | null;
      permissions?: string[];
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    roleTypeId?: string | null;
    roleName?: string | null;
    roleDisplayName?: string | null;
    permissions?: string[];
    passwordHash?: string;
    createdAt?: Date;
  }
}

// Расширение типов JWT
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string | null;
    name?: string | null;
    roleTypeId?: string | null;
    roleName?: string | null;
    roleDisplayName?: string | null;
    permissions?: string[];
  }
}

// Типы для использования в компонентах
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  roleTypeId?: string | null;
  roleName?: string | null;
  roleDisplayName?: string | null;
  permissions?: string[];
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

// Типы для middleware
export interface AuthRequest {
  auth: {
    user: AuthUser;
    expires: Date;
  } | null;
}
