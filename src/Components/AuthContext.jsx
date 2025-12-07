import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from 'jwt-decode'; // A popular library to decode JWTs

// 1. Create the context
const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("jwt_token"));
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn("Token expired");
        logout();
        return;
      }

      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.sub,
        roles: decoded.roles || [],
      });
      localStorage.setItem("jwt_token", token);
    } catch (err) {
      console.error("Invalid token", err);
      logout();
    }
    } else {
      setUser(null);
      localStorage.removeItem("jwt_token");
    }
}, [token]);
  const login = (jwtToken) => {
    setToken(jwtToken);
    console.log(token);

    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  };

  const logout = () => {
    setToken(null);

    navigate("/login", { replace: true });
  };

  const value = {
    token,
    user, 
    isAuthenticated: !!token, 
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};