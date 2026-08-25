"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/dashboard/PageHeader";

interface UpdateProfileResponse {
  user: {
    firstName: string;
    lastName: string;
    phone: string | null;
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

export function ProfileSettingsForm() {
  const { user, fetchWithAuth, updateUser } = useAuth();

  // ProtectedRoute/AdminGuard guarantee `user` is populated (via AuthContext's own
  // /api/auth/me fetch) before this component renders, so the form seeds
  // directly from context — no separate fetch, no loading state, and no
  // risk of a failed load silently blanking the form.
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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

      // Update AuthContext directly from the server's response instead of
      // calling refreshSession() — refreshSession() toggles AuthContext's
      // `loading` flag, which makes ProtectedRoute/AdminGuard unmount this
      // component's parent page mid-save, so the success message below
      // would never actually render.
      const data = (await res.json()) as UpdateProfileResponse;
      updateUser({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      });
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
      <PageHeader title="Your Profile" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Profile</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          Your Profile
        </h1>
      </div>

      <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-lg font-bold text-foreground">Personal Details</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handleProfileSubmit(e)}>
          <div>
            <label
              htmlFor="profile-email"
              className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground/50"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-firstName"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                First Name
              </label>
              <input
                id="profile-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="profile-lastName"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Last Name
              </label>
              <input
                id="profile-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
            >
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              maxLength={30}
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
      </div>

      <div className="max-w-xl rounded-xl border border-glass-border bg-surface p-6">
        <h2 className="text-lg font-bold text-foreground">Change Password</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => void handlePasswordSubmit(e)}>
          <div>
            <label
              htmlFor="profile-currentPassword"
              className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
            >
              Current Password
            </label>
            <input
              id="profile-currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-newPassword"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                New Password
              </label>
              <input
                id="profile-newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-glass-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="profile-confirmPassword"
                className="mb-1 block text-xs font-bold uppercase tracking-widest text-foreground/70"
              >
                Confirm New Password
              </label>
              <input
                id="profile-confirmPassword"
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
