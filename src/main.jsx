import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// создаём client (один на всё приложение)
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
       <AuthProvider>
        <BrowserRouter>
    <App />
     </BrowserRouter>
    </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
