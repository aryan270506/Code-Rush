import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

// Participant Layout and Sub-Pages
import ParticipantLayout from "./components/participant/ParticipantLayout";
import ParticipantDashboardPage from "./pages/participant/ParticipantDashboardPage";
import QuizBattlePage from "./pages/participant/rounds/QuizBattlePage";
import CodingBattlePage from "./pages/participant/rounds/CodingBattlePage";
import DebuggingBattlePage from "./pages/participant/rounds/DebuggingBattlePage";
import FinalBattlePage from "./pages/participant/rounds/FinalBattlePage";
import LeaderboardPage from "./pages/participant/LeaderboardPage";
import PerformancePage from "./pages/participant/PerformancePage";
import SubmissionsPage from "./pages/participant/SubmissionsPage";
import AnnouncementsPage from "./pages/participant/AnnouncementsPage";
import ProfilePage from "./pages/participant/ProfilePage";
import SettingsPage from "./pages/participant/SettingsPage";
import HelpSupportPage from "./pages/participant/HelpSupportPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Participant Nested Routes */}
          <Route
            path="/participant"
            element={
              <ProtectedRoute allowedRoles={["participant", "admin"]} requireVerified={true}>
                <ParticipantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/participant/dashboard" replace />} />
            <Route path="dashboard" element={<ParticipantDashboardPage />} />
            <Route path="rounds/quiz" element={<QuizBattlePage />} />
            <Route path="rounds/coding" element={<CodingBattlePage />} />
            <Route path="rounds/debugging" element={<DebuggingBattlePage />} />
            <Route path="rounds/final" element={<FinalBattlePage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpSupportPage />} />
            <Route path="*" element={<Navigate to="/participant/dashboard" replace />} />
          </Route>

          {/* Protected Admin Route (Requires verified administrator) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
