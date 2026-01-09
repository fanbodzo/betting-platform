import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { BetsPage } from "./pages/BetsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NewCouponPage } from "./pages/NewCouponPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/bets" replace />} />
                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/bets"
                    element={
                        <ProtectedRoute>
                            <BetsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/coupon/new"
                    element={
                        <ProtectedRoute>
                            <NewCouponPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
