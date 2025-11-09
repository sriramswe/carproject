import React, { Fragment, useState, useMemo, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCarContext } from "../Components/CarContext";
import { FavouriteContext } from "../Components/FavouriteContext";
import WatchlistButtons from "../Components/WatchListButtons";

export default function Pagination({ currentPage, totalPages, onPageChange }) {

  return (
    <nav className="flex gap-1 justify-center items-center py-4 flex-wrap">
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0} className="pagination-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
        </svg>
      </button>

      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="pagination-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button> 
       
{Array.from({ length: totalPages }, (_, i) => (
  <button
    key={i}
    onClick={() => onPageChange(i)}
    className={`pagination-item px-3 py-1 rounded transition-all duration-200 border border-gray-300
      ${i === currentPage 
        ? "bg-orange-600 text-white font-semibold border-white-700" 
        : "bg-white text-gray-800 hover:bg-gray-100"
      }`}
  >
    {i + 1}
  </button>
))}


      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} className="pagination-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} className="pagination-item">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: 18 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}

