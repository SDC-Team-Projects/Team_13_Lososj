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
import CollectionPage from "./pages/CollectionPage";
import ItemForm from "./components/ItemForm";
import ItemPage from "./components/ItemPage";
import EditProfilePage from "./components/EditProfilePage";
import EditCollectionForm from "./components/EditCollectionForm";
import EditItemForm from "./components/EditItemForm";
import OverviewPage from "./pages/OverviewPage";
import FavoritesPage from "./pages/FavoritesPage";

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
      <Route path="/collections/:id" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
      <Route path="/collections/:id/items/new" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
      <Route path="/items/:id" element={<ProtectedRoute><ItemPage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute>< EditProfilePage /></ProtectedRoute>} />
      <Route path="/collections/edit/:id" element={<ProtectedRoute><EditCollectionForm /></ProtectedRoute>}/>
      <Route path="/items/:id/edit" element={<ProtectedRoute><EditItemForm /></ProtectedRoute>} />
      <Route path="/overview" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/overview" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App
