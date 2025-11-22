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

export default function Edit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCarById } = useCarContext();
    const { token } = useAuth();
    const fileInputRef = useRef(null);

    const [carData, setCarData] = useState(null);
    const [carImages, setCarImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const carId = parseInt(id);
        if (isNaN(carId)) {
            setError("Invalid Car ID."); setLoading(false); return;
        }
        const loadCar = async () => {
            setLoading(true);
            const data = await getCarById(carId);
            if (data) {
                setCarData({
                    makerId: data.model?.maker?.id || "",
                    modelId: data.model?.id || "",
                    year: data.year || "",
                    carTypeId: data.carType?.id || "",
                    price: data.price || "",
                    mileage: data.mileage || "",
                    fuelType: data.fuelType || "",
                    stateId: data.city?.state?.id || "",
                    cityId: data.city?.id || "",
                    description: data.description || "",
                    phoneno: data.owner?.phone || "",
                    features: { ...(data.features || {}) }
                });
                setCarImages(data.images || []);
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

    // Validation function (similar to Create)
    const validateForm = (data) => {
        const newErrors = {};
        if (!data.makerId) newErrors.makerId = "Maker is required.";
        if (!data.modelId) newErrors.modelId = "Model is required.";
        if (!data.year) newErrors.year = "Year is required.";
        if (!data.carTypeId) newErrors.carTypeId = "Car Type is required.";
        if (!data.fuelType) newErrors.fuelType = "Fuel Type is required.";
        if (!data.stateId) newErrors.stateId = "State is required.";
        if (!data.cityId) newErrors.cityId = "City is required.";
        if (!data.price) {
            newErrors.price = "Price is required.";
        } else if (parseFloat(data.price) <= 0) {
            newErrors.price = "Price must be a positive number.";
        }
        if (!data.mileage) {
            newErrors.mileage = "Mileage is required.";
        } else if (parseInt(data.mileage, 10) < 0) {
            newErrors.mileage = "Mileage cannot be negative.";
        }
        if (!data.phoneno) {
            newErrors.phoneno = "Phone number is required.";
        }
        if (!data.description) {
            newErrors.description = "Description is required.";
        } else if (data.description.length < 20) {
            newErrors.description = "Description must be at least 20 characters long.";
        }
        return newErrors;
    };

    const [formErrors, setFormErrors] = useState({});

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
            year: parseInt(carData.year),
            price: parseFloat(carData.price),
            mileage: parseInt(carData.mileage),
            description: String(carData.description).trim(),
            features: { ...(carData.features || {}) }
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

    if (loading && !carData) return <div className="container py-4">Loading Form...</div>;
    if (error) return <div className="container py-4 alert alert-danger">{error}</div>;
    if (!carData) return <div className="container py-4">Car data could not be loaded.</div>;

    return (
        <Fragment>
            <main>
                <div className="container">
                    <h1 className="car-details-page-title">Edit Car Listing</h1>
                    <form onSubmit={handleSubmit} className="card add-new-car-form">
                        <div className="form-content">
                            <div className="form-details">
                                <div className="row">
                                    <div className="col"><div className="form-group"><label>Maker</label>
                                        <select name="makerId" value={carData.makerId} onChange={handleChange} required>
                                            <option value="">Select Maker</option>
                                            {useCarContext().makers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                        {formErrors.makerId && <p className="error-message">{formErrors.makerId}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>Model</label>
                                        <select name="modelId" value={carData.modelId} onChange={handleChange} required>
                                            <option value="">Select Model</option>
                                            {useCarContext().models.filter(model => model.maker?.id === parseInt(carData.makerId)).map(model => (
                                                <option key={model.id} value={model.id}>{model.model}</option>
                                            ))}
                                        </select>
                                        {formErrors.modelId && <p className="error-message">{formErrors.modelId}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>Year</label>
                                        <select name="year" value={carData.year} onChange={handleChange} required>
                                            <option value="">Year</option>
                                            {generateYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        {formErrors.year && <p className="error-message">{formErrors.year}</p>}
                                    </div></div>
                                </div>
                                <div className="form-group"><label>Car Type</label>
                                    <select name="carTypeId" value={carData.carTypeId} onChange={handleChange} required>
                                        <option value="">Select Car Type</option>
                                        {useCarContext().carTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                    </select>
                                    {formErrors.carTypeId && <p className="error-message">{formErrors.carTypeId}</p>}
                                </div>
                                <div className="row">
                                    <div className="col"><div className="form-group"><label>Price ($)</label>
                                        <input type="number" name="price" placeholder="e.g., 25000" value={carData.price} onChange={handleChange} required />
                                        {formErrors.price && <p className="error-message">{formErrors.price}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>Mileage</label>
                                        <input type="number" name="mileage" placeholder="e.g., 50000" value={carData.mileage} onChange={handleChange} required />
                                        {formErrors.mileage && <p className="error-message">{formErrors.mileage}</p>}
                                    </div></div>
                                </div>
                                <div className="row">
                                    <div className="col"><div className="form-group"><label>State/Region</label>
                                        <select name="stateId" value={carData.stateId} onChange={handleChange} required>
                                            <option value="">Select State</option>
                                            {useCarContext().states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        {formErrors.stateId && <p className="error-message">{formErrors.stateId}</p>}
                                    </div></div>
                                    <div className="col"><div className="form-group"><label>City</label>
                                        <select name="cityId" value={carData.cityId} onChange={handleChange} required>
                                            <option value="">Select City</option>
                                            {useCarContext().cities.filter(city => city.state?.id === parseInt(carData.stateId)).map(city => (
                                                <option key={city.id} value={city.id}>{city.name}</option>
                                            ))}
                                        </select>
                                        {formErrors.cityId && <p className="error-message">{formErrors.cityId}</p>}
                                    </div></div>
                                </div>
                                <div className="form-group"><label>Fuel Type</label>
                                    <select name="fuelType" value={carData.fuelType} onChange={handleChange} required>
                                        <option value="">Select Fuel Type</option>
                                        {useCarContext().fuelTypes.map(fuel => <option key={fuel.id} value={fuel.name}>{fuel.name}</option>)}
                                    </select>
                                    {formErrors.fuelType && <p className="error-message">{formErrors.fuelType}</p>}
                                </div>
                                <div className="form-group"><label>Detailed Description</label>
                                    <textarea name="description" value={carData.description} onChange={handleChange} rows="6" required></textarea>
                                    {formErrors.description && <p className="error-message">{formErrors.description}</p>}
                                </div>
                                <div className="form-group"><label>Features</label><div className="row">{Object.keys(carData.features).map(key => (<div className="col" key={key}><label className="checkbox"><input type="checkbox" name={`feature_${key}`} checked={!!carData.features[key]} onChange={handleChange} />{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label></div>))}</div></div>
                            </div>
                            <div className="form-images">
                                <label className="form-group-label">Manage Images</label>
                                <div className="car-form-images">
                                    {carImages.map(image => (
                                        <div key={image.id} className="car-form-image-preview">
                                            <img src={`http://localhost:8080${image.imagePath}`} alt={`Car image ${image.id}`} />
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