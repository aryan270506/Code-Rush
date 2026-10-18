import React, { useState, useEffect } from "react";
import {
  User,
  CheckCircle2,
  Save,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { participantService } from "../../services/participantService";

export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      participantService.getProfile(user.uid).then((p) => {
        if (p) {
          setDisplayName(p.displayName || user.displayName || "");
          setInstitution(p.institution || "");
          setBio(p.bio || "");
          setGithub(p.github || "");
        }
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      await participantService.updateProfile(user.uid, {
        displayName: displayName.trim(),
        institution: institution.trim(),
        bio: bio.trim(),
        github: github.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-violet-primary/30 bg-bg-card/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-light uppercase tracking-wider mb-2">
          <User className="h-4 w-4" />
          <span>Competitor Identity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Participant Profile
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Manage your competition display details and public institutional affiliation.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-4 flex items-center gap-3 text-xs text-success font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Profile changes updated successfully.</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Security & Identity Card (1 col) */}
        <div className="rounded-3xl border border-border bg-bg-card/50 p-6 space-y-5 text-center flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-violet-primary to-cyan-primary text-3xl font-extrabold text-white shadow-xl shadow-violet-primary/20">
            {(displayName || user?.email || "P").charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-lg font-bold text-text-primary">{displayName || "Participant"}</h2>
            <p className="text-xs font-mono text-text-muted mt-0.5">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-border space-y-3 text-left text-xs font-mono">
            <div>
              <span className="text-text-muted text-[10px] uppercase block">Participant ID</span>
              <span className="text-text-secondary truncate block mt-0.5">{user?.uid}</span>
            </div>

            <div>
              <span className="text-text-muted text-[10px] uppercase block">Security Role</span>
              <span className="font-bold text-violet-light uppercase block mt-0.5">
                {profile?.role || "Participant"}
              </span>
            </div>

            <div>
              <span className="text-text-muted text-[10px] uppercase block">Email Verification</span>
              <span className="font-bold text-success flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified via OTP</span>
              </span>
            </div>

            <div>
              <span className="text-text-muted text-[10px] uppercase block">Arena Status</span>
              <span className="text-cyan-light font-bold block mt-0.5">Active Competitor</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Form (2 cols) */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-bg-card/50 p-6 sm:p-7 space-y-6">
          <div className="pb-3 border-b border-border">
            <h3 className="font-bold text-base text-text-primary">Personal Details</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              These details are visible on the public leaderboard.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Display Name */}
            <div>
              <label className="font-bold font-mono text-text-secondary uppercase block mb-1.5">
                Public Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-primary"
                placeholder="e.g. Alex Chen"
              />
            </div>

            {/* University / Institution */}
            <div>
              <label className="font-bold font-mono text-text-secondary uppercase block mb-1.5">
                Institution / University Affiliation
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-primary"
                placeholder="e.g. Stanford University or Independent"
              />
            </div>

            {/* GitHub Username */}
            <div>
              <label className="font-bold font-mono text-text-secondary uppercase block mb-1.5">
                GitHub Handle (Optional)
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-primary"
                placeholder="e.g. octocat"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="font-bold font-mono text-text-secondary uppercase block mb-1.5">
                Bio &amp; Coding Interests
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-violet-primary resize-none leading-relaxed"
                placeholder="Competitive programmer focusing on graph theory and distributed systems."
              />
            </div>

            {/* Non-editable alert */}
            <div className="rounded-xl border border-border bg-bg-secondary p-3 text-[11px] text-text-muted flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-text-muted mt-0.5 shrink-0" />
              <span>
                Account email, verification status, and competition scores cannot be edited
                directly. These are securely calculated and managed by Firebase Realtime Database rules.
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-primary/20 hover:bg-violet-light transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
