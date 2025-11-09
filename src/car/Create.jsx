// Create.jsx — Fully updated to match backend CarCreateDTO
import React, { Fragment, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Components/AuthContext";
import { useCarContext } from "../Components/CarContext";

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year);
  }
  return years;
};

const initialCarState = {
  makerId: "",
  modelId: "",
  year: "",
  carTypeId: "",
  price: "",
  mileage: "",
  fuelType: "",
  stateId: "",
  cityId: "",
  description: "",
  phoneno: " ",
  features: {
    abs: false,
    airConditioning: false,
    powerWindows: false,
    cruiseControl: false,
    bluetoothConnectivity: false,
    gpsNavigation: false,
    heatedSeats: false,
    climateControl: false,
    rearParkingSensors: false,
    leatherSeats: false
  }
};
const validateForm = (data, imageFiles) => {
  const newErrors = {};

  // Text and Select fields
  if (!data.makerName) newErrors.makerName = "Maker is required.";
  if (!data.modelName) newErrors.modelName = "Model is required.";
  if (!data.year) newErrors.year = "Year is required.";
  if (!data.carTypeName) newErrors.carTypeName = "Car Type is required.";
  if (!data.fuelTypeName) newErrors.fuelTypeName = "Fuel Type is required.";
  if (!data.stateName) newErrors.stateName = "State is required.";
  if (!data.cityName) newErrors.cityName = "City is required.";

  // Price validation
  if (!data.price) {
    newErrors.price = "Price is required.";
  } else if (parseFloat(data.price) <= 0) {
    newErrors.price = "Price must be a positive number.";
  }

  // Mileage validation
  if (!data.mileage) {
    newErrors.mileage = "Mileage is required.";
  } else if (parseInt(data.mileage, 10) < 0) {
    newErrors.mileage = "Mileage cannot be negative.";
  }

  // Phone number validation (simple North American format)
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!data.phoneno) {
    newErrors.phoneno = "Phone number is required.";
  } else if (!phoneRegex.test(data.phoneno)) {
    newErrors.phoneno = "Please enter a valid phone number (e.g., 123-456-7890).";
  }

  // Description validation
  if (!data.description) {
    newErrors.description = "Description is required.";
  } else if (data.description.length < 20) {
    newErrors.description = "Description must be at least 20 characters long.";
  }

  // Image validation
  if (imageFiles.length === 0) {
    newErrors.images = "Please upload at least one image.";
  }

  return newErrors;
};


export default function Create() {
   const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [carData, setCarData] = useState(initialCarState);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { makers, models, carTypes, fuelTypes, states, cities } = useCarContext();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("feature_")) {
      const featureName = name.split("feature_")[1];
      setCarData(prev => ({
        ...prev,
        features: { ...prev.features, [featureName]: checked }
      }));
    } else {
      setCarData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    e.target.value = null;
  };

  const handleRemovePreviewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in to list a car.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const payload = {
      ...carData,
      year: parseInt(carData.year, 10),
      price: parseFloat(carData.price),
      mileage: parseInt(carData.mileage, 10),
    };

    try {
      const carRes = await fetch("http://localhost:8080/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (carRes.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }

      if (!carRes.ok) {
        const err = await carRes.json().catch(() => ({ message: "Failed to create car." }));
        throw new Error(err.message);
      }

      const newCar = await carRes.json();

      if (imageFiles.length > 0) {
        const uploadTasks = imageFiles.map(file => {
          const formData = new FormData();
          formData.append("file", file);
          return fetch(`http://localhost:8080/api/cars/${newCar.id}/images`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          });
        });
        await Promise.all(uploadTasks);
      }

      alert("Car listed successfully!");
      navigate(`/view/${newCar.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fragment>
      <main>
        <div className="container">
          <h1 className="car-details-page-title">List Your Car for Sale</h1>
          <form onSubmit={handleSubmit} className="card add-new-car-form">
            <div className="form-content">
              <div className="form-details">
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label>Maker</label>
                      <select name="makerId" value={carData.makerId} onChange={handleChange} required>
                        <option value="">Select Maker</option>
                        {makers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Model</label>
                      <select name="modelId" value={carData.modelId} onChange={handleChange} required>
                        <option value="">Select Model</option>
                        {models.filter(model => model.maker?.id === parseInt(carData.makerId)).map(model => (
                          <option key={model.id} value={model.id}>{model.name || model.model}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Year</label>
                      <select name="year" value={carData.year} onChange={handleChange} required>
                        <option value="">Year</option>
                        {generateYearOptions().map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Car Type</label>
                  <select name="carTypeId" value={carData.carTypeId} onChange={handleChange} required>
                    <option value="">Select Car Type</option>
                    {carTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                  </select>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label>State</label>
                      <select name="stateId" value={carData.stateId} onChange={handleChange} required>
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>City</label>
                      <select name="cityId" value={carData.cityId} onChange={handleChange} required>
                        <option value="">Select City</option>
                        {cities.filter(city => city.state?.id === parseInt(carData.stateId)).map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Phone.no</label>
                      <input type="text" name="phoneno" value={carData.phoneno} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select name="fuelType" value={carData.fuelType} onChange={handleChange} required>
                    <option value="">Select Fuel Type</option>
                    {fuelTypes.map(fuel => <option key={fuel.id} value={fuel.name}>{fuel.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={carData.description} onChange={handleChange} required rows="5"></textarea>
                </div>
                <div className="form-group">
                  <label>Features</label>
                  <div className="row">
                    {Object.keys(initialCarState.features).map(key => (
                      <div key={key} className="col">
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            name={`feature_${key}`}
                            checked={!!carData.features[key]}
                            onChange={handleChange}
                          />
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-images">
                <label className="form-group-label">Upload Images</label>
                <div className="car-form-images">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="car-form-image-preview">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() => handleRemovePreviewImage(index)}
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-image-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                  >+</button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                  accept="image/png, image/jpeg"
                  multiple
                />
              </div>
            </div>
            <div className="p-medium" style={{ width: "100%" }}>
              {error && <p className="error-message">{error}</p>}
              <div className="flex justify-end gap-1">
                <button type="button" className="btn btn-default" onClick={() => {
                  setCarData(initialCarState);
                  setImageFiles([]);
                  setImagePreviews([]);
                }}>Reset</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Car'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </Fragment>
  );
}
