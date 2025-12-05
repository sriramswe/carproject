// Polyfills for libs that expect Node globals in the browser
// Some packages (e.g. sockjs-client) reference `global` which isn't
// defined in browsers. Provide a minimal shim before other imports.
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  // align `global` to `window` so older libs continue to work
  // eslint-disable-next-line no-undef
  window.global = window;
  // minimal `process.env` fallback if a lib checks it
  window.process = window.process || { env: {} };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// The FavouriteProvider has been moved to App.jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Just render the App component. All providers will be inside it. */}
    <App />
  </React.StrictMode>
);