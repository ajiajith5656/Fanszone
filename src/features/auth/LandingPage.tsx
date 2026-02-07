import { useState } from "react";
import "../../styles/landing.css";

type LandingPageProps = {
  onGetStarted: () => void;
};

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      onGetStarted();
    }, 800);
  };

  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />

      <header className="landing-header">
        <div className="brand">Mallu Cupid</div>
      </header>

      <main className="landing-content">
        <div className="hero-centered">
          <h1 className="headline-centered">
            Find meaningful connections with verified people
          </h1>
          
          <button
            className="get-started-centered"
            type="button"
            onClick={handleGetStarted}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-button"></div>
            ) : (
              "Get Started"
            )}
          </button>
        </div>
      </main>

      <footer className="landing-footer">
        <a href="#">Terms</a>
        <span>•</span>
        <a href="#">Privacy</a>
        <span>•</span>
        <a href="#">Safety</a>
        <span>•</span>
        <a href="#">Guidelines</a>
      </footer>
    </div>
  );
}
