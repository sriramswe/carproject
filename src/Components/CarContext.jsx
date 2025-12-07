import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext"; // ✅ 1. Import the custom auth hook

const CarContext = createContext();
export const useCarContext = () => useContext(CarContext);

const uniqueById = (arr) => {
    const seen = new Set();
    return arr.filter(obj => obj && obj.id && !seen.has(obj.id) && seen.add(obj.id));
};

export const CarProvider = ({ children }) => {
    // ✅ 2. Get the authentication token from the AuthContext
    const { token } = useAuth();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    // State for all the unique lookup data for forms
    const [makers, setMakers] = useState([]);
    const [models, setModels] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [carTypes, setCarTypes] = useState([]);
    useEffect(() => {
        const fetchAllCars = async () => {
            setLoading(true);
            try {
                const res = await fetch("http://localhost:8080/api/cars");
                if (!res.ok) throw new Error("Failed to fetch car list");
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCars(data);
                    // Derive dropdown data from the full car list
                    setMakers(uniqueById(data.map(car => car.model?.maker)));
                    setModels(uniqueById(data.map(car => car.model)));
                    setStates(uniqueById(data.map(car => car.city?.state)));
                    setCities(uniqueById(data.map(car => car.city)));
                    setCarTypes(uniqueById(data.map(car => car.carType)));
                    const uniqueFuelTypeNames = [...new Set(data.map(car => car.fuelType).filter(Boolean))];
                    setFuelTypes(uniqueFuelTypeNames.map(name => ({ id: name, name: name })));
                }
            } catch (err) {
                console.error("Error fetching cars:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllCars();
    }, []); // Runs once on initial load

    const getCarById = useCallback(async (id) => {
        const carId = parseInt(id);
        const existingCar = cars.find((c) => c.id === carId);
        if (existingCar) {
            return existingCar;
        }

        try {
            // ✅ 3. Conditionally add the Authorization header if a token exists
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`http://localhost:8080/api/cars/${carId}`, { headers });
            
            if (!res.ok) throw new Error(`Car with ID ${carId} not found`);
            
            const singleCar = await res.json();
            
        
            setCars(prev => {
                if (prev.some(c => c.id === singleCar.id)) {
                    return prev;
                }
                return [...prev, singleCar];
            });

            return singleCar;
        } catch (err) {
            console.error(err);
            return null;
        }
    }, [cars, token]); 

   

    return (
        <CarContext.Provider value={ { cars,
        loading,
        getCarById,
        makers,
        models,
        states,
        cities,
        fuelTypes,
        carTypes}}>
            {children}
        </CarContext.Provider>
    );
};