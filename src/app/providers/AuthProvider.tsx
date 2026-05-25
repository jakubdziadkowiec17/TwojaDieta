import React, { createContext, useContext, useMemo, useState } from "react";
import { createId } from "../lib/id";
import { readJson, writeJson } from "../lib/storage";
import type { AppUser, AuthContextValue, Session, UserProfile, UserRole } from "../types";
import { seedUsers } from "../data/mockData";
import {
  validateCity,
  validateEmail,
  validatePassword,
  validatePhone,
  validatePostalCode,
  validateRequiredText,
  validationLimits,
} from "../lib/validation";

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
    const stored = readJson<AppUser[] | null>(USERS_KEY, null);
    if (stored !== null) return stored;
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
        const nameError = validateRequiredText(firstName, "Imię", 2, validationLimits.nameMax)
          ?? validateRequiredText(lastName, "Nazwisko", 2, validationLimits.nameMax);
        if (nameError) return { ok: false, error: nameError };
        const emailError = validateEmail(normalizedEmail);
        if (emailError) return { ok: false, error: emailError };
        const passwordError = validatePassword(password);
        if (passwordError) return { ok: false, error: passwordError };
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
        if (typeof sanitized.firstName === "string") {
          const valueError = validateRequiredText(sanitized.firstName, "Imię", 2, validationLimits.nameMax);
          if (valueError) return { ok: false, error: valueError };
        }
        if (typeof sanitized.lastName === "string") {
          const valueError = validateRequiredText(sanitized.lastName, "Nazwisko", 2, validationLimits.nameMax);
          if (valueError) return { ok: false, error: valueError };
        }
        if (typeof sanitized.phone === "string") {
          const valueError = validatePhone(sanitized.phone, false);
          if (valueError) return { ok: false, error: valueError };
        }
        if (typeof sanitized.addressLine1 === "string") {
          const valueError = validateRequiredText(sanitized.addressLine1, "Adres", 5, validationLimits.addressMax);
          if (valueError) return { ok: false, error: valueError };
        }
        if (typeof sanitized.addressCity === "string") {
          const valueError = validateCity(sanitized.addressCity, true, true);
          if (valueError) return { ok: false, error: valueError };
        }
        if (typeof sanitized.addressPostalCode === "string") {
          const valueError = validatePostalCode(sanitized.addressPostalCode);
          if (valueError) return { ok: false, error: valueError };
        }
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

      resetPassword: ({ email, newPassword }) => {
        const normalizedEmail = normalizeEmail(email);
        const emailError = validateEmail(normalizedEmail);
        if (emailError) return { ok: false, error: emailError };
        const userToUpdate = users.find((u) => u.email === normalizedEmail);
        if (!userToUpdate) {
          return { ok: false, error: "Nie znaleziono konta z tym adresem e-mail." };
        }
        const passwordError = validatePassword(newPassword);
        if (passwordError) return { ok: false, error: passwordError };

        persistUsers(users.map((u) => (u.id === userToUpdate.id ? { ...u, password: newPassword } : u)));
        return { ok: true };
      },

      changePassword: ({ currentPassword, newPassword }) => {
        if (!currentUser) return { ok: false, error: "Musisz być zalogowany." };
        if (currentUser.password !== currentPassword) {
          return { ok: false, error: "Bieżące hasło jest nieprawidłowe." };
        }
        const passwordError = validatePassword(newPassword, "Nowe hasło");
        if (passwordError) return { ok: false, error: passwordError };
        if (newPassword === currentPassword) {
          return { ok: false, error: "Nowe hasło musi różnić się od bieżącego." };
        }

        persistUsers(users.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u)));
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
