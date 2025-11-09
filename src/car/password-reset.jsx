import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // You forgot this import

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:8080/api/password-reset/request", {
        email,
      });
      setMessage("✅ Reset email sent. Check your inbox.");
    } catch (err) {
      setError("❌ Failed to send reset email. Please check the email and try again.");
    }
  };

  return (
    <main>
      <div className="container-small page-login">
        <div className="flex" style={{ gap: "5rem" }}>
          <div className="auth-page-form">
            <div className="text-center">
              <a href="/">
                <img src="/img/logoipsum-265.svg" alt="Logo" />
              </a>
            </div>
            <h1 className="auth-page-title">Request Password Reset</h1>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary btn-login w-full">
                Request password reset
              </button>

              {message && <div className="alert alert-success mt-2">{message}</div>}
              {error && <div className="alert alert-danger mt-2">{error}</div>}

              <div className="login-text-dont-have-account">
                Already have an account? - <Link to="/login">Click here to login</Link>
              </div>
            </form>
          </div>

          <div className="auth-page-image">
            <img
              src="/img/car-png-39071.png"
              alt="Decorative car"
              className="img-responsive"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
