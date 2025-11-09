import React, { Fragment, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

    
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  // Effect to close any open menus when the user navigates to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountDropdownOpen(false);
  }, [location]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <Fragment>
      {/* Overlay for closing menus when clicking outside */}
      {(isMobileMenuOpen || isAccountDropdownOpen) && (
        <div 
          className="menu-overlay" 
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsAccountDropdownOpen(false);
          }}
        />
      )}

      <header className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo-wrapper">
            <img src="/img/logoipsum-265.svg" alt="Logo" />
          </Link>

          {/* Hamburger button for mobile */}

{!isMobileMenuOpen ? (
  <button
    className="btn btn-default btn-navbar-toggle"
    onClick={() => setIsMobileMenuOpen(true)}
  >
    {/* Hamburger Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth="1.5" stroke="currentColor" style={{ width: "24px" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  </button>
) : (
  <button
    className="btn btn-default btn-navbar-toggle"
    onClick={() => setIsMobileMenuOpen(false)}
  >
    {/* Close (Cancel) Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      strokeWidth="1.5" stroke="currentColor" style={{ width: "24px" }}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12" />
    </svg>
  </button>
)}



          {/* Main navigation container / mobile slide-out menu */}
          <div className={`navbar-auth ${isMobileMenuOpen ? 'open' : ''}`}>
            {/* Close button - ONLY visible on mobile inside the open menu */}
            <button className="btn btn-default btn-close-menu" onClick={() => setIsMobileMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '24px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            
            
            {isAuthenticated ? (
              <>
              <Link to="/search" className="btn btn-primary btn-search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "18px", marginRight: "4px" }}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              Find Car
            </Link>
                <Link to="/create" className="btn btn-add-new-car">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "18px", marginRight: "4px" }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  Add Car
                </Link>
                <div 
                  className={`navbar-menu ${isAccountDropdownOpen ? 'open' : ''}`}
                  onMouseEnter={() => setIsAccountDropdownOpen(true)}
                  onMouseLeave={() => setIsAccountDropdownOpen(false)}
                >
                  <button type="button" className="navbar-menu-handler">
                    {user?.name? `Hi, ${user.name.split(' ')[0]}` : 'My Account'}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "20px" }}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  <ul className="submenu">
                    <li><Link to="/mycar">My Cars</Link></li>
                    <li><Link to="/watchlist">Watchlist</Link></li>
                    <li><Link to="/profile">Profile</Link></li>
                    <li><hr/></li>
                    <li>
                      <form onSubmit={handleLogout}>
                        <button type="submit" className="logout-button">Logout</button>
                      </form>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-signup">
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-login">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </Fragment>
  );
}