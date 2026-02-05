import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth-flow.css";

type LookingForStepProps = {
  onNext: () => void;
  onBack: () => void;
};

export default function LookingForStep({ onNext, onBack }: LookingForStepProps) {
  const { signupData, updateSignupData } = useAuth();
  const [lookingFor, setLookingFor] = useState(signupData.lookingFor || "");
  const [relationshipType, setRelationshipType] = useState(
    signupData.relationshipType || ""
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    signupData.interests || []
  );
  const [error, setError] = useState("");

  const interestOptions = [
    "Travel",
    "Music",
    "Movies",
    "Sports",
    "Reading",
    "Gaming",
    "Cooking",
    "Photography",
    "Art",
    "Fitness",
    "Dancing",
    "Pets",
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    setError("");

    if (!lookingFor) {
      setError("Please select who you're looking for");
      return;
    }

    if (!relationshipType) {
      setError("Please select relationship type");
      return;
    }

    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests");
      return;
    }

    updateSignupData({
      lookingFor,
      relationshipType,
      interests: selectedInterests,
    });
    onNext();
  };

  return (
    <div className="flow-screen">
      <header className="flow-header">
        <h1>Tell us about you</h1>
      </header>

      <main className="flow-card">
        <div className="field-group">
          <label>LOOKING FOR</label>
          <select
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
          >
            <option value="">Select</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="everyone">Everyone</option>
          </select>
        </div>

        <div className="field-group">
          <label>RELATIONSHIP TYPE</label>
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
          >
            <option value="">Select</option>
            <option value="longterm">Long-term relationship</option>
            <option value="shortterm">Short-term relationship</option>
            <option value="friendship">Friendship</option>
            <option value="casual">Casual dating</option>
          </select>
        </div>

        <div className="field-group">
          <label>INTERESTS (Select at least 3)</label>
          <div className="interest-grid">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`interest-chip ${
                  selectedInterests.includes(interest) ? "active" : ""
                }`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

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
