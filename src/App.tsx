import { useState } from "react";
import type { CSSProperties } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./features/auth/LandingPage";
import LoginPage from "./features/auth/LoginPage";
import SignupStepOne from "./features/auth/SignupStepOne";
import SignupEmailStep from "./features/auth/SignupEmailStep";
import SignupOtp from "./features/auth/SignupOtp";
import LookingForStep from "./features/auth/LookingForStep";
import ProfileImagesStep from "./features/auth/ProfileImagesStep";
import VerificationStep from "./features/auth/VerificationStep";
import ResetStepOne from "./features/auth/ResetStepOne";
import ResetOtp from "./features/auth/ResetOtp";
import ResetNewPassword from "./features/auth/ResetNewPassword";
import Dashboard from "./features/dashboard/Dashboard";
import type { NavTab } from "./features/dashboard/Dashboard";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { AllConnectionsPage } from "./features/connections/AllConnectionsPage";
import { ConnectionRequestsPage } from "./features/connections/ConnectionRequestsPage";
import { BlockedAccountsPage } from "./features/connections/BlockedAccountsPage";
import { ReportAbusePage } from "./features/connections/ReportAbusePage";
import { PostViewPage } from "./features/posts/PostViewPage";
import { PostContentPage } from "./features/posts/PostContentPage";
import { ProfileViewPage } from "./features/profile/ProfileViewPage";
import { HelpPage } from "./features/help/HelpPage";
import { MessengerPage } from "./features/messenger/MessengerPage";
import MobileGuard from "./components/MobileGuard";
import "./styles/spinner.css";

type TabPathMap = Record<NavTab, string>;

export default function App() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");

  const tabPathMap: TabPathMap = {
    profile: "/profile",
    connections: "/connections",
    feed: "/feed",
    room: "/room",
  };

  const navigateTo = (path: string, delay = 550) => {
    setIsLoading(true);
    window.setTimeout(() => {
      navigate(path);
      setIsLoading(false);
    }, delay);
  };

  const renderDashboard = (initialTab: NavTab) =>
    userRole === "admin" ? (
      <AdminDashboard />
    ) : (
      <Dashboard
        onSignOut={() => navigateTo("/", 0)}
        initialTab={initialTab}
        onTabChange={(tab) => navigate(tabPathMap[tab])}
      />
    );

  return (
    <MobileGuard>
      {isLoading && (
        <div className="loading-overlay" aria-live="polite">
          <div className="spinner" role="status" aria-label="Loading">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} style={{ "--i": index } as CSSProperties} />
            ))}
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<LandingPage onGetStarted={() => navigateTo("/login")} />}
        />
        <Route
          path="/login"
          element={
            <LoginPage
              onForgotPassword={() => navigateTo("/reset")}
              onCreateAccount={() => navigateTo("/signup")}
              onSuccess={() => navigateTo("/dashboard")}
            />
          }
        />

        {/* Signup Flow */}
        <Route
          path="/signup"
          element={
            <SignupStepOne
              onNext={() => navigateTo("/signup/email")}
              onBack={() => navigateTo("/login")}
            />
          }
        />
        <Route
          path="/signup/email"
          element={
            <SignupEmailStep
              onSendCode={() => navigateTo("/signup/otp")}
              onBack={() => navigateTo("/signup")}
            />
          }
        />
        <Route
          path="/signup/otp"
          element={
            <SignupOtp
              onConfirm={() => navigateTo("/signup/looking-for")}
              onBack={() => navigateTo("/signup/email")}
            />
          }
        />
        <Route
          path="/signup/looking-for"
          element={
            <LookingForStep
              onNext={() => navigateTo("/signup/images")}
              onBack={() => navigateTo("/signup/otp")}
            />
          }
        />
        <Route
          path="/signup/images"
          element={
            <ProfileImagesStep
              onNext={() => navigateTo("/signup/verification")}
              onBack={() => navigateTo("/signup/looking-for")}
            />
          }
        />
        <Route
          path="/signup/verification"
          element={
            <VerificationStep
              onNext={() => navigateTo("/dashboard")}
              onSkip={() => navigateTo("/dashboard")}
              onBack={() => navigateTo("/signup/images")}
            />
          }
        />

        {/* Reset Password Flow */}
        <Route
          path="/reset"
          element={
            <ResetStepOne
              onSendCode={(email) => {
                setResetEmail(email);
                navigateTo("/reset/otp");
              }}
              onBack={() => navigateTo("/login")}
            />
          }
        />
        <Route
          path="/reset/otp"
          element={
            <ResetOtp
              email={resetEmail}
              onConfirm={(code) => {
                setResetCode(code);
                navigateTo("/reset/new-password");
              }}
              onBack={() => navigateTo("/reset")}
            />
          }
        />
        <Route
          path="/reset/new-password"
          element={
            <ResetNewPassword
              email={resetEmail}
              code={resetCode}
              onComplete={() => navigateTo("/login")}
              onBack={() => navigateTo("/reset/otp")}
            />
          }
        />

        {/* Dashboard + Tabs */}
        <Route path="/dashboard" element={renderDashboard("feed")} />
        <Route path="/feed" element={renderDashboard("feed")} />
        <Route path="/connections" element={renderDashboard("connections")} />
        <Route path="/profile" element={renderDashboard("profile")} />
        <Route path="/room" element={renderDashboard("room")} />

  {/* Connection Full Pages */}
  <Route path="/connections/all" element={<AllConnectionsPage />} />
  <Route path="/connections/requests" element={<ConnectionRequestsPage />} />
  <Route path="/blocked-accounts" element={<BlockedAccountsPage />} />
  <Route path="/report-abuse" element={<ReportAbusePage />} />

  {/* Post Pages */}
  <Route path="/post/:postId" element={<PostViewPage />} />
  <Route path="/post/create" element={<PostContentPage />} />
  <Route path="/post/edit/:postId" element={<PostContentPage />} />

  {/* Profile View Page */}
  <Route path="/profile/:userId" element={<ProfileViewPage />} />

  {/* Help Page */}
  <Route path="/help" element={<HelpPage />} />

  {/* Messenger */}
  <Route path="/messenger" element={<MessengerPage />} />
  <Route path="/messenger/:chatUserId" element={<MessengerPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileGuard>
  );
}
