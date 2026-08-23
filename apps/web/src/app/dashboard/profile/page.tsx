"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
  };
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export default function ClientProfilePage() {
  const { user, fetchWithAuth, refreshSession } = useAuth();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetchWithAuth("/api/auth/me");
        if (!res.ok) return;
        const data = (await res.json()) as MeResponse;
        if (cancelled) return;
        setEmail(data.user.email);
        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setPhone(data.user.phone ?? "");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user, fetchWithAuth]);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetchWithAuth("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      if (!res.ok) {
        setProfileError(await readErrorMessage(res));
        return;
      }

      await refreshSession();
      setProfileSuccess(true);
    } catch {
      setProfileError("Something went wrong. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetchWithAuth("/api/users/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        setPasswordError(await readErrorMessage(res));
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Profile</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Your Profile
        </h1>
      </div>

      <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
        {profileLoading ? (
          <p className="mt-4 text-sm text-foreground/50">Loading...</p>
        ) : (
          <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handleProfileSubmit(e)}>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground/50"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            {profileSuccess && <p className="text-sm text-accent">Profile updated.</p>}

            <button
              type="submit"
              disabled={profileSaving}
              className="self-start rounded-full bg-accent px-6 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>

      <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-lg font-bold text-foreground">Change Password</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handlePasswordSubmit(e)}>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/40">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>

          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-accent">Password updated.</p>}

          <button
            type="submit"
            disabled={passwordSaving}
            className="self-start rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-glass-bg disabled:opacity-50"
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
