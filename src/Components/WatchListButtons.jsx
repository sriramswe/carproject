import { useContext } from "react";
import { FavouriteContext } from "./FavouriteContext";

export default function WatchlistButtons({ carId }) {
  const { favourites, toggleFavourite } = useContext(FavouriteContext);
  const isFavourite = favourites.includes(carId);

  return (
    <div className="watchlist-buttons">
      {/* ❤️ Favourite Toggle Button */}
      <button
        type="button"
        onClick={() => toggleFavourite(carId)}
        className="btn-heart"
        title={isFavourite ? "Remove from Watchlist" : "Add to Watchlist"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isFavourite ? "red" : "none"}
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          style={{ width: "24px", height: "24px" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 
            0-3.597 1.126-4.312 2.733C11.285 4.876 
            9.623 3.75 7.687 3.75 5.1 3.75 3 
            5.765 3 8.25c0 7.22 9 12 9 
            12s9-4.78 9-12Z"
          />
        </svg>
      </button>

      {/* (Optional) Next Button - only include if needed */}
      {/* <button type="button" className="hero-slide-next" onClick={handleNext}>
        <svg
          style={{ width: "18px" }}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 9 4-4-4-4"
          />
        </svg>
        <span className="sr-only">Next</span>
      </button> */}
    </div>
  );
}
