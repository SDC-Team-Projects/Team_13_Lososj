import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import CollectionFormPage from "./pages/CollectionFormPage";
import MyCollectionsPage from "./pages/MyCollectionsPage";

function App() {

  return (
    <>
      <AuthProvider>
      
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage/>}></Route>
      <Route path="/" element={<RegisterPage/>} />
      <Route path="/home" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/collectionForm" element={<ProtectedRoute><CollectionFormPage /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><MyCollectionsPage /></ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
    
    </AuthProvider>
    </>
  )
}

export default App
