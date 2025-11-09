import React, { Fragment, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FavouriteContext } from "./FavouriteContext";
import { useCarContext } from "./CarContext";

export default function IndexMain() {
  const [filters, setFilters] = useState({
    maker_id: "", model_id: "", state_id: "", city_id: "",
    car_type_id: "", year_from: "", year_to: "",
    price_from: "", price_to: "", fuel_type_id: ""
  });

  const { favourites, toggleFavourite } = useContext(FavouriteContext);
  const {
    cars, loading,
    makers, models, states, cities, fuelTypes, carTypes,
  } = useCarContext();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "maker_id") updated.model_id = "";
      if (name === "state_id") updated.city_id = "";
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters({
      maker_id: "", model_id: "", state_id: "", city_id: "",
      car_type_id: "", year_from: "", year_to: "",
      price_from: "", price_to: "", fuel_type_id: ""
    });
    document.querySelector(".find-a-car-form")?.reset();
  };

  const filteredCars = cars.filter((car) => {
    if (filters.maker_id && String(car.model?.maker?.id) !== filters.maker_id) return false;
    if (filters.model_id && String(car.model?.id) !== filters.model_id) return false;
    if (filters.state_id && String(car.city?.state?.id) !== filters.state_id) return false;
    if (filters.city_id && String(car.city?.id) !== filters.city_id) return false;
    if (filters.car_type_id && String(car.carType?.id) !== filters.car_type_id) return false;
    if (filters.year_from && car.year < parseInt(filters.year_from, 10)) return false;
    if (filters.year_to && car.year > parseInt(filters.year_to, 10)) return false;
    if (filters.price_from && car.price < parseFloat(filters.price_from)) return false;
    if (filters.price_to && car.price > parseFloat(filters.price_to)) return false;
    if (filters.fuel_type_id && String(car.fuelType?.id) !== filters.fuel_type_id) return false;
    return true;
  });

  return (
    <Fragment>
      <main>
        {/* === Filter/Search Form === */}
        <section className="find-a-car">
          <div className="container">
            <form className="find-a-car-form card flex p-medium">
              <div className="find-a-car-inputs">
                {/* Maker & Model */}
                <div>
                  <select name="maker_id" value={filters.maker_id} onChange={handleFilterChange}>
                    <option value="">Maker</option>
                    {makers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select name="model_id" value={filters.model_id} onChange={handleFilterChange}>
                    <option value="">Model</option>
                    {models
                      .filter((model) => model.maker && String(model.maker.id) === filters.maker_id)
                      .map((model) => (
                        <option key={model.id} value={model.id}>{model.model}</option>
                      ))}
                  </select>
                </div>

                {/* State & City */}
                <div>
                  <select name="state_id" value={filters.state_id} onChange={handleFilterChange}>
                    <option value="">State</option>
                    {states.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                </div>
                <div>
                  <select name="city_id" value={filters.city_id} onChange={handleFilterChange}>
                    <option value="">City</option>
                    {cities
                      .filter((c) => c.state && String(c.state.id) === filters.state_id)
                      .map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>

                {/* Car Type, Year, Price */}
                <div>
                  <select name="car_type_id" value={filters.car_type_id} onChange={handleFilterChange}>
                    <option value="">Type</option>
                    {carTypes.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
                <div><input type="number" name="year_from" value={filters.year_from} onChange={handleFilterChange} placeholder="Year From" /></div>
                <div><input type="number" name="year_to" value={filters.year_to} onChange={handleFilterChange} placeholder="Year To" /></div>
                <div><input type="number" name="price_from" value={filters.price_from} onChange={handleFilterChange} placeholder="Price From" /></div>
                <div><input type="number" name="price_to" value={filters.price_to} onChange={handleFilterChange} placeholder="Price To" /></div>

                {/* Fuel Type */}
                <div>
                  <select name="fuel_type_id" value={filters.fuel_type_id} onChange={handleFilterChange}>
                    <option value="">Fuel Type</option>
                    {fuelTypes.map((fuel) => (<option key={fuel.id} value={fuel.id}>{fuel.name}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <button type="reset" className="btn btn-find-a-car-reset" onClick={resetFilters}>Reset</button>
                <button type="submit" className="btn btn-primary btn-find-a-car-submit">Search</button>
              </div>
            </form>
          </div>
        </section>

        {/* === Car Listings === */}
        <section>
          <div className="container">
            <h2>Latest Added Cars</h2>
            <div className="car-items-listing">
              {loading ? (
                <div className="alert alert-info">Loading cars...</div>
              ) : filteredCars.length === 0 ? (
                <div className="alert alert-warning">No cars match your filters.</div>
              ) : (
                filteredCars.map((car) => (
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
                        <small className="m-0 text-muted">{car.city?.name}</small>
                        <button
                          className={`btn-heart ${favourites.includes(car.id) ? "text-primary" : ""}`}
                          onClick={() => toggleFavourite(car.id)}
                        >
                          {favourites.includes(car.id) ? (
                            <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: "20px" }}>
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
                                2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 
                                2.09C13.09 3.81 14.76 3 16.5 3 
                                19.58 3 22 5.42 22 8.5c0 3.78-3.4 
                                6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          ) : (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: "20px" }}>
                              <path
                                d="M12.1 8.64l-.1.1-.11-.11C10.14 6.6 
                                  7.1 7.24 5.6 9.28c-1.5 2.04-0.44 
                                  5.12 3.4 8.36l2.1 1.92 2.1-1.92c3.84-3.24 
                                  4.9-6.32 3.4-8.36-1.5-2.04-4.54-2.68-6.39-0.64z"
                                strokeWidth="1.5"
                                stroke="currentColor"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                      <h2 className="car-item-title">{car.year} - {car.model?.maker?.name} {car.model?.model}</h2>
                      <p className="car-item-price">${car.price?.toLocaleString()}</p>
                      <hr />
                      <p className="m-0">
                        <span className="car-item-badge">{car.carType?.name}</span>
                        <span className="car-item-badge">{car.fuelType}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </Fragment>
  );
}
