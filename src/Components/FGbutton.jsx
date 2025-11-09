import React, { Fragment } from "react";
import { Link } from "react-router-dom";

// These are the URLs that Spring Security's OAuth2 client library automatically creates.
// Clicking them will initiate the social login flow.
const GOOGLE_AUTH_URL = "http://localhost:8080/oauth2/authorization/google";
const FACEBOOK_AUTH_URL = "http://localhost:8080/oauth2/authorization/facebook";

export default function FGbutton() {
  return (
    <Fragment>
      <div className="grid grid-cols-2 gap-1  social-auth-buttons">
        {/* ✅ FIX 1: Changed <button> to <a> tag with an href */}
        <Link 
          to={GOOGLE_AUTH_URL} 
          className="btn btn-default flex justify-center items-center gap-1"
        >
          <img
            src="/img/google.png"
            alt="Google logo"
            style={{ width: "20px" }}
          />
          Google
        </Link>

        {/* ✅ FIX 2: Changed <button> to <a> tag with an href */}
        <Link
          href={FACEBOOK_AUTH_URL} 
          className="btn btn-default flex justify-center items-center gap-1"
        >
          <img
            src="/img/facebook.png"
            alt="Facebook logo"
            style={{ width: "20px" }}
          />
          Facebook
        </Link>
      </div>
    </Fragment>
  );
}