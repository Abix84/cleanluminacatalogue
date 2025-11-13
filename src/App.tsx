import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // <-- Importer la nouvelle page d'accueil
import Catalog from "./pages/Catalog";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import { ProductProvider } from "./context/ProductContextUnified";
import { UtilityCategoryProvider } from "./context/UtilityCategoryContextUnified";
import { BrandProvider } from "./context/BrandContextUnified";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Diagnostic from "./pages/admin/Diagnostic";
import Management from "./pages/admin/Management";
import Users from "./pages/admin/Users";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/admin/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { SEOHead } from "./components/SEOHead";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <SEOHead />
            <AuthProvider>
              <UtilityCategoryProvider>
                <BrandProvider>
                  <ProductProvider>
                    <Toaster />
                    <Sonner />
                    <Routes>
                      {/* Route de login - accessible sans authentification */}
                      <Route path="/login" element={<Login />} />

                      {/* Routes publiques protégées - nécessitent une authentification */}
                      <Route element={<PublicRoute />}>
                        <Route
                          path="/"
                          element={<Home />}
                        />
                        <Route
                          path="/catalogue/:brandName"
                          element={
                            <Layout>
                              <Catalog />
                            </Layout>
                          }
                        />
                        <Route
                          path="/product/:id"
                          element={
                            <Layout>
                              <ProductDetail />
                            </Layout>
                          }
                        />
                      </Route>

                      {/* Dashboard - Accessible en lecture seule (Admin + Vendeur) */}
                      <Route element={<ProtectedRoute />}>
                        <Route
                          path="/admin"
                          element={
                            <AdminLayout>
                              <AdminDashboard />
                            </AdminLayout>
                          }
                        />
                      </Route>

                      {/* Routes Admin uniquement - Modification requise */}
                      <Route element={<AdminRoute />}>
                        <Route
                          path="/admin/products/new"
                          element={
                            <AdminLayout>
                              <AddProduct />
                            </AdminLayout>
                          }
                        />
                        <Route
                          path="/admin/products/edit/:id"
                          element={
                            <AdminLayout>
                              <EditProduct />
                            </AdminLayout>
                          }
                        />
                        <Route
                          path="/admin/diagnostic"
                          element={
                            <AdminLayout>
                              <Diagnostic />
                            </AdminLayout>
                          }
                        />
                        <Route
                          path="/admin/management"
                          element={
                            <AdminLayout>
                              <Management />
                            </AdminLayout>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <AdminLayout>
                              <Users />
                            </AdminLayout>
                          }
                        />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProductProvider>
                </BrandProvider>
              </UtilityCategoryProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
