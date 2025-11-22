import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "./pagination"

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);

  const fetchCars = async (pageNumber) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/cars?page=${pageNumber}&size=6`); // axios used for big project to use 
      setCars(res.data.cars);
      setPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch cars", error);
    }
  };

  useEffect(() => {
    fetchCars(page);
  }, [page]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {cars.map((car) => (
          <div key={car.id} className="p-3 border rounded">{car.model?.model} - ₹{car.price}</div>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
