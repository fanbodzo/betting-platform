import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { BetsPage } from "./pages/BetsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NewCouponPage } from "./pages/NewCouponPage";
import { AppLayout } from "./layout/AppLayout";
import { AdminRoute } from "./auth/AdminRoute";
import { AdminPage } from "./pages/AdminPage";
import { ScrollToTop } from "./routing/ScrollToTop.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import "./styles/theme.css";

function App() {
    const hasToken = !!localStorage.getItem("token");

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {/* ROOT: login jeśli nie ma tokena, bets jeśli jest */}
                <Route
                    path="/"
                    element={<Navigate to={hasToken ? "/bets" : "/login"} replace />}
                />

                {/* public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* private: layout + auth */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/bets" element={<BetsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/coupon/new" element={<NewCouponPage />} />

                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        }
                    />
                </Route>

                {/* catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
