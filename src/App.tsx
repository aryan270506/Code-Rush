import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
import ProtectedRoute from "./routes/ProtectedRoute";

// Participant Layout and Sub-Pages
import ParticipantLayout from "./components/participant/ParticipantLayout";
import ParticipantDashboardPage from "./pages/participant/ParticipantDashboardPage";
import CompetitionPipelinePage from "./pages/participant/CompetitionPipelinePage";
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

// Admin Dashboard Screens
import AdminOverview from "./pages/admin/AdminOverview";
import Competitions from "./pages/admin/Competitions";
import Participants from "./pages/admin/Participants";
import RoundManagement from "./pages/admin/RoundManagement";
import QuestionBank from "./pages/admin/QuestionBank";
import Submissions from "./pages/admin/Submissions";
import ScoringQualification from "./pages/admin/ScoringQualification";
import LeaderboardResults from "./pages/admin/LeaderboardResults";
import ReportsSettings from "./pages/admin/ReportsSettings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
              <Route path="competition" element={<CompetitionPipelinePage />} />
              <Route path="rounds" element={<Navigate to="/participant/competition" replace />} />
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

            {/* Screen 1: Admin Overview */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <AdminOverview />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/overview" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Screen 2: Competition Management */}
            <Route
              path="/admin/competitions"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <Competitions />
                </ProtectedRoute>
              }
            />

            {/* Screen 3: Participant Management */}
            <Route
              path="/admin/participants"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <Participants />
                </ProtectedRoute>
              }
            />

            {/* Screen 4: Round Management */}
            <Route
              path="/admin/rounds"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <RoundManagement />
                </ProtectedRoute>
              }
            />

            {/* Screen 5: Question Bank */}
            <Route
              path="/admin/questions"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <QuestionBank />
                </ProtectedRoute>
              }
            />

            {/* Screen 6: Submissions & Evaluation */}
            <Route
              path="/admin/submissions"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <Submissions />
                </ProtectedRoute>
              }
            />

            {/* Screen 7: Scoring & Qualification */}
            <Route
              path="/admin/scoring"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <ScoringQualification />
                </ProtectedRoute>
              }
            />

            {/* Screen 8: Leaderboard & Results */}
            <Route
              path="/admin/leaderboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <LeaderboardResults />
                </ProtectedRoute>
              }
            />

            {/* Screen 9: Reports & Settings */}
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]} requireVerified={true}>
                  <ReportsSettings />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
