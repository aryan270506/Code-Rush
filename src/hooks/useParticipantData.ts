import { useState, useEffect, useCallback } from "react";
import { participantService } from "../services/participantService";
import type {
  CompetitionRound,
  CompetitionPipelineInfo,
  ParticipantStats,
  CodeSubmission,
  LeaderboardEntry,
  NotificationItem,
  AnnouncementItem,
} from "../types/participant";
import { useAuth } from "../context/AuthContext";

export function useCompetitionPipeline() {
  const { user } = useAuth();
  const [pipeline, setPipeline] = useState<CompetitionPipelineInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = useCallback(async () => {
    try {
      const data = await participantService.getCompetitionPipeline(user?.uid);
      setPipeline(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  return { pipeline, loading, refreshPipeline: fetchPipeline };
}

export function useParticipantRounds() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<CompetitionRound[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRounds = useCallback(async () => {
    try {
      const data = await participantService.getRounds(user?.uid);
      setRounds(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  return { rounds, loading, refreshRounds: fetchRounds };
}

export function useParticipantStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ParticipantStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await participantService.getParticipantStats(user.uid);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refreshStats: fetchStats };
}

export function useSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await participantService.getSubmissions(user?.uid);
      setSubmissions(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return { submissions, loading, refreshSubmissions: fetchSubmissions };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await participantService.getLeaderboard();
      setLeaderboard(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, refreshLeaderboard: fetchLeaderboard };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await participantService.getNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    await participantService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    await participantService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications };
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    participantService.getAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  return { announcements, loading };
}
