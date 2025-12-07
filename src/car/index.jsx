import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCarContext } from "../Components/CarContext"; // Assuming this is the correct path
import IndexMain from "../Components/Index-Main";
import WatchlistButtons from "../Components/WatchListButtons";

export default function Index() {
  const [current, setCurrent] = useState(0);
  const totalSlides = 2;

  // Get car data and loading state from our global context
  

  // Effect for the hero image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 5000);
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <Fragment>
      {/* === Hero Slider Section === */}
      <section className="hero-slider">
        <div className="hero-slides">
          {current === 0 && (
            <div className="hero-slide">
              <div className="container">
                <div className="slide-content">
                  <h1 className="hero-slider-title">
                    Buy <strong>The Best Cars</strong> <br />
                    in your region
                  </h1>
                  <div className="hero-slider-content">
                    <p>
                      Use powerful search tool to find your desired cars based on
                      multiple search criteria: Maker, Model, Year, Price Range, Car
                      Type, etc...
                    </p>
                    <Link to="/search">
                    <button className="btn btn-hero-slider">Find the car</button>
                    </Link>
                  </div>
                </div>
                <div className="slide-image">
                  <img
                    src="/img/car-png-39071.png"
                    alt="Hero car"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          )}

          {current === 1 && (
            <div className="hero-slide">
              <div className="flex container">
                <div className="slide-content">
                  <h2 className="hero-slider-title">
                    Do you want to <br />
                    <strong>sell your car?</strong>
                  </h2>
                  <div className="hero-slider-content">
                    <p>
                      Submit your car in our user friendly interface, describe it,
                      upload photos and the perfect buyer will find it...
                    </p>
                    <Link to="/create">
                    <button className="btn btn-hero-slider">Add Your Car</button></Link>
                  </div>
                </div>
                <div className="slide-image">
                  <img
                    src="/img/car-png-39071.png"
                    alt="Hero car"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          )}

          <button type="button" className="hero-slide-prev" onClick={handlePrev}>
            <svg
              style={{ width: "18px" }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </button>
          
          {/* You might want a next button here as well */}
          <button type="button" className="hero-slide-next" onClick={handleNext}>
            <svg
              style={{ width: "18px" }}
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
          </button>
        </div>
      </section>
      <IndexMain />
    </Fragment>
  );
}