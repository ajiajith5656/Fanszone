import { useState } from "react";
import { authService } from "../../services/auth.service";
import "../../styles/auth-flow.css";

type ResetStepOneProps = {
  onSendCode: (email: string) => void;
  onBack: () => void;
};

export default function ResetStepOne({ onSendCode, onBack }: ResetStepOneProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSendCode = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);
      onSendCode(email);
    } catch (err: any) {
      if (err.code === "UserNotFoundException") {
        setError("Email not found");
      } else {
        setError(err.message || "Failed to send code");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Reset access</h1>
      </header>

      <main className="flow-card">
        <p className="helper-text">
          Enter your email to receive a verification code
        </p>

        <div className="field-group">
          <label>EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          className="primary-button"
          type="button"
          onClick={handleSendCode}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send code"}
        </button>

        <button className="secondary-button" type="button" onClick={onBack}>
          Back to login
        </button>
      </main>
    </div>
  );
}
