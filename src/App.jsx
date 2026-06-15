import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MainPage from "./pages/MainPage";
import UserProfilePage from "./pages/UserProfilePage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

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
import AdminPage from "./pages/AdminPage";

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import PublicCollectionPage from "./pages/PublicCollectionPage";
import LandingPage from "./components/LandingPage";

import Layout from "./components/Layout";
import FormLayout from "./components/FormLayout";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>

      {/* ROOT REDIRECT */}
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

      {/* PUBLIC */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ===================== */}
      {/* PROTECTED APP LAYOUT */}
      {/* ===================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          <Route path="/home" element={<MainPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />

          <Route path="/collections" element={<MyCollectionsPage />} />
          <Route path="/collections/:id" element={<CollectionPage />} />

          <Route path="/items/:id" element={<ItemPage />} />

          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          <Route path="/settings/password" element={<ChangePasswordPage />} />

          <Route path="/users/:id" element={<UserProfilePage />} />
          <Route path="/public/collections/:id" element={<PublicCollectionPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

        </Route>
      </Route>

      {/* ===================== */}
      {/* FORMS (NO SIDEBAR) */}
      {/* ===================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<FormLayout />}>
          <Route path="/collectionForm" element={<CollectionFormPage />} />
          <Route path="/collections/edit/:id" element={<EditCollectionForm />} />
          <Route path="/collections/:id/items/new" element={<ItemForm />} />
          <Route path="/items/:id/edit" element={<EditItemForm />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;