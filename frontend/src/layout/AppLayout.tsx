import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/useTheme";
import { getBalance } from "../api/userApi";
import { addBalance, deductBalance } from "../api/balanceApi";
import logoUrl from "../graph/logo.png";

function NavLink({
                     to,
                     label,
                     active,
                 }: {
    to: string;
    label: string;
    active: boolean;
}) {
    return (
        <Link
            to={to}
            style={{
                height: 44,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                borderRadius: 12,
                border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                background: active ? "var(--primary)" : "var(--surface-2)",
                color: active ? "var(--primary-contrast)" : "var(--text)",
                fontWeight: 700,
                textDecoration: "none",
            }}
        >
            {label}
        </Link>
    );
}

function formatBalance(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(2);

    if (value && typeof value === "object") {
        const v = value as any;
        const candidate =
            (typeof v.balance === "number" && Number.isFinite(v.balance) && v.balance) ||
            (typeof v.amount === "number" && Number.isFinite(v.amount) && v.amount);

        if (typeof candidate === "number") return candidate.toFixed(2);
    }

    if (value == null) return "—";
    if (typeof value === "string") return value;
    return String(value);
}

function tokenSubIsAdmin(token: string | null): boolean {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload?.sub === "admin";
    } catch {
        return false;
    }
}

export function AppLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();
    const token = localStorage.getItem("token");
    const isAdmin = tokenSubIsAdmin(token);
    const isActive = (path: string) => location.pathname.startsWith(path);



    const userId = useMemo(() => {
        const s = localStorage.getItem("userId");
        if (!s) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    }, []);

    const [balance, setBalance] = useState<unknown>(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);



    const onLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login", { replace: true });

    };

    async function onDeposit() {
        if (userId == null) return;
        const input = prompt("Ile chcesz wpłacić?");
        if (!input) return;

        const amount = Number(input);
        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Kwota musi być liczbą > 0");
            return;
        }

        try {
            await addBalance(userId, amount);
            await refreshBalance();
            alert("Wpłata OK");
        } catch (e: any) {
            alert(e?.response?.data?.message ?? e?.message ?? "Błąd wpłaty");
        }
    }

    async function onWithdraw() {
        if (userId == null) return;
        const input = prompt("Ile chcesz wypłacić?");
        if (!input) return;

        const amount = Number(input);
        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Kwota musi być liczbą > 0");
            return;
        }

        try {
            await deductBalance(userId, amount);
            await refreshBalance();
            alert("Wypłata OK");
        } catch (e: any) {
            alert(e?.response?.data?.message ?? e?.message ?? "Błąd wypłaty");
        }
    }

    async function refreshBalance() {
        if (userId == null) return;
        setLoadingBalance(true);
        setBalanceError(null);
        try {
            const b = await getBalance(userId);
            setBalance(b);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się pobrać salda.";
            setBalanceError(msg);
            setBalance(null);
        } finally {
            setLoadingBalance(false);
        }
    }

    useEffect(() => {
        refreshBalance();
        const id = setInterval(refreshBalance, 15000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <header
                style={{
                    background: "var(--surface)",
                    borderBottom: `1px solid var(--border)`,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    boxShadow: "var(--shadow)",
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {/* KAFEL LOGO */}
                            <Link
                                to="/"
                                style={{
                                    height: 44,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <img
                                    src={logoUrl}
                                    alt="FastBeciki"
                                    style={{
                                        height: 60,
                                        width: "auto",
                                        display: "block",
                                        padding: "0 10px",
                                    }}
                                />
                            </Link>

                            {/* KAFEL NAZWA */}
                            <Link
                                to="/"
                                style={{
                                    height: 44,
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 16px",
                                    borderRadius: 12,
                                    background: "var(--surface-2)",
                                    border: "1px solid var(--border)",
                                    fontWeight: 900,
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                FastBeciki.pl
                            </Link>
                        </div>


                        <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            {isAdmin && (
                                <NavLink to="/admin" label="Admin" active={isActive("/admin")} />
                            )}
                            <NavLink to="/bets" label="Kupony" active={isActive("/bets")} />
                            <NavLink to="/coupon/new" label="Nowy Kupon" active={isActive("/coupon")} />
                            <NavLink to="/profile" label="Profil" active={isActive("/profile")} />

                        </nav>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {/* SALDO */}
                        <div
                            style={{
                                height: 44,
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                borderRadius: 12,
                                border: `1px solid var(--border)`,
                                background: "var(--surface-2)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: "pointer",
                                gap: 10,
                            }}
                            title={balanceError ?? ""}
                        >
                            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Saldo</div>
                            <div style={{ fontWeight: 1000, fontVariantNumeric: "tabular-nums" }}>
                                {balanceError ? "błąd" : formatBalance(balance)}
                            </div>

                            <button
                                onClick={refreshBalance}
                                disabled={loadingBalance}
                                style={{
                                    padding: "6px 10px",
                                    borderRadius: 10,
                                    border: "1px solid var(--border)",
                                    background: "var(--surface)",
                                    color: "var(--text)",
                                    fontWeight: 900,
                                    cursor: loadingBalance ? "not-allowed" : "pointer",
                                }}
                            >
                                {loadingBalance ? "..." : "↻"}
                            </button>
                        </div>

                        {/* WPŁATA */}
                        <button
                            onClick={onDeposit}
                            style={{
                                height: 44,
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                borderRadius: 12,
                                border: `1px solid var(--border)`,
                                background: "var(--surface-2)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: "pointer",
                            }}
                        >
                            Wpłata
                        </button>

                        {/*WYPŁATA*/}
                        <button
                            onClick={onWithdraw}
                            style={{
                                height: 44,
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                borderRadius: 12,
                                border: `1px solid var(--border)`,
                                background: "var(--surface-2)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: "pointer",
                            }}
                        >
                            Wypłata
                        </button>

                        {/* THEME */}
                        <button
                            onClick={toggle}
                            style={{
                                height: 44,
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                borderRadius: 12,
                                border: `1px solid var(--border)`,
                                background: "var(--surface-2)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: "pointer",
                            }}
                            title="Zmien Tryb"
                        >
                            {theme === "dark" ? "🌙 Ciemny" : "☀️ Jasny"}
                        </button>


                        {/* LOGOUT */}
                        <button
                            onClick={onLogout}
                            style={{
                                height: 44,
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                borderRadius: 12,
                                border: `1px solid var(--border)`,
                                background: "var(--surface-2)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: "pointer",
                            }}
                        >
                            Wyloguj się
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 1200, margin: "0 auto", padding: 18 }}>
                <div
                    style={{
                        background: "var(--surface)",
                        border: `1px solid var(--border)`,
                        borderRadius: 18,
                        padding: 18,
                        boxShadow: "var(--shadow)",
                    }}
                >
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
