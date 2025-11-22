import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../Components/AuthContext";
import { Link } from "react-router-dom";
import { Fragment } from "react";
const initialProfileState = { name: "", email: "", phone: "", avatarPath: "" };

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
          fetch("http://localhost:8080/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8080/api/users/my-cars", {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
      const res = await fetch(
        "http://localhost:8080/api/users/profile/avatar",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Avatar upload failed.");

      const updated = await res.json();
      setProfileData(updated);
      setSuccessMessage("Avatar updated!");
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
return (
  <Fragment>
    <main className="w-full mt-12 sm:mt-0">
      <div className="flex gap-3.5 sm:w-11/12 sm:mt-4 m-auto mb-7">
        
 

        {/* DETAILS COLUMN */}
        <div className="flex-1 overflow-hidden shadow bg-white">
          <div className="flex flex-col gap-12 m-4 sm:mx-8 sm:my-6">

            {/* PERSONAL INFO */}
            <div className="flex flex-col gap-5 items-start">
              <span className="font-medium text-lg">
                Personal Information
                <Link to="/account/update" className="text-sm text-primary-blue font-medium ml-8 cursor-pointer">
                  Edit
                </Link>
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                
                {/* FIRST NAME */}
                <div className="flex flex-col gap-0.5 w-64 px-3 py-1.5 rounded-sm border bg-gray-100 cursor-not-allowed">
                  <label className="text-xs text-gray-500">First Name</label>
                  <input
                    type="text"
                    value={user.name.split(" ")[0]}
                    disabled
                    className="text-sm outline-none border-none cursor-not-allowed text-gray-500"
                  />
                </div>

                {/* LAST NAME */}
                <div className="flex flex-col gap-0.5 w-64 px-3 py-1.5 rounded-sm border bg-gray-100 cursor-not-allowed">
                  <label className="text-xs text-gray-500">Last Name</label>
                  <input
                    type="text"
                    value={user.name.split(" ").slice(1).join(" ")}
                    disabled
                    className="text-sm outline-none border-none cursor-not-allowed text-gray-500"
                  />
                </div>
              </div>

              {/* GENDER */}
              <div className="flex flex-col gap-2">
                <h2 className="text-sm">Your Gender</h2>

                <div className="flex items-center gap-8">
                  
                  <div className="flex items-center gap-4 text-gray-500 cursor-not-allowed">
                    <input
                      type="radio"
                      name="gender"
                      checked={user.gender === "male"}
                      disabled
                      className="h-4 w-4"
                    />
                    <label>Male</label>
                  </div>

                  <div className="flex items-center gap-4 text-gray-500 cursor-not-allowed">
                    <input
                      type="radio"
                      name="gender"
                      checked={user.gender === "female"}
                      disabled
                      className="h-4 w-4"
                    />
                    <label>Female</label>
                  </div>

                </div>
              </div>
            </div>

            {/* EMAIL ADDRESS */}
            <div className="flex flex-col gap-5 items-start">
              <span className="font-medium text-lg">
                Email Address
                <Link to="/account/update" className="text-sm text-primary-blue font-medium ml-3 sm:ml-8">
                  Edit
                </Link>
                <Link to="/password/update" className="text-sm text-primary-blue font-medium ml-3 sm:ml-8">
                  Change Password
                </Link>
              </span>

              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5 sm:w-64 px-3 py-1.5 rounded-sm border bg-gray-100 cursor-not-allowed">
                  <label className="text-xs text-gray-500">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="text-sm outline-none border-none cursor-not-allowed text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* MOBILE NUMBER */}
            <div className="flex flex-col gap-5 items-start">
              <span className="font-medium text-lg">
                Mobile Number
                <Link to="/account/update" className="text-sm text-primary-blue font-medium ml-3 sm:ml-8 cursor-pointer">
                  Edit
                </Link>
              </span>

              <div>
                <div className="flex flex-col gap-0.5 sm:w-64 px-3 py-1.5 rounded-sm border bg-gray-100 cursor-not-allowed">
                  <label className="text-xs text-gray-500">Mobile Number</label>
                  <input
                    type="tel"
                    value={user.phone || ""}
                    disabled
                    className="text-sm outline-none border-none text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-2">FAQs</h2>

              <div className="flex flex-col gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium">What happens when I update my email address (or mobile number)?</h4>
                  <p>Your login email or mobile number will change. You will receive all communication on the updated one.</p>
                </div>

                <div>
                  <h4 className="font-medium">When will my account be updated?</h4>
                  <p>As soon as you verify the OTP sent to your updated email/mobile.</p>
                </div>

                <div>
                  <h4 className="font-medium">What happens to my old account info?</h4>
                  <p>Your account stays the same. Order history and personal details remain unchanged.</p>
                </div>

                <div>
                  <h4 className="font-medium">Does it affect my seller account?</h4>
                  <p>Flipkart uses single sign-on. Changes apply everywhere.</p>
                </div>
              </div>

              <Link to="/" className="text-sm text-primary-blue font-medium mt-4">
                Deactivate Account
              </Link>
            </div>

          </div>

          {/* FOOTER IMAGE */}
          <img
            draggable="false"
            className="w-full object-contain"
            src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/myProfileFooter_4e9fe2.png"
            alt="footer"
          />
        </div>

      </div>
    </main>
  </Fragment>
);
}
