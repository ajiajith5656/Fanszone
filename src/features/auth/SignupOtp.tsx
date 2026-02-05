import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth.service";
import "../../styles/auth-flow.css";

type SignupOtpProps = {
  onConfirm: () => void;
  onBack: () => void;
};

export default function SignupOtp({ onConfirm, onBack }: SignupOtpProps) {
  const { userEmail } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleConfirm = async () => {
    setError("");
    setSuccess(false);

    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setLoading(true);

    try {
      await authService.verifyEmail({ email: userEmail, code });
      setSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 1000);
    } catch (err: any) {
      if (err.code === "CodeMismatchException") {
        setError("Invalid code");
      } else if (err.code === "ExpiredCodeException") {
        setError("Code expired");
      } else if (err.code === "LimitExceededException") {
        setError("Too many attempts. Try again later");
      } else {
        setError(err.message || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError("");
    setLoading(true);

    try {
      await authService.resendCode(userEmail);
      setTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Verify your email</h1>
      </header>

      <main className="flow-card">
        <p className="helper-text">
          Enter the 6-digit code sent to {userEmail}
        </p>

        <div className="field-group">
          <label>VERIFICATION CODE</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
          />
        </div>

        {success && <p className="success-text">Email verified successfully</p>}
        {error && <p className="error-text">{error}</p>}

        <button
          className="primary-button"
          type="button"
          onClick={handleConfirm}
          disabled={loading || success}
        >
          {loading ? "Verifying..." : "Confirm"}
        </button>

        {!canResend ? (
          <p className="timer-text">
            You can resend a new code in {timer} seconds
          </p>
        ) : (
          <button
            className="ghost-button"
            type="button"
            onClick={handleResend}
            disabled={loading}
          >
            Resend code
          </button>
        )}

        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
      </main>
    </div>
  );
}
