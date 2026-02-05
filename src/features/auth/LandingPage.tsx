import "../../styles/landing.css";

type LandingPageProps = {
  onGetStarted: () => void;
};

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />

      <header className="landing-header">
        <div className="brand">Mallu Cupid</div>
        <button className="pill-button" type="button">
          Join the waitlist
        </button>
      </header>

      <main className="landing-content">
        <div className="hero">
          <span className="eyebrow">Creator-first social</span>
          <h1 className="headline">
            Build a paid community your fans will love.
          </h1>
          <p className="tagline">
            Launch your space, own your audience, and turn every post into
            revenue without ads.
          </p>

          <div className="cta-row">
            <button
              className="get-started"
              type="button"
              onClick={onGetStarted}
            >
              Get Started
            </button>
            <button className="ghost-button" type="button">
              Watch demo
            </button>
          </div>

          <div className="stat-row">
            <div>
              <strong>2 min</strong>
              <span>to set up</span>
            </div>
            <div>
              <strong>0%</strong>
              <span>ads</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>fan chat</span>
            </div>
          </div>
        </div>

        <section className="feature-grid">
          <article>
            <h3>Exclusive drops</h3>
            <p>Sell premium content, merch, and behind-the-scenes access.</p>
          </article>
          <article>
            <h3>Smart tips</h3>
            <p>Let fans support you with one-tap payments and bundles.</p>
          </article>
          <article>
            <h3>Secure payouts</h3>
            <p>Get paid fast with clear analytics and instant withdrawals.</p>
          </article>
        </section>
      </main>

      <footer className="landing-footer">
        <a href="#">Terms</a>
        <span>•</span>
        <a href="#">Privacy</a>
        <span>•</span>
        <a href="#">Policies</a>
      </footer>
    </div>
  );
}
