import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth-flow.css";

type SignupStepOneProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function SignupStepOne({ onNext, onBack }: SignupStepOneProps) {
  const { updateSignupData, setUserEmail } = useAuth();
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 30) return "Password must not exceed 30 characters";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    return null;
  };

  const handleSignup = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }

    // Validate age
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 18) {
      setError("Under 18 not permitted");
      return;
    }

    if (!gender) {
      setError("Please select your gender");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("Accept our terms & policies");
      return;
    }

    setLoading(true);

    try {
      // Mock signup - UI only
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateSignupData({ name, dateOfBirth, gender, email, password });
      setUserEmail(email);
      onNext();
    } catch (err: any) {
      setError("Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Create your account</h1>
      </header>

      <main className="flow-card">
        <div className="field-group">
          <label>FULL NAME</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="field-group">
          <label>DATE OF BIRTH</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>GENDER</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>
        </div>

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
            placeholder="8-30 characters, A-z"
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

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <label htmlFor="terms">
            I accept the <a href="#">Terms & Policies</a>
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button 
          className="primary-button" 
          type="button" 
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
      </main>
    </div>
  );
}
