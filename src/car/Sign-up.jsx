import React, { Fragment, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import FGbutton from "../Components/FGbutton";

export default function Signup() {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Use a single error state

  const emailRef = useRef(null);
  const navigate = useNavigate();
  // const { login } = useAuth(); // Example: getting login function from context

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // --- Validation ---
    const { firstName, lastName, email, phone, password, repeatPassword } = formData;
    if (!firstName || !lastName || !email || !phone || !password || !repeatPassword) {
      setError("All fields are required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    // --- API SUBMISSION ---
    setLoading(true);

    const payload = {
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
      password: password,
    };

    try {
      const response = await fetch("http://localhost:8080/api/user/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If the backend returns a specific error message, use it
        throw new Error(responseData.message || "Registration failed. Please try again.");
      }
      
      // Registration successful
      alert("Registration successful! You will be redirected to the login page.");
      
      
      navigate("/"); // Redirect to login page

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <main>
        <div className="container-small page-login">
          <div className="flex" style={{ gap: "5rem" }}>
            <div className="auth-page-form">
              <div className="text-center">
                {/* ... Logo ... */}
              </div>
              <h1 className="auth-page-title">Create an Account</h1>

              <form onSubmit={handleSignup}>
                <div className="form-group">
                  <input name="firstName" type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <input name="lastName" type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <input name="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} ref={emailRef} required />
                </div>
                <div className="form-group">
                  <input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                </div>
                <hr />
                <div className="form-group">
                  <input name="password" type="password" placeholder="Your Password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <input name="repeatPassword" type="password" placeholder="Repeat Password" value={formData.repeatPassword} onChange={handleChange} required />
                </div>

               
                {error && (
                  <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-login w-full" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
                   <FGbutton/>
                <div className="login-text-dont-have-account">
                  Already have an account? – <Link to="/login">Click here to login</Link>
                </div>
              </form>
            </div>
            <div className="auth-page-image">
              <img src="/img/car-png-39071.png" alt="Signup" className="img-responsive"/>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}