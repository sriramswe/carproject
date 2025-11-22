import React, { Fragment, useContext } from "react";
import { Link } from "react-router-dom";
import { FavouriteContext } from "../Components/FavouriteContext";
import { useCarContext } from "../Components/CarContext";
import WatchlistButtons from "../Components/WatchListButtons"; // It's better to reuse the button component

export default function WatchList() {
  // ✅ Get the loading state from the FavouriteContext
  const { favourites, loading: favouritesLoading } = useContext(FavouriteContext);
  const { cars, loading: carsLoading } = useCarContext();

  // Filter favourite cars from the complete car list
  const favouriteCars = cars.filter((car) => favourites.includes(car.id));

  // Determine the overall loading state
  const isLoading = favouritesLoading || carsLoading;

  return (
    <Fragment>
      <main>
        <section>
          <div className="container">
            <h2>My Favourite Cars</h2>

            {isLoading ? (
              <p>Loading your favourite cars...</p>
            ) : favouriteCars.length === 0 ? (
              <p>You haven't added any cars to your watchlist yet.</p>
            ) : (
              <div className="car-items-listing">
                {favouriteCars.map((car) => (
                  <div className="car-item card" key={car.id}>
                    <Link to={`/view/${car.id}`}>
                      <img
                        src={car.images?.[0]?.imagePath || "/img/default-car.png"}
                        alt={`${car.model?.maker?.name} ${car.model?.model}`}
                        className="car-item-img rounded-t"
                      />
                    </Link>
                    <div className="p-medium">
                      <div className="flex items-center justify-between">
                        <small className="m-0 text-muted">
                          {car.city.name || "Unknown City"}
                        </small>
                        
                        {/* ✅ Best Practice: Reuse your WatchlistButtons component */}
                        <WatchlistButtons carId={car.id} />

                      </div>

                      <h2 className="car-item-title">
                        {car.year} - {car.model?.maker?.name} {car.model?.model}
                      </h2>
                      <p className="car-item-price">${car.price?.toLocaleString()}</p>
                      <hr />
                      <p className="m-0">
                        <span className="car-item-badge">{car.carType?.name}</span>
                        {/* Your existing logic to handle string or object is good */}
                        <span className="car-item-badge">{car.fuelType}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </Fragment>
  );
}