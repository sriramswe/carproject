import React, { Fragment, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCarContext } from "../Components/CarContext";
import { useAuth } from "../Components/AuthContext";

const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1990; year--) { years.push(year); }
    return years;
};

// This is the shape of our state, matching the CarCreateDTO
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
    phoneno: "",
    features: {}
};

export default function Edit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCarById } = useCarContext();
    const { token } = useAuth();
    const fileInputRef = useRef(null);

    const [carData, setCarData] = useState(initialCarState); // Use a consistent initial state
    const [carImages, setCarImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const carId = parseInt(id);
        if (isNaN(carId)) {
            setError("Invalid Car ID."); setLoading(false); return;
        }
        const loadCar = async () => {
            setLoading(true);
            const data = await getCarById(carId);
            if (data) {
                // Map the fetched data to our consistent state shape
                setCarData({
                    makerName: data.model.maker.name || "",
                    modelName: data.model.model || "",
                    year: data.year || "",
                    carTypeName: data.carType.name || "",
                    price: data.price || "",
                    mileage: data.mileage || "",
                    fuelTypeName: data.fuelType|| "",
                    stateName: data.city.state.name || "",
                    cityName: data.city.name || "",
                    description: data.description || "",
                    phoneNo: data.owner.phone || "", // Standardized to 'phoneno'
                    features: data.features || {}
                });
                // The images have their own DTO shape, which is fine
                setCarImages(data.imageUrls ? data.imageUrls.map((url, i) => ({ id: i, url })) : []);
            } else {
                setError("Car not found.");
            }
            setLoading(false);
        };
        loadCar();
    }, [id, getCarById]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith("feature_")) {
            const featureName = name.split("feature_")[1];
            setCarData(prev => ({ ...prev, features: { ...prev.features, [featureName]: checked } }));
        } else {
            setCarData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Validation function remains the same, but we'll use correct field names
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

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        const errors = validateForm(carData);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            setLoading(false);
            return;
        }
        const payload = {
            ...carData,
            year: parseInt(carData.year, 10),
            price: parseFloat(carData.price),
            mileage: parseInt(carData.mileage, 10),
        };
        try {
            const response = await fetch(`http://localhost:8080/api/cars/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update car details.');
            }
            alert('Car details updated successfully!');
            navigate(`/view/${id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        try {
            const res = await fetch(`http://localhost:8080/api/cars/${id}/images`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: uploadFormData,
            });
            if (!res.ok) throw new Error("Image upload failed.");
            const newImage = await res.json();
            setCarImages(prev => [...prev, newImage]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            e.target.value = null;
        }
    };

    const handleImageDelete = async (imageId) => {
        if (!window.confirm("Are you sure?")) return;
        const originalImages = [...carImages];
        setCarImages(prev => prev.filter(img => img.id !== imageId));
        try {
            const res = await fetch(`http://localhost:8080/api/cars/${id}/images/${imageId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to delete image.");
        } catch (err) {
            setError(err.message);
            setCarImages(originalImages);
        }
    };

    if (loading && !carData.makerName) return <div className="container py-4">Loading Form...</div>;
    if (error) return <div className="container py-4 alert alert-danger">{error}</div>;

    return (
        <Fragment>
            <main>
                <div className="container">
                    <h1 className="car-details-page-title">Edit Car Listing</h1>
                    <form onSubmit={handleSubmit} className="card add-new-car-form">
                        <div className="form-content">
                            <div className="form-details">
                                <div className="row">
                                    {/* --- CORRECTED FIELDS --- */}
                                    <div className="col"><div className="form-group"><label>Maker</label>
                                        <input type="text" name="makerName" value={carData.makerName} onChange={handleChange}/>
                                        {formErrors.makerName && <p className="error-message">{formErrors.makerName}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>Model</label>
                                        <input type="text" name="modelName" value={carData.modelName} onChange={handleChange} />
                                        {formErrors.modelName && <p className="error-message">{formErrors.modelName}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>Year</label>
                                        <select name="year" value={carData.year} onChange={handleChange} >
                                            <option value="">Year</option>
                                            {generateYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        {formErrors.year && <p className="error-message">{formErrors.year}</p>}
                                    </div></div>
                                </div>
                                <div className="form-group"><label>Car Type</label>
                                    <input type="text" name="carTypeName" value={carData.carTypeName} onChange={handleChange}/>
                                    {formErrors.carTypeName && <p className="error-message">{formErrors.carTypeName}</p>}
                                </div>
                                 <div className="form-group"><label>Phone</label>
                                    <input type="text" name="phoneNo" value={carData.phoneNo} onChange={handleChange}/>
                                    {formErrors.phoneNo && <p className="error-message">{formErrors.phoneNo}</p>}
                                </div>
                                <div className="row">
                                    <div className="col"><div className="form-group"><label>Price ($)</label>
                                        <input type="number" name="price" placeholder="e.g., 25000" value={carData.price} onChange={handleChange}/>
                                        {formErrors.price && <p className="error-message">{formErrors.price}</p>}
                                    </div></div>
                                    
                                    <div className="col"><div className="form-group"><label>Mileage</label>
                                        <input type="number" name="mileage" placeholder="e.g., 50000" value={carData.mileage} onChange={handleChange} />
                                        {formErrors.mileage && <p className="error-message">{formErrors.mileage}</p>}
                                    </div></div>
                                </div>
                                <div className="row">
                                    <div className="col"><div className="form-group"><label>State/Region</label>
                                        <input type="text" name="stateName" value={carData.stateName} onChange={handleChange} />
                                        {formErrors.stateName && <p className="error-message">{formErrors.stateName}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>City</label>
                                        <input type="text" name="cityName" value={carData.cityName} onChange={handleChange} />
                                        {formErrors.cityName && <p className="error-message">{formErrors.cityName}</p>}
                                    </div></div>
                                </div>
                                <div className="form-group"><label>Fuel Type</label>
                                    <input type="text" name="fuelTypeName" value={carData.fuelTypeName} onChange={handleChange} />
                                    {formErrors.fuelTypeName && <p className="error-message">{formErrors.fuelTypeName}</p>}
                                </div>
                                {/* --- END OF CORRECTED FIELDS --- */}
                                <div className="form-group"><label>Detailed Description</label>
                                    <textarea name="description" value={carData.description} onChange={handleChange} rows="6"></textarea>
                                    {formErrors.description && <p className="error-message">{formErrors.description}</p>}
                                </div>
                                <div className="form-group"><label>Features</label><div className="row">{Object.keys(carData.features).map(key => (<div className="col" key={key}><label className="checkbox"><input type="checkbox" name={`feature_${key}`} checked={!!carData.features[key]} onChange={handleChange} />{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label></div>))}</div></div>
                            </div>
                             <div className="form-images">
                                <label className="form-group-label">Manage Images</label>
                                <div className="car-form-images">
                                    {carImages.map(image => (
                                        <div key={image.id} className="car-form-image-preview">
                                            {/* CORRECTED: Image URL handling */}
                                            <img src={image.url.startsWith('http') ? image.url : `http://localhost:8080${image.url}`} alt={`Car image ${image.id}`} />
                                            <button type="button" className="delete-image-btn" title="Delete Image" onClick={() => handleImageDelete(image.id)}>×</button>
                                        </div>
                                    ))}
                                    <button type="button" className="add-image-btn" title="Add New Image" onClick={() => fileInputRef.current?.click()} disabled={loading}>+</button>
                                </div>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} accept="image/png, image/jpeg" />
                            </div>
                        </div>
                        <div className="p-medium" style={{ width: "100%" }}>
                            {error && <p className="error-message">{error}</p>}
                            <div className="flex justify-end gap-1">
                                <button type="button" className="btn btn-default" onClick={() => navigate(`/view/${id}`)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </Fragment>
    );
}