import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useAuth } from "./AuthContext"; 

export const FavouriteContext = createContext({
  favourites: [],
  toggleFavourite: () => {},
  loading: false,
});


export const useFavourites = () => useContext(FavouriteContext);

export const FavouriteProvider = ({ children }) => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const { isAuthenticated, token } = useAuth();


  useEffect(() => {
    
    const fetchInitialFavourites = async () => {
      setLoading(true);
      try {

        const res = await fetch(`http://localhost:8080/api/watchlist`, {
          headers: {

            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Could not fetch user's watchlist");
        
        const data = await res.json();
        setFavourites(data);
        
      } catch (err) {
        console.error("Error fetching initial favourites:", err);
 
        setFavourites([]);
      } finally {
        setLoading(false);
      }
    };


    if (isAuthenticated) {
      fetchInitialFavourites();
    } else {

      setFavourites([]);
    }
  }, [isAuthenticated, token]); 
  const toggleFavourite = useCallback(async (carId) => {

    if (!isAuthenticated) {
      console.error("User is not authenticated. Cannot toggle favourite.");

      return;
    }

    const isFavourite = favourites.includes(carId);
    

    setFavourites(prev => isFavourite ? prev.filter(id => id !== carId) : [...prev, carId]);

    try {

      const url = isFavourite 
        ? `http://localhost:8080/api/watchlist/${carId}`
        : `http://localhost:8080/api/watchlist`;       
      
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
