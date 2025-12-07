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
  makerName: "",
  modelName: "",
  year: "",
  carTypeName: "",
  price: "",
  mileage: "",
  fuelTypeName: "",
  stateName: "",
  cityName: "",
  description: "",
  phoneNo: "",
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

const validateForm = (data, images) => {
  const errors = {};

  if (!data.makerName) errors.makerName = "Maker is required.";
  if (!data.modelName) errors.modelName = "Model is required.";
  if (!data.year) errors.year = "Year is required.";
  if (!data.carTypeName) errors.carTypeName = "Car type required.";
  if (!data.fuelTypeName) errors.fuelTypeName = "Fuel type required.";
  if (!data.stateName) errors.stateName = "State required.";
  if (!data.cityName) errors.cityName = "City required.";

  if (!data.price || parseFloat(data.price) <= 0)
    errors.price = "Valid price required.";

  if (!data.mileage || parseInt(data.mileage) < 0)
    errors.mileage = "Valid mileage required.";

  if (!data.phoneno) errors.phoneno = "Phone required.";

  if (!data.description || data.description.length < 20)
    errors.description = "Description must be 20+ characters.";

  if (images.length === 0) errors.images = "At least 1 image required.";

  return errors;
};


export default function Create() {
   const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [carData, setCarData] = useState(initialCarState);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { makers, models, carTypes, fuelTypes, states, cities  } = useCarContext();

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
    setFormErrors(null);

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
      setFormErrors(err.message);
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
                <label>Maker</label>
                <input name="makerName" value={carData.makerName} onChange={handleChange}/>
              
              </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Model</label>
                       <input name="modelName" value={carData.modelName} onChange={handleChange}/>
                 
                {formErrors.modelName && <p className="error-message">{formErrors.modelName}</p>}
             
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>Year</label>
                      <select name="year" value={carData.year} onChange={handleChange} >
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
                      <input name="carTypeName" value={carData.carTypeName} onChange={handleChange}/>
              
              {formErrors.carTypeName && <p>{formErrors.carTypeName}</p>}
           </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label>State</label>
                      <select name="stateName" value={carData.stateName} onChange={handleChange} >
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label>City</label>
                       <input name="cityName" value={carData.cityName} onChange={handleChange}/>
                  
                {formErrors.cityName&& <p>{formErrors.cityName}</p>}
            
                    </div>
                  </div>
                  
                  <div className="col">
                      <div className="form-group">
                        <label htmlFor="">Mileage</label>
                        <input type="number" name="mileage" value={carData.mileage} onChange={handleChange} />
                        {formErrors.mileage && <p>{formErrors.mileage}</p>}
                      </div>
                  </div>
                  <div className="col">
                      <div className="form-group">
                        <label htmlFor="">Phone</label>
                        <input type="number" name="mileage" value={carData.phoneNo} onChange={handleChange} />
                        {formErrors.phone && <p>{formErrors.phoneNo}</p>}
                      </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                     <input name="fuelTypeName" value={carData.fuelTypeName} onChange={handleChange}/>
               
              {formErrors.fuelTypeName && <p>{formErrors.fuelTypeName}</p>}
            </div>
                 <div className="form-group">
              <label>Description</label>
              <textarea name="description" rows="5" value={carData.description} onChange={handleChange} />
              {formErrors.description && <p>{formErrors.description}</p>}
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
