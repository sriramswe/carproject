import React, { Fragment, useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import WatchlistButtons from "../Components/WatchListButtons";
import { FavouriteContext } from "../Components/FavouriteContext";
import { useCarContext } from "../Components/CarContext";

export default function View() {
  const { id } = useParams();
  const carId = parseInt(id);

  
  const { cars, loading: carsLoading } = useCarContext();

  // Find the car ONLY after the context has finished loading
  const car = !carsLoading ? cars.find((c) => c.id === carId) : null;

  // Local state for the image carousel
  const [activeIndex, setActiveIndex] = useState(0);

  // Memoize the image array to prevent re-calculation on every render
  const carImages = React.useMemo(() => {
    return car?.images?.map((img) => img.imagePath) || [];
  }, [car]);

  // Reset activeIndex if the car (and its images) change
  useEffect(() => {
    setActiveIndex(0);
  }, [car]);

  const handleNext = () => {
    if (carImages.length > 0) {
      setActiveIndex((prevIndex) => (prevIndex + 1) % carImages.length);
    }
  };

  const handlePrev = () => {
    if (carImages.length > 0) {
      setActiveIndex(
        (prevIndex) => (prevIndex - 1 + carImages.length) % carImages.length
      );
    }
  };

  // --- Render Logic ---

  // 1. Show a loading message while the context is fetching the car list
  if (carsLoading) {
    return <div className="container py-4">Loading car details...</div>;
  }

  // 2. After loading, if the car is still not found, show an error
  if (!car) {
    return (
      <div className="container py-4">
        <h2>Car Not Found</h2>
        <p>The car you are looking for does not exist in our records.</p>
        <Link to="/" className="btn btn-primary">Go to Homepage</Link>
      </div>
    );
  }

  // 3. If loading is done and the car is found, render the page
  return (
    <Fragment>
      <main>
        <div className="container">
          <h1 className="car-details-page-title">
            {/* ✅ FIX: Correctly access DTO properties */}
            {car.model?.maker.name} - {car.model?.model} - {car.year}
          </h1>
          <div className="car-details-region">
            {/* ✅ FIX: Access cityName from DTO */}
            {car.city.name}, {car.model?.model} {/* Assuming state isn't in DTO, using maker as placeholder */}
          </div>

          <div className="car-details-content">
            <div className="car-images-and-description">
              <div className="car-images-carousel">
                <div className="car-image-wrapper">
                  <img
                    src={carImages.length > 0 ? carImages[activeIndex] : "/img/default-car.png"}
                    alt={`Car ${activeIndex + 1}`}
                    className="car-active-image"
                  />
                </div>
                {carImages.length > 1 && (
                  <>
                    <div className="car-image-thumbnails">
                      {carImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className={index === activeIndex ? "active-thumbnail" : ""}
                          onClick={() => setActiveIndex(index)}
                        />
                      ))}
                    </div>
                    <button className="carousel-button prev-button" onClick={handlePrev}>&lt;</button>
                    <button className="carousel-button next-button" onClick={handleNext}>&gt;</button>
                  </>
                )}
              </div>

              <div className="card car-detailed-description">
                <h2 className="car-details-title">Detailed Description</h2>
                <p>{car.description || "No description provided."}</p>
              </div>

           <div className="card car-detailed-description">
  <h2 className="car-details-title">Car Features</h2>
  <ul className="car-specifications">
    {car.features &&
      Object.entries(car.features).map(([featureName, hasFeature]) => (
        <li key={featureName}>
          {hasFeature ? "✅" : "❌"}{" "}
          {featureName
            .replace(/([A-Z])/g, " $1") // add space before capital letters
            .replace(/^./, (str) => str.toUpperCase())} {/* capitalize first letter */}
        </li>
      ))}
  </ul>
</div>

            </div>

            <div className="car-details card">
              <div className="flex items-center justify-between">
                <p className="car-details-price">${car.price?.toLocaleString()}</p>
                <WatchlistButtons carId={car.id} />
              </div>

              <hr />
              <table className="car-details-table">
                <tbody>
                  <tr><th>Maker</th><td>{car.model?.maker?.name}</td></tr>
                  <tr><th>Model</th><td>{car.model?.model}</td></tr>
                  <tr><th>Year</th><td>{car.year}</td></tr>
                  {/* <tr><th>Car Type</th><td>{car.carType?.name}</td></tr> This isn't in the DTO */}
                  <tr><th>Fuel Type</th><td>{car.fuelType}</td></tr>
                </tbody>
              </table>

              <hr />
              <div className="flex gap-1 my-medium">
                <img src="/img/avatar.png" alt="Owner" className="car-details-owner-image" />
                <div>
                  {/* ✅ FIX: Access ownerName from DTO */}
                  <h3 className="car-details-owner">{car.owner?.username|| "Unknown Owner"}</h3>
                  <div className="text-muted">{car.owner?.carCount || 0} cars</div> 
                </div>
              </div>

              <span className="car-details-phone text-center text-muted">Phone.no:{car.owner?.phone}</span>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}