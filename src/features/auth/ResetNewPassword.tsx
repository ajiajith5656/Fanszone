import { useState } from "react";
import { authService } from "../../services/auth.service";
import "../../styles/auth-flow.css";

type ResetNewPasswordProps = {
  email: string;
  code: string;
  onComplete: () => void;
  onBack: () => void;
};

export default function ResetNewPassword({
  email,
  code,
  onComplete,
  onBack,
}: ResetNewPasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authService.confirmPassword({ email, code, newPassword });
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Create new password</h1>
      </header>

      <main className="flow-card">
        <p className="helper-text">
          Choose a strong password for your account
        </p>

        <div className="field-group">
          <label>NEW PASSWORD</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div className="field-group">
          <label>CONFIRM PASSWORD</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          className="primary-button"
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>

        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
      </main>
    </div>
  );
}
