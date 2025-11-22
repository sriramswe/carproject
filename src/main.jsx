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