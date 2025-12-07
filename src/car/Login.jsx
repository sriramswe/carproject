import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import FGbutton from '../Components/FGbutton'; // Assuming this is your social login button component
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State to hold the form input values
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State to hold validation errors for each field
  const [errors, setErrors] = useState({});
  
  // State for loading and general API errors
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // This effect checks if there's an error passed from the redirect handler
  useEffect(() => {
    if (location.state?.error) {
        setApiError(location.state.error);
    }
  }, [location]);

  // --- Manual Validation Logic ---
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email address is invalid.';
        break;
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        break;
      default:
        break;
    }
    return ''; // No error
  };

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handler for when a user clicks out of an input field (onBlur)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // --- Form Submission ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Validate all fields before submitting
    const validationErrors = {};
    Object.keys(formData).forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) {
        validationErrors[name] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submission if there are errors
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Login failed. Please check your credentials.');
      }

      if (responseData.token) {
        login(responseData.token); // Call context login function on success
      } else {
        throw new Error("Login response did not include a token.");
      }

    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if the form is valid to enable/disable the submit button
  const isFormValid = formData.email && formData.password && !errors.email && !errors.password;

  return (
    <main>
      <div className="container-small">
        <h1 className="text-center">Login</h1>
        <p className="text-center">Welcome back! Please enter your details.</p>

        <form onSubmit={handleLoginSubmit} className="card add-new-car-form" noValidate>
          <div className="p-large">
            {apiError && (
              <div className="alert alert-danger" role="alert">
                {apiError}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur} // Validate when user leaves the field
           
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur} // Validate when user leaves the field
              />
              
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            
            <div className="form-group flex items-center justify-between">
              <Link to="/password-reset/confirm/:token" className="text-primary">Forgot password?</Link>
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={loading || !isFormValid}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
             <br />
     
            <FGbutton />
            
            <div className="text-center mt-medium">
              Don't have an account? <Link to="/signup" className="text-primary">Sign up</Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}