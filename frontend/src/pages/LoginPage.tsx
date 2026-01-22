import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { getUsers } from "../api/userApi";
import { useTheme } from "../theme/useTheme";
import { Link } from "react-router-dom";
import  logo  from "../graph/logo.png";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const navigate = useNavigate();
    const { theme, toggle } = useTheme();

    async function onLogin() {
        setErr(null);
        setLoading(true);

        try {
            const { token } = await loginApi(email, password);
            localStorage.setItem("token", token);

            // MVP: po tokenie i tak szukasz usera z /users
            const users = await getUsers();
            const me = users.find((u: any) => u.email === email || u.username === email);

            if (!me) {
                setErr("Nie znaleziono usera po loginie.");
                localStorage.removeItem("token");
                return;
            }

            localStorage.setItem("userId", String(me.userId));

            navigate("/bets");
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Błąd logowania.";
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
            {/* TOP BAR */}
            <header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface)",
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
                    <Link
                        to="/"
                        style={{
                            fontWeight: 1000,
                            letterSpacing: 0.2,
                            padding: "8px 12px",
                            borderRadius: 12,
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            textDecoration: "none",
                            color: "inherit",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        FastBeciki.pl
                    </Link>
                    <button
                        onClick={toggle}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            color: "var(--text)",
                            fontWeight: 900,
                            cursor: "pointer",
                        }}
                    >
                        {theme === "dark" ? " Ciemny" : " Jasny"}
                    </button>
                </div>
            </header>

            {/* CENTER CARD */}
            <main
                style={{
                    minHeight: "calc(100vh - 64px)",
                    display: "grid",
                    placeItems: "center",
                    padding: 18,
                }}
            >
                <div
                    style={{
                        width: "100%",
                        maxWidth: 440,
                        borderRadius: 18,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        boxShadow: "var(--shadow)",
                        padding: 18,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 18,
                        }}
                    >
                        <img
                            src={logo}
                            alt="FastBeciki.pl"
                            style={{
                                width: 120,
                                height: "auto",
                            }}
                        />

                        <div
                            style={{
                                fontSize: 26,
                                fontWeight: 1000,
                                letterSpacing: 0.4,
                            }}
                        >
                            FastBeciki.pl
                        </div>

                        <div
                            style={{
                                fontSize: 13,
                                color: "var(--muted)",
                            }}
                        >
                            Zaloguj się do panelu
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Email / Username</span>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="np. test@test.com"
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    border: "1px solid var(--border)",
                                    background: "var(--surface-2)",
                                    color: "var(--text)",
                                    outline: "none",
                                }}
                            />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Hasło</span>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                type="password"
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    border: "1px solid var(--border)",
                                    background: "var(--surface-2)",
                                    color: "var(--text)",
                                    outline: "none",
                                }}
                            />
                        </label>

                        {err && (
                            <div
                                style={{
                                    border: "1px solid var(--danger)",
                                    color: "var(--danger)",
                                    borderRadius: 12,
                                    padding: 10,
                                    background: "transparent",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {err}
                            </div>
                        )}

                        <button
                            onClick={onLogin}
                            disabled={loading || !email || !password}
                            style={{
                                marginTop: 4,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid transparent",
                                background: "var(--primary)",
                                color: "var(--primary-contrast)",
                                fontWeight: 1000,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading || !email || !password ? 0.7 : 1,
                            }}
                        >
                            {loading ? "Logowanie..." : "Zaloguj"}
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            style={{
                                marginTop: 10,
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "transparent",
                                color: "var(--text)",
                                fontWeight: 1000,
                                cursor: "pointer",
                            }}
                        >
                            Nie mam konta – rejestracja
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
