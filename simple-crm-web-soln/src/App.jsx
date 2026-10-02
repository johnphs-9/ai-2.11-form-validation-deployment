import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import RootLayout from "./layouts/RootLayout";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import NewCustomerPage from "./pages/NewCustomerPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";
import "./App.css";

const ProductsPage = lazy(() => import("./pages/ProductsPage"));

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<WelcomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<RootLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/new" element={<NewCustomerPage />} />
            <Route path="customers/:id/edit" element={<EditCustomerPage />} />
            <Route
              path="products"
              element={
                <Suspense fallback={<Spinner />}>
                  <ProductsPage />
                </Suspense>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
