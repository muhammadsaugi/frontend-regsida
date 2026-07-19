import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AsnAuthProvider } from "./context/AsnAuthContext";
import { CitizenAuthProvider } from "./context/CitizenAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cari from "./pages/Cari";
import RegulasiDetail from "./pages/RegulasiDetail";
import Tanya from "./pages/Tanya";
import Verifikasi from "./pages/Verifikasi";
import AsnLogin from "./pages/Login";
import CitizenLogin from "./pages/CitizenLogin";
import CitizenRegister from "./pages/CitizenRegister";
import AdminDashboard from "./pages/AdminDashboard";
import ConflictGraph from "./pages/ConflictGraph";
import DecayTracker from "./pages/DecayTracker";
import Inspektorat from "./pages/Inspektorat";
import ManajemenRegulasi from "./pages/ManajemenRegulasi";
import SuaraWarga from "./pages/SuaraWarga";
import NotFound from "./pages/NotFound";

function WargaLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cari" element={<Cari />} />
          <Route path="/regulasi/:id" element={<RegulasiDetail />} />
          <Route path="/tanya" element={<Tanya />} />
          <Route path="/verifikasi" element={<Verifikasi />} />
          <Route path="/masuk" element={<CitizenLogin />} />
          <Route path="/daftar" element={<CitizenRegister />} />
          <Route path="/portal-asn/login" element={<AsnLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regulasi"
          element={
            <ProtectedRoute allowedRoles={["bagian_hukum"]}>
              <ManajemenRegulasi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graf"
          element={
            <ProtectedRoute allowedRoles={["staf_opd", "bagian_hukum"]}>
              <ConflictGraph />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decay"
          element={
            <ProtectedRoute allowedRoles={["staf_opd", "bagian_hukum"]}>
              <DecayTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suara-warga"
          element={
            <ProtectedRoute allowedRoles={["staf_opd", "bagian_hukum"]}>
              <SuaraWarga />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspektorat"
          element={
            <ProtectedRoute allowedRoles={["inspektorat"]}>
              <Inspektorat />
            </ProtectedRoute>
          }
        />
        {/* Add more admin routes here later */}
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <CitizenAuthProvider>
      <AsnAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<WargaLayout />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </AsnAuthProvider>
    </CitizenAuthProvider>
  );
}
