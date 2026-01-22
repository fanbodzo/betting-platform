import { Navigate } from "react-router-dom";

export function HomeRedirect() {
    const token = localStorage.getItem("token");
    return <Navigate to={token ? "/bets" : "/login"} replace />;
}
