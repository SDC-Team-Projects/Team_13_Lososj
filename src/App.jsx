import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";


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
    </Routes>
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App
