import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";



function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage/>}></Route>
      {/* <Route path="/" element={<RegisterPage/>} /> */}
      <Route path="/" element={<h1>HOME TEST</h1>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
