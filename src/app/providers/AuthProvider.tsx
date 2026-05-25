import React, { createContext, useContext, useMemo, useState } from "react";
import { createId } from "../lib/id";
import { readJson, writeJson } from "../lib/storage";
import type { AppUser, AuthContextValue, Session, UserProfile, UserRole } from "../types";
import { seedUsers } from "../data/mockData";

const USERS_KEY = "twojadieta.v1.users" as const;
const SESSION_KEY = "twojadieta.v1.session" as const;

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sanitizeProfile(profile: Partial<UserProfile>): Partial<UserProfile> {
  const next: Partial<UserProfile> = { ...profile };
  if (typeof next.firstName === "string") next.firstName = next.firstName.trim();
  if (typeof next.lastName === "string") next.lastName = next.lastName.trim();
  if (typeof next.phone === "string") next.phone = next.phone.trim();
  if (typeof next.addressLine1 === "string") next.addressLine1 = next.addressLine1.trim();
  if (typeof next.addressCity === "string") next.addressCity = next.addressCity.trim();
  if (typeof next.addressPostalCode === "string") next.addressPostalCode = next.addressPostalCode.trim();
  return next;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(() => {
    const stored = readJson<AppUser[]>(USERS_KEY, []);
    if (stored.length > 0) return stored;
    writeJson<AppUser[]>(USERS_KEY, seedUsers);
    return seedUsers;
  });

  const [session, setSession] = useState<Session>(() => {
    return readJson<Session>(SESSION_KEY, { userId: null });
  });

  const currentUser = useMemo(() => users.find((u) => u.id === session.userId) ?? null, [users, session.userId]);

  const value: AuthContextValue = useMemo(() => {
    const isAuthenticated = !!currentUser;
    const role: UserRole | null = currentUser?.role ?? null;
    const isAdmin = role === "admin";

    function persistUsers(next: AppUser[]) {
      setUsers(next);
      writeJson<AppUser[]>(USERS_KEY, next);
    }

    function persistSession(next: Session) {
      setSession(next);
      writeJson<Session>(SESSION_KEY, next);
    }

    return {
      user: currentUser,
      users,
      isAuthenticated,
      isAdmin,

      register: ({ firstName, lastName, email, password }) => {
        const normalizedEmail = normalizeEmail(email);
        if (!firstName.trim() || !lastName.trim()) {
          return { ok: false, error: "Podaj imię i nazwisko." };
        }
        if (!normalizedEmail) {
          return { ok: false, error: "Podaj adres e-mail." };
        }
        if (!password || password.length < 4) {
          return { ok: false, error: "Hasło musi mieć min. 4 znaki (demo)." };
        }
        if (users.some((u) => u.email === normalizedEmail)) {
          return { ok: false, error: "Użytkownik z tym e-mailem już istnieje." };
        }

        const newUser: AppUser = {
          id: createId("usr"),
          role: "customer",
          email: normalizedEmail,
          password,
          profile: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          },
          createdAt: new Date().toISOString(),
        };

        const nextUsers = [newUser, ...users];
        persistUsers(nextUsers);
        persistSession({ userId: newUser.id });
        return { ok: true };
      },

      login: ({ email, password, rememberMe }) => {
        const normalizedEmail = normalizeEmail(email);
        const found = users.find((u) => u.email === normalizedEmail);
        if (!found || found.password !== password) {
          return { ok: false, error: "Nieprawidłowy e-mail lub hasło." };
        }

        // Session is persisted in localStorage; rememberMe is kept for UI completeness.
        persistSession({ userId: found.id });
        return { ok: true };
      },

      logout: () => {
        persistSession({ userId: null });
      },

      updateProfile: (patch) => {
        if (!currentUser) return { ok: false, error: "Musisz być zalogowany." };
        const sanitized = sanitizeProfile(patch);
        const nextUsers = users.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                profile: {
                  ...u.profile,
                  ...sanitized,
                },
              }
            : u,
        );
        persistUsers(nextUsers);
        return { ok: true };
      },

      // Admin-only helper
      setUserRole: (userId, role) => {
        const nextUsers = users.map((u) => (u.id === userId ? { ...u, role } : u));
        persistUsers(nextUsers);
      },
    };
  }, [currentUser, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
