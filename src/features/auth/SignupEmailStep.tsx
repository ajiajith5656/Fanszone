import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth-flow.css";

type SignupEmailStepProps = {
  onSendCode: () => void;
  onBack: () => void;
};

export default function SignupEmailStep({
  onSendCode,
  onBack,
}: SignupEmailStepProps) {
  const { signupData, updateSignupData, setUserEmail } = useAuth();
  const [email, setEmail] = useState(signupData.email || "");
  const [password, setPassword] = useState(signupData.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Mock signup - UI only
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateSignupData({ email, password });
      setUserEmail(email);
      onSendCode();
    } catch (err: any) {
      setError("Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Add your email</h1>
      </header>

      <main className="flow-card">
        <div className="field-group">
          <label>EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>

        <div className="field-group">
          <label>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <p className="helper-text">
          We'll send a verification code to this email
        </p>

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
          Back
        </button>
      </main>
    </div>
  );
}
