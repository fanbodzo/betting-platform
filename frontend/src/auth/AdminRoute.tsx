import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

function tokenHasAdmin(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        // MVP LOGIKA:
        // jeśli login = admin → admin
        if (payload.sub === "admin") return true;

        // (zostawiamy też przyszłościowo role)
        const raw =
            payload.role ??
            payload.roles ??
            payload.authorities ??
            payload.authority ??
            payload.scope ??
            payload.scopes ??
            payload.realm_access?.roles;

        const text = Array.isArray(raw) ? raw.join(" ") : String(raw ?? "");
        return text.toUpperCase().includes("ADMIN");
    } catch {
        return false;
    }
}


export function AdminRoute({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;

    if (!tokenHasAdmin(token)) {
        return <Navigate to="/bets" replace />;
    }

    return <>{children}</>;
}
