import React, { Fragment, useState, useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCarContext } from "../Components/CarContext";
import { FavouriteContext } from "../Components/FavouriteContext";
import WatchlistButtons from "../Components/WatchListButtons";
import Pagination from "../Components/pagination";

export default function Search() {
  const {
    cars, loading, makers, models, states, cities, fuelTypes, carTypes
  } = useCarContext();

  const { favourites, toggleFavourite } = useContext(FavouriteContext);

  const formData = {
    maker: makers,
    models: models,
    carTypes: carTypes,
    state: states,
    city: cities,
    fuelType: fuelTypes
  };

  const isFormLoading = loading;

  const [filters, setFilters] = useState({
    maker_id: "", model_id: "", car_type_id: "",
    year_from: "", year_to: "", price_from: "", price_to: "",
    state_id: "", city_id: "", fuel_type_id: "",
  });

  const [sortOrder, setSortOrder] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 20;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === "maker_id") newFilters.model_id = "";
      if (name === "state_id") newFilters.city_id = "";
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters({
      maker_id: "", model_id: "", car_type_id: "",
      year_from: "", year_to: "", price_from: "", price_to: "",
      state_id: "", city_id: "", fuel_type_id: "",
    });
    document.querySelector(".find-a-car-form").reset();
  };

  const filteredCars = useMemo(() => {
    let results = cars.filter((car) => {
      if (filters.maker_id && String(car.model?.maker?.id) !== filters.maker_id) return false;
      if (filters.model_id && String(car.model?.id) !== filters.model_id) return false;
      if (filters.car_type_id && String(car.carType?.id) !== filters.car_type_id) return false;
      if (filters.year_from && car.year < parseInt(filters.year_from, 10)) return false;
      if (filters.year_to && car.year > parseInt(filters.year_to, 10)) return false;
      if (filters.price_from && car.price < parseInt(filters.price_from, 10)) return false;
      if (filters.price_to && car.price > parseInt(filters.price_to, 10)) return false;
      if (filters.state_id && String(car.city?.state?.id) !== filters.state_id) return false;
      if (filters.city_id && String(car.city?.id) !== filters.city_id) return false;
      if (filters.fuel_type_id && String(car.fuelType?.id) !== filters.fuel_type_id) return false;
      return true;
    });

    if (sortOrder === "price_asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price_desc") {
      results.sort((a, b) => b.price - a.price);
    }

    return results;
  }, [cars, filters, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOrder]);

  const totalPages = Math.ceil(filteredCars.length / carsPerPage);
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    return filteredCars.slice(startIndex, endIndex);
  }, [filteredCars, currentPage]);

  return (
    <Fragment>
      <main>
        <section>
          <div className="container">
            <div className="sm:flex items-center justify-between mb-medium">
              <div className="flex items-center">
                <button 
                  className="show-filters-button flex items-center"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  Filters
                </button>
                <h2>Found {filteredCars.length} Cars</h2>
              </div>
              <select 
                className="sort-dropdown"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Order By</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div className="search-car-results-wrapper">
              <div className={`search-cars-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="card card-found-cars">
                  <p className="m-0">Found <strong>{filteredCars.length}</strong> cars</p>
                  <button className="close-filters-button" onClick={() => setIsSidebarOpen(false)}>✕</button>
                </div>

                <section className="find-a-car">
                  <form className="find-a-car-form card flex p-medium">
                    <div className="find-a-car-inputs">
                      <div className="form-group">
                        <label>Maker</label>
                        <select name="maker_id" value={filters.maker_id} onChange={handleFilterChange} disabled={isFormLoading}>
                          <option value="">All Makers</option>
                          {formData.maker.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Model</label>
                        <select name="model_id" value={filters.model_id} onChange={handleFilterChange} disabled={!filters.maker_id}>
                          <option value="">All Models</option>
                          {formData.models
                            .filter(m => String(m.maker?.id) === filters.maker_id)
                            .map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Car Type</label>
                        <select name="car_type_id" value={filters.car_type_id} onChange={handleFilterChange}>
                          <option value="">All Types</option>
                          {formData.carTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Year From</label>
                        <input type="number" name="year_from" value={filters.year_from} onChange={handleFilterChange} />
                      </div>

                      <div className="form-group">
                        <label>Year To</label>
                        <input type="number" name="year_to" value={filters.year_to} onChange={handleFilterChange} />
                      </div>

                      <div className="form-group">
                        <label>Price From</label>
                        <input type="number" name="price_from" value={filters.price_from} onChange={handleFilterChange} />
                      </div>

                      <div className="form-group">
                        <label>Price To</label>
                        <input type="number" name="price_to" value={filters.price_to} onChange={handleFilterChange} />
                      </div>

                      <div className="form-group">
                        <label>State</label>
                        <select name="state_id" value={filters.state_id} onChange={handleFilterChange}>
                          <option value="">All States</option>
                          {formData.state.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>City</label>
                        <select name="city_id" value={filters.city_id} onChange={handleFilterChange} disabled={!filters.state_id}>
                          <option value="">All Cities</option>
                          {formData.city
                            .filter(c => String(c.state?.id) === filters.state_id)
                            .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Fuel Type</label>
                        <select name="fuel_type_id" value={filters.fuel_type_id} onChange={handleFilterChange}>
                          <option value="">All Fuel Types</option>
                          {formData.fuelType.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex">
                      <button type="button" className="btn btn-find-a-car-reset" onClick={resetFilters}>Reset</button>
                    </div>
                  </form>
                </section>
              </div>

              <div className="search-cars-results">
                {loading ? (
                  <div className="alert alert-info">Loading...</div>
                ) : paginatedCars.length === 0 ? (
                  <div className="alert alert-warning">No cars match your search criteria.</div>
                ) : (
                  <div className="car-items-listing">
                    {paginatedCars.map(car => (
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
                            <small className="text-muted">{car.city?.name}</small>
                            <WatchlistButtons carId={car.id} />
                          </div>
                          <h2>{car.year} - {car.model?.maker?.name} {car.model?.model}</h2>
                          <p className="car-item-price">${car.price?.toLocaleString()}</p>
                          <hr />
                          <p className="m-0">
                            <span className="car-item-badge">{car.carType?.name}</span>
                            <span className="car-item-badge">{car.fuelType}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </main>
    </Fragment>
  );
}
