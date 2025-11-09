import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useAuth } from "./AuthContext"; // Import your custom auth hook

// Create the context with a default shape
export const FavouriteContext = createContext({
  favourites: [],
  toggleFavourite: () => {},
  loading: false,
});

// A custom hook for easy consumption of this context
export const useFavourites = () => useContext(FavouriteContext);

export const FavouriteProvider = ({ children }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get the authentication state and token from the AuthContext
  const { isAuthenticated, token } = useAuth();

  // This effect fetches the user's watchlist when they log in,
  // and clears it when they log out.
  useEffect(() => {
    // Define the async function inside the effect
    const fetchInitialFavourites = async () => {
      setLoading(true);
      try {
        // ✅ The URL is now simpler and more secure: /api/watchlist
        const res = await fetch(`http://localhost:8080/api/watchlist`, {
          headers: {
            // ✅ Attach the JWT to the request header for authentication
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Could not fetch user's watchlist");
        
        const data = await res.json();
        setFavourites(data);
        
      } catch (err) {
        console.error("Error fetching initial favourites:", err);
        // Don't show old data on error
        setFavourites([]);
      } finally {
        setLoading(false);
      }
    };

    // Only run the fetch call if the user is authenticated
    if (isAuthenticated) {
      fetchInitialFavourites();
    } else {
      // If user is not authenticated (or logs out), clear the favourites list
      setFavourites([]);
    }
  }, [isAuthenticated, token]); // Dependency array ensures this re-runs on login/logout

  // This function adds or removes a car from the user's watchlist
  const toggleFavourite = useCallback(async (carId) => {
    // Guard clause: Do nothing if the user is not logged in
    if (!isAuthenticated) {
      console.error("User is not authenticated. Cannot toggle favourite.");
      // Optional: you could navigate to the login page here
      return;
    }

    const isFavourite = favourites.includes(carId);
    
    // Optimistic UI update for instant feedback
    setFavourites(prev => isFavourite ? prev.filter(id => id !== carId) : [...prev, carId]);

    try {
      // ✅ Determine the correct secure URL and method
      const url = isFavourite 
        ? `http://localhost:8080/api/watchlist/${carId}` // URL for DELETE
        : `http://localhost:8080/api/watchlist`;       // URL for POST
      
      const options = {
        method: isFavourite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isFavourite ? null : JSON.stringify({ carId }),
      };
      
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("API request to toggle favourite failed");
      
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
      // If the API call fails, revert the UI state back to what it was
      setFavourites(prev => isFavourite ? [...prev, carId] : prev.filter(id => id !== carId));
    }
  }, [favourites, isAuthenticated, token]);

  const value = { favourites, toggleFavourite, loading };

  return (
    <FavouriteContext.Provider value={value}>
      {children}
    </FavouriteContext.Provider>
  );
};
