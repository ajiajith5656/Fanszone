import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth-flow.css";

type SignupStepOneProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function SignupStepOne({ onNext, onBack }: SignupStepOneProps) {
  const { signupData, updateSignupData } = useAuth();
  const [name, setName] = useState(signupData.name || "");
  const [dateOfBirth, setDateOfBirth] = useState(signupData.dateOfBirth || "");
  const [gender, setGender] = useState(signupData.gender || "");
  const [error, setError] = useState("");

  const handleNext = () => {
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
      setError("You must be at least 18 years old to continue");
      return;
    }

    if (!gender) {
      setError("Please select your gender");
      return;
    }

    updateSignupData({ name, dateOfBirth, gender });
    onNext();
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

        <p className="helper-text">You must be 18 or older to use MalluCupid</p>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button" type="button" onClick={handleNext}>
          Next
        </button>
        <button className="secondary-button" type="button" onClick={onBack}>
          Back
        </button>
      </main>
    </div>
  );
}
