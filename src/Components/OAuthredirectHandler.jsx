import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // If a token is found, call the login function from the context
      login(token);
    } else {

      navigate('/login', { state: { error: 'OAuth2 login failed. Please try again.' } });
    }
  }, [searchParams, login, navigate]);

  // Display a simple loading message while the redirect is being processed
  return (
    <div className="container py-4">
      <h2>Loading...</h2>
      <p>Please wait while we log you in.</p>
    </div>
  );
};

export default OAuth2RedirectHandler;