import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAuth() {
    const token = localStorage.getItem("token");
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}