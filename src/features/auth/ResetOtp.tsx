import { useState } from "react";
import "../../styles/auth-flow.css";

type ResetOtpProps = {
  email: string;
  onConfirm: (code: string) => void;
  onBack: () => void;
};

export default function ResetOtp({ email, onConfirm, onBack }: ResetOtpProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    setError("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    onConfirm(code);
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Verify reset code</h1>
      </header>

      <main className="flow-card">
        <p className="helper-text">
          Enter the 6-digit code sent to {email}
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

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" type="button" onClick={handleConfirm}>
          Confirm
        </button>

        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
      </main>
    </div>
  );
}
