import { useState } from "react";
import type { CSSProperties } from "react";
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
import AdminDashboard from "./features/admin/AdminDashboard";
import MobileGuard from "./components/MobileGuard";
import "./styles/spinner.css";

type Route =
  | "landing"
  | "login"
  | "signup-step1"
  | "signup-email"
  | "signup-otp"
  | "signup-looking-for"
  | "signup-images"
  | "signup-verification"
  | "reset-email"
  | "reset-otp"
  | "reset-new-password"
  | "dashboard";

export default function App() {
  const { userRole } = useAuth();
  const [route, setRoute] = useState<Route>("landing");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");

  const navigateTo = (nextRoute: Route, delay = 550) => {
    setIsLoading(true);
    window.setTimeout(() => {
      setRoute(nextRoute);
      setIsLoading(false);
    }, delay);
  };

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

      {route === "landing" && (
        <LandingPage onGetStarted={() => navigateTo("login")} />
      )}

      {route === "login" && (
        <LoginPage
          onForgotPassword={() => navigateTo("reset-email")}
          onCreateAccount={() => navigateTo("signup-step1")}
          onSuccess={() => navigateTo("dashboard")}
        />
      )}

      {/* Signup Flow */}
      {route === "signup-step1" && (
        <SignupStepOne
          onNext={() => navigateTo("signup-email")}
          onBack={() => navigateTo("login")}
        />
      )}

      {route === "signup-email" && (
        <SignupEmailStep
          onSendCode={() => navigateTo("signup-otp")}
          onBack={() => navigateTo("signup-step1")}
        />
      )}

      {route === "signup-otp" && (
        <SignupOtp
          onConfirm={() => navigateTo("signup-looking-for")}
          onBack={() => navigateTo("signup-email")}
        />
      )}

      {route === "signup-looking-for" && (
        <LookingForStep
          onNext={() => navigateTo("signup-images")}
          onBack={() => navigateTo("signup-otp")}
        />
      )}

      {route === "signup-images" && (
        <ProfileImagesStep
          onNext={() => navigateTo("signup-verification")}
          onBack={() => navigateTo("signup-looking-for")}
        />
      )}

      {route === "signup-verification" && (
        <VerificationStep
          onNext={() => navigateTo("dashboard")}
          onSkip={() => navigateTo("dashboard")}
          onBack={() => navigateTo("signup-images")}
        />
      )}

      {/* Reset Password Flow */}
      {route === "reset-email" && (
        <ResetStepOne
          onSendCode={(email) => {
            setResetEmail(email);
            navigateTo("reset-otp");
          }}
          onBack={() => navigateTo("login")}
        />
      )}

      {route === "reset-otp" && (
        <ResetOtp
          email={resetEmail}
          onConfirm={(code) => {
            setResetCode(code);
            navigateTo("reset-new-password");
          }}
          onBack={() => navigateTo("reset-email")}
        />
      )}

      {route === "reset-new-password" && (
        <ResetNewPassword
          email={resetEmail}
          code={resetCode}
          onComplete={() => navigateTo("login")}
          onBack={() => navigateTo("reset-otp")}
        />
      )}

      {/* Dashboard - Role-based routing */}
      {route === "dashboard" && (
        <>
          {userRole === "admin" ? (
            <AdminDashboard onSignOut={() => navigateTo("landing", 0)} />
          ) : (
            <Dashboard onSignOut={() => navigateTo("landing", 0)} />
          )}
        </>
      )}
    </MobileGuard>
  );
}
