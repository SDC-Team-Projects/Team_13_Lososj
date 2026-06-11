import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";

import UserProfilePage from "./pages/UserProfilePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import CollectionFormPage from "./pages/CollectionFormPage";
import MyCollectionsPage from "./pages/MyCollectionsPage";
import CollectionPage from "./pages/CollectionPage";
import ItemForm from "./components/ItemForm";
import ItemPage from "./components/ItemPage";
import EditCollectionForm from "./components/EditCollectionForm";
import EditItemForm from "./components/EditItemForm";
import OverviewPage from "./pages/OverviewPage";
import FavoritesPage from "./pages/FavoritesPage";
import EditProfilePage from "./pages/EditProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminRoute from "./routes/AdminRoute";
import AdminPage from "./pages/AdminPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PublicCollectionPage from "./pages/PublicCollectionPage";
import LandingPage from "./components/LandingPage";
function App() {

  return (
    <>
    <Routes>
      <Route path="/login" element={<LoginPage/>}></Route>
     <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/collectionForm" element={<ProtectedRoute><CollectionFormPage /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><MyCollectionsPage /></ProtectedRoute>} />
      <Route path="/collections/:id" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
      <Route path="/collections/:id/items/new" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
      <Route path="/items/:id" element={<ProtectedRoute><ItemPage /></ProtectedRoute>} />
      <Route path="/collections/edit/:id" element={<ProtectedRoute><EditCollectionForm /></ProtectedRoute>}/>
      <Route path="/items/:id/edit" element={<ProtectedRoute><EditItemForm /></ProtectedRoute>} />
      <Route path="/overview" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/overview" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/public/collections/:id" element={<PublicCollectionPage />} />
      <Route path="/settings/password" element={<ProtectedRoute><ChangePasswordPage/></ProtectedRoute>}/>
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}/>
      <Route path="/forgot-password" element={<ForgotPassword />}/>
      <Route path="/reset-password/:token" element={<ResetPassword />}/>
      <Route path="/users/:id" element={<UserProfilePage />} />
      <Route path="/public/collections/:id" element={<PublicCollectionPage />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>

    </>
  )
}

export default App
