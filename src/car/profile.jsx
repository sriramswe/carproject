import React, { Fragment, useState, useEffect, useRef } from "react";
import { useAuth } from "../Components/AuthContext";
import { Link } from "react-router-dom";

// Initial state for the profile form to avoid undefined errors
const initialProfileState = { name: '', email:'', phone: '', avatarPath: '' };

export default function Profile() {
  
  const { token, user } = useAuth(); 
  

  const fileInputRef = useRef(null);
  
  
  const [profileData, setProfileData] = useState(initialProfileState);
  const [myCars, setMyCars] = useState([]);
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all necessary data when the component loads
  useEffect(() => {
    // Only fetch if the token is available
    if (!token) {
        setLoading(false);
        setError("You must be logged in to view your profile.");
        return;
    };
   const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email address is invalid.';
        break;
      case 'name':
        if (!value) return 'Username is required';
        if (value.length < 8) return 'Name must be at least 8 characters.';
        break;
      default:
        break;
    }
    return ''; // No error
  };
    
    const fetchProfileAndCars = async () => {
      setLoading(true);
      try {
        const [profileRes, carsRes] = await Promise.all([
          fetch("http://localhost:8080/api/users/profile", { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch("http://localhost:8080/api/users/my-cars", { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!profileRes.ok) throw new Error("Could not fetch profile data.");
        if (!carsRes.ok) throw new Error("Could not fetch your car listings.");
        
        const profile = await profileRes.json();
        const cars = await carsRes.json();

        setProfileData(profile);
        setMyCars(cars);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndCars();
  }, [token]);

  // Handler for changes to the profile form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for submitting the profile update form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const payload = {
      name: profileData.name,
      phone: profileData.phone,
    };

    try {
      const response = await fetch("http://localhost:8080/api/users/profile", {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Profile update failed.");
      }
      const updatedProfile = await response.json();
      setProfileData(updatedProfile); // Update state with latest data from server
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler for when a user selects a new avatar image
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:8080/api/users/profile/avatar", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) throw new Error("Avatar upload failed.");
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        setSuccessMessage("Avatar updated successfully!");
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (loading && !profileData.email) {
  return (
    <div className="container py-4 text-center">
      <div className="spinner"></div>
      <p>Loading Profile...</p>
    </div>
  );
}
  // --- Manual Validation Logic ---
 


  return (
    <Fragment>
      <main>
        <div className="container">
          <div className="profile-layout">
           
            <div className="profile-sidebar">
              <div className="card profile-card">
                <div className="profile-avatar-wrapper">
<img
  src={`http://localhost:8080/api/user/avatar/${user.id}`}
  alt="Avatar"
  className="profile-avatar"
/>

                    <button className="change-avatar-btn" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                        Change
                    </button>
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleAvatarUpload} accept="image/png, image/jpeg"/>
                </div>
                
                <h2 className="profile-name">{profileData.name}</h2>
                <p className="profile-email">{profileData.email}</p>


                {/* Display Admin Panel link only if user has ROLE_ADMIN */}
                {user?.roles?.includes('ROLE_ADMIN') && (
                    <Link to="/admin/dashboard" className="btn btn-admin-panel">
                        Admin Panel
                    </Link>
                )}
              </div>
              
              {/* ✅ The profile update form is now correctly placed here */}
              <form onSubmit={handleSubmit} className="card add-new-car-form mt-medium">
                <div className="p-large">
                  <h3 className="form-title">Update Information</h3>
                  {error && <div className="alert alert-danger">{error}</div>}
                  {successMessage && <div className="alert alert-success">{successMessage}</div>}
                  
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input id="name" name="name" type="text" className="form-control" placeholder="Enter your full name" value={profileData.name} onChange={handleChange} required />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input id="phone" name="phone" type="tel" className="form-control" placeholder="Enter your phone number" value={profileData.phone} onChange={handleChange} />
                  </div>

                  <div className="flex justify-end gap-1 mt-medium">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* --- RIGHT SIDE: My Car Listings --- */}
            <div className="profile-main-content">
              <h1 className="car-details-page-title">My Car Listings ({myCars.length})</h1>
              {myCars.length === 0 && !loading ? (
                <p>You have not listed any cars yet. <Link to="/create">Add one now!</Link></p>
              ) : (
                <div className="car-items-listing">
                  {myCars.map((car) => (
                    <div className="car-item card" key={car.id}>
                      <Link to={`/view/${car.id}`}>
                        <img src={car.images?.[0]?.imagePath || "/img/default-car.png"} alt={`${car.model?.model}- ${car.model?.maker?.name}`} className="car-item-img rounded-t  w-50 h-70"/>
                      </Link>
                      <div className="p-medium">
                        <h2 className="car-item-title">{car.year} - {car.model?.model} {car.model?.maker?.name}</h2>
                        <p className="car-item-price">${car.price?.toLocaleString()}</p>
                        <Link to={`/edit/${car.id}`} className="btn btn-edit">Edit Listing</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}