import React from "react";
import {
  Megaphone,
  Pin,
  Clock,
} from "lucide-react";
import { useAnnouncements } from "../../hooks/useParticipantData";

export const AnnouncementsPage: React.FC = () => {
  const { announcements } = useAnnouncements();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="rounded-3xl border border-violet-primary/30 bg-bg-card/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-violet-light uppercase tracking-wider mb-2">
          <Megaphone className="h-4 w-4" />
          <span>Organizer Broadcasts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Contest Announcements
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Official bulletins, schedule updates, test re-judging notices, and competitive advisories.
        </p>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const isUrgent = ann.priority === "urgent";
          const isHigh = ann.priority === "high";

          return (
            <div
              key={ann.id}
              className={`rounded-3xl border p-6 backdrop-blur-md transition-all space-y-4 ${
                ann.isPinned
                  ? "border-violet-primary/50 bg-gradient-to-r from-violet-primary/10 to-bg-card/60 shadow-lg shadow-violet-primary/10"
                  : isUrgent
                  ? "border-danger/40 bg-danger/5"
                  : "border-border bg-bg-card/50"
              }`}
            >
              {/* Top metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 rounded-full bg-violet-primary/30 text-violet-light px-2.5 py-0.5 text-[11px] font-bold">
                      <Pin className="h-3 w-3" />
                      <span>Pinned</span>
                    </span>
                  )}
                  {isUrgent && (
                    <span className="rounded-full bg-danger/20 text-danger px-2.5 py-0.5 text-[11px] font-bold">
                      Urgent Notice
                    </span>
                  )}
                  {isHigh && (
                    <span className="rounded-full bg-warning/20 text-warning px-2.5 py-0.5 text-[11px] font-bold">
                      Important
                    </span>
                  )}
                  <span className="text-xs font-mono text-text-muted capitalize">
                    {ann.category.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  {ann.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {ann.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
