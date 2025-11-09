import React, { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Pagination from "../Components/pagination";

export default function Mycar() {
  const [myCars, setMyCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt_token");

  // Fetch the user's cars from the new endpoint
  useEffect(() => {
    if (!token) {
      setError("You must be logged in to view this page.");
      setLoading(false);
      return;
    }
    

    const fetchMyCars = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8080/api/user/my-cars", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
            throw new Error("Authentication failed. Please log in again.");
        }
        if (!response.ok) {
            throw new Error("Failed to fetch your cars.");
        }
        
        const data = await response.json();
        setMyCars(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCars();
  }, [token]);

  // Handle the delete action
  const handleDelete = async (carId) => {
    if (!window.confirm("Are you sure you want to permanently delete this car listing?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/cars/${carId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete the car.");
        }

        // Remove the deleted car from the state to update the UI instantly
        setMyCars(prevCars => prevCars.filter(car => car.id !== carId));
        alert("Car deleted successfully.");

    } catch (err) {
        setError(err.message);
    }
  };

  if (loading) return <div className="container py-4">Loading your cars...</div>;
  if (error) return <div className="container py-4 alert alert-danger">{error}</div>;

  return (
    <Fragment>
      <main>
        <div>
          <div className="container">
            <h1 className="car-details-page-title">My Cars</h1>
            <div className="card p-medium">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Date Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCars.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>You have not listed any cars yet.</td>
                        </tr>
                    ) : (
                        myCars.map(car => (
                            <tr key={car.id}>
                                <td>
                                    <img
                                    src={car.images?.[0]?.imagePath || "/img/default-car.png"}
                                    alt={`${car.model?.model} ${car.model?.maker?.name}`}
                                    className="my-cars-img-thumbnail"
                                    />
                                </td>
                                <td> {car.year} - {car.model?.model} {car.model?.maker?.name}</td>
                                <td>{format(new Date(car.createdAt), 'yyyy-MM-dd')}</td>
                                <td>
                                    <Link to={`/edit/${car.id}`} className="btn btn-edit inline-flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "12px", marginRight: "5px" }}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(car.id)}
                                        className="btn btn-delete inline-flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: "12px", marginRight: "5px" }}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                        Delete
                                    </button>
                                    <Link to ={ `/view/${car.id}`} className="btn btn-edit inline-flex items-center">
                                    🍳
                                        View
                                    </Link>
                                    
                                </td>
                            </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            <Pagination/>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}