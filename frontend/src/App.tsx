import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { BetsPage } from "./pages/BetsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NewCouponPage } from "./pages/NewCouponPage";
import { AppLayout } from "./layout/AppLayout";
import "./styles/theme.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* public */}
                <Route path="/login" element={<LoginPage />} />

                {/* layout + ochronę*/}
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<Navigate to="/bets" replace />} />
                    <Route path="/bets" element={<BetsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/coupon/new" element={<NewCouponPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
