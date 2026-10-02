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
// import ProductsPage from "./pages/ProductsPage";
import "./App.css";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";

export const API_BASE = "http://localhost:3001";
const ProductsPage = lazy(() => import("./pages/ProductsPage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes definition */}
        {/* index is path="" */}
        <Route index element={<WelcomePage />} />
        <Route path="login" element={<LoginPage />} />

        {/* authenticated/protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<RootLayout />}>
            {/* Child routes for the app layout go here */}
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="customers/new" element={<NewCustomerPage />} />
            <Route path="customers/:id/edit" element={<EditCustomerPage />} />
            {/* <Route path="products" element={<ProductsPage />} /> */}
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

        {/* Catch all unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
