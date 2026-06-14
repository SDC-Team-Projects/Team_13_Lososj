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
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

function App() {

    const { isAuthenticated, loading } = useAuth();
    if (loading) return null; // или loader

  return (
    <>
    <Routes>
  {/* root redirect */}
  <Route
    path="/"
    element={
      isAuthenticated ? (
        <Navigate to="/home" replace />
      ) : (
        <Navigate to="/landing" replace />
      )
    }
  />

  {/* public routes */}
  <Route path="/landing" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />

  {/* protected layout group */}
  <Route
    element={
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    }
  >
    <Route path="/home" element={<MainPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/profile/edit" element={<EditProfilePage />} />

    <Route path="/collections" element={<MyCollectionsPage />} />
    <Route path="/collections/:id" element={<CollectionPage />} />
    <Route path="/collections/:id/items/new" element={<ItemForm />} />
    <Route path="/collections/edit/:id" element={<EditCollectionForm />} />
    <Route path="/collections/edit/:id" element={<EditCollectionForm />} />
    <Route path="/items/:id" element={<ItemPage />} />
    <Route path="/collectionForm" element={<CollectionFormPage />} />

    <Route path="/overview" element={<OverviewPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />

    <Route path="/settings/password" element={<ChangePasswordPage />} />
    <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

    <Route path="/users/:id" element={<UserProfilePage />} />
    <Route path="/public/collections/:id" element={<PublicCollectionPage />} />
  </Route>
</Routes>

    </>
  )
}

export default App
