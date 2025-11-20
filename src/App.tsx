import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProductProvider } from "./context/ProductContextUnified";
import { UtilityCategoryProvider } from "./context/UtilityCategoryContextUnified";
import { BrandProvider } from "./context/BrandContextUnified";
import { ContactProvider } from "./context/ContactContext";
import { OnlineStatusProvider } from "./context/OnlineStatusContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/admin/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { SEOHead } from "./components/SEOHead";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy loading des routes pour réduire le bundle initial
const Home = lazy(() => import("./pages/Home"));
const Catalog = lazy(() => import("./pages/Catalog"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const Diagnostic = lazy(() => import("./pages/admin/Diagnostic"));
const Management = lazy(() => import("./pages/admin/Management"));
const Users = lazy(() => import("./pages/admin/Users"));
const Backup = lazy(() => import("./pages/admin/Backup"));
const ContactSettings = lazy(() => import("./pages/admin/ContactSettings"));

// Configuration React Query avec cache optimisé
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Composant de fallback pour le lazy loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <SEOHead />
            <AuthProvider>
              <OnlineStatusProvider>
                <UtilityCategoryProvider>
                  <BrandProvider>
                    <ProductProvider>
                      <ContactProvider>
                        <Toaster />
                        <Sonner />
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            {/* Route de login - accessible sans authentification */}
                            <Route
                              path="/login"
                              element={<Login />}
                            />

                            {/* Routes publiques protégées - nécessitent une authentification */}
                            <Route element={<PublicRoute />}>
                              <Route path="/" element={<Home />} />
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
                              <Route
                                path="/contact"
                                element={
                                  <Layout>
                                    <Contact />
                                  </Layout>
                                }
                              />
                              <Route
                                path="/favorites"
                                element={
                                  <Layout>
                                    <Favorites />
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
                              <Route
                                path="/admin/backup"
                                element={
                                  <AdminLayout>
                                    <Backup />
                                  </AdminLayout>
                                }
                              />
                              <Route
                                path="/admin/contact"
                                element={
                                  <AdminLayout>
                                    <ContactSettings />
                                  </AdminLayout>
                                }
                              />
                            </Route>

                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </ContactProvider>
                    </ProductProvider>
                  </BrandProvider>
                </UtilityCategoryProvider>
              </OnlineStatusProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
