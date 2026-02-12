import { Prisma, type User } from '@prisma/client';
import type { H3Event } from 'h3';
import { useAuth0 } from '#imports';
import { prisma } from './prisma';

type SessionUser = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
};

export type NormalizedAuthProfile = {
  auth0Id: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type AuthUserSyncResult =
  | {
      authenticated: false;
      user: null;
      profile: null;
      isFirstLogin: false;
    }
  | {
      authenticated: true;
      user: User;
      profile: NormalizedAuthProfile;
      isFirstLogin: boolean;
    };

export class AuthUserSyncError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AuthUserSyncError';
    this.statusCode = statusCode;
  }
}

function normalizeString(value: unknown) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function splitName(fullName: string | null) {
  if (!fullName) return { firstName: undefined, lastName: undefined };
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: undefined, lastName: undefined };
  if (parts.length === 1) return { firstName: parts[0], lastName: undefined };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function normalizeProfile(sessionUser: SessionUser): NormalizedAuthProfile {
  const auth0Id = normalizeString(sessionUser.sub);
  if (!auth0Id) {
    throw new AuthUserSyncError('[auth] Session user missing sub claim', 500);
  }

  const email = normalizeString(sessionUser.email);
  const name = normalizeString(sessionUser.name);
  const imageUrl = normalizeString(sessionUser.picture);
  const givenName = normalizeString(sessionUser.given_name);
  const familyName = normalizeString(sessionUser.family_name);
  const fallbackName = splitName(name);

  return {
    auth0Id,
    email,
    name,
    imageUrl,
    firstName: givenName || fallbackName.firstName || undefined,
    lastName: familyName || fallbackName.lastName || undefined,
    phone: normalizeString(sessionUser.phone_number) || undefined,
  };
}

export async function syncAuthenticatedUser(event: H3Event): Promise<AuthUserSyncResult> {
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();

  if (!session?.user) {
    return {
      authenticated: false,
      user: null,
      profile: null,
      isFirstLogin: false,
    };
  }

  const profile = normalizeProfile(session.user as SessionUser);

  let user = await prisma.user.findUnique({
    where: { auth0Id: profile.auth0Id },
  });

  let isFirstLogin = false;

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          auth0Id: profile.auth0Id,
          email: profile.email,
          name: profile.name,
          imageUrl: profile.imageUrl,
        },
      });
      isFirstLogin = true;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        user = await prisma.user.findUnique({
          where: { auth0Id: profile.auth0Id },
        });
      } else {
        throw error;
      }
    }
  } else {
    const updates: {
      email?: string | null;
      name?: string | null;
      imageUrl?: string | null;
    } = {};

    if (user.email !== profile.email) updates.email = profile.email;
    if (user.name !== profile.name) updates.name = profile.name;
    if (user.imageUrl !== profile.imageUrl) updates.imageUrl = profile.imageUrl;

    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
    }
  }

  if (!user) {
    throw new AuthUserSyncError('[auth] Failed to sync user', 500);
  }

  return {
    authenticated: true,
    user,
    profile,
    isFirstLogin,
  };
}

