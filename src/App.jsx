// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ 1. IMPORT ALL THREE PROVIDERS
import { AuthProvider } from "./Components/AuthContext";
import { CarProvider } from "./Components/CarContext";
import { FavouriteProvider } from "./Components/FavouriteContext";
import ProtectedRoute from "./Components/ProductRoutes";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "./Components/Header";
import Index from "./car/index";
import View from "./car/View";
import Search from "./car/Search";
import Login from "./car/Login";
import Signup from "./car/Sign-up";
import Edit from "./car/Edit";
import Create from "./car/Create";
import WatchList from "./car/WatchList";
import PasswordReset from "./car/password-reset";
import Mycar from "./car/Mycars";
import  Profile from  "./car/profile";
import OAuth2RedirectHandler from "./Components/OAuthredirectHandler";
import PasswordResetConfirm from "./car/password-reset";

function App() {
  return (
    <BrowserRouter>
<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored"/>
      <AuthProvider>
        <CarProvider>
          <FavouriteProvider>
            <Header />
            <Routes>
              <Route path="/" element={
                
                  <Index />
              
              } />
              <Route path="/view/:id" element={
       
                  <View />
             
              } />
              <Route path="/edit/:id" element={
                <ProtectedRoute>
                  <Edit />
                </ProtectedRoute>
              } />
              <Route path="/search" element={
              
                  <Search />
        
              } />
               <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create" element={
                <ProtectedRoute><Create /></ProtectedRoute>
              } />
              <Route path="/watchlist" element={
                <ProtectedRoute><WatchList /></ProtectedRoute>
              } />
              <Route path="/password-reset/confirm/:token" element={<PasswordResetConfirm />} />
              <Route path="/mycar" element={
                <ProtectedRoute><Mycar /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                  <ProtectedRoute><Profile/></ProtectedRoute>
              }/>
               <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            </Routes>
           
          </FavouriteProvider>
        </CarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;