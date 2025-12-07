// in pages/PasswordResetConfirm.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function PasswordResetConfirm() {
  const { token } = useParams(); // Get token from the URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/password-reset/confirm",
        { token, newPassword: password },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("✅ Password has been reset successfully! You can now log in.");
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(err.response?.data || "❌ Failed to reset password. The link may be invalid or expired.");
    }
  };

  return (
    <main>
      <div className="container-small page-login">
        <div className="auth-page-form">
          <h1 className="auth-page-title">Set Your New Password</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary btn-login w-full">
              Reset Password
            </button>

            {message && <div className="alert alert-success mt-2">{message}</div>}
            {error && <div className="alert alert-danger mt-2">{error}</div>}
            {message && <div className="login-text-dont-have-account"><Link to="/login">Click here to login</Link></div>}
          </form>
        </div>
      </div>
    </main>
  );
}