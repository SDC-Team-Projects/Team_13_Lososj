import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";


function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage/>}></Route>
      <Route path="/" element={<RegisterPage/>} />
      <Route path="/home" element={<MainPage/>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
