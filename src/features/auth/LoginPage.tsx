import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/login.css";

type LoginPageProps = {
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onSuccess: () => void;
};

export default function LoginPage({
  onForgotPassword,
  onCreateAccount,
  onSuccess,
}: LoginPageProps) {
  const { setIsAuthenticated, setUserEmail, setUserRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      // Mock authentication - UI only
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set default user role
      setUserRole('user');
      setIsAuthenticated(true);
      setUserEmail(email);
      onSuccess();
    } catch (err: any) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <main className="login-card">
        <div className="login-title">
          <h1>Welcome back</h1>
          <p>Sign in to continue</p>
        </div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            className="link-button"
            type="button"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>

          {error && <p className="error-text">{error}</p>}

          <button
            className="primary-button"
            type="button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="signup">
            <span>Don't have an account?</span>
            <button
              className="ghost-button"
              type="button"
              onClick={onCreateAccount}
            >
              Create new account
            </button>
          </div>
        </form>
      </main>

      <footer className="login-footer">
        <p>By logging in, you agree to our</p>
        <div>
          <a href="#">Terms</a>
          <span>•</span>
          <a href="#">Privacy Policy</a>
          <span>•</span>
          <a href="#">Community Guidelines</a>
        </div>
      </footer>
    </div>
  );
}
