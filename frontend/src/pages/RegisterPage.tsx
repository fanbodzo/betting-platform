import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, registerApi, type RegisterRequest } from "../api/authApi";
import { getUsers } from "../api/userApi";
import { useTheme } from "../theme/useTheme";
import logo from "../graph/logo.png";

function isEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function RegisterPage() {
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();

    const [form, setForm] = useState<RegisterRequest>({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        personalIdNumber: "",
    });
    const [password2, setPassword2] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        if (!form.username.trim()) return false;
        if (!form.password) return false;
        if (form.password.length < 6) return false;
        if (form.password !== password2) return false;
        if (!form.email.trim() || !isEmail(form.email.trim())) return false;
        if (!form.firstName.trim()) return false;
        if (!form.lastName.trim()) return false;
        if (!form.personalIdNumber.trim()) return false;
        return true;
    }, [form, password2]);

    function set<K extends keyof RegisterRequest>(key: K, value: string) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    async function onRegister() {
        setErr(null);
        setLoading(true);

        try {
            await registerApi({
                username: form.username.trim(),
                password: form.password,
                email: form.email.trim(),
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                personalIdNumber: form.personalIdNumber.trim(),
            });

            // auto-login po rejestracji
            const { token } = await loginApi(form.username.trim(), form.password);
            localStorage.setItem("token", token);

            // ustaw userId tak jak w LoginPage (MVP)
            const users = await getUsers();
            const me = users.find((u: any) => u.email === form.email.trim() || u.username === form.username.trim());
            if (me) localStorage.setItem("userId", String(me.userId));

            navigate("/bets");
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Błąd rejestracji.";
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
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            fontWeight: 1000,
                            letterSpacing: 0.2,
                            padding: "8px 12px",
                            borderRadius: 12,
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <img src={logo} alt="FastBeciki.pl" style={{ width: 28, height: 28, objectFit: "contain" }} />
                        FastBeciki.pl
                    </div>

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
                        {theme === "dark" ? "Dark" : "☀ Light"}
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
                        maxWidth: 520,
                        borderRadius: 18,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        boxShadow: "var(--shadow)",
                        padding: 18,
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <img src={logo} alt="FastBeciki.pl" style={{ width: 120, height: "auto" }} />
                        <div style={{ fontSize: 24, fontWeight: 1000 }}>Załóż konto</div>
                        <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                            Uzupełnij dane i zarejestruj się w FastBeciki.pl
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <input
                            value={form.firstName}
                            onChange={(e) => set("firstName", e.target.value)}
                            placeholder="Imię"
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />
                        <input
                            value={form.lastName}
                            onChange={(e) => set("lastName", e.target.value)}
                            placeholder="Nazwisko"
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />

                        <input
                            value={form.username}
                            onChange={(e) => set("username", e.target.value)}
                            placeholder="Username"
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />
                        <input
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="Email"
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />

                        <input
                            value={form.personalIdNumber}
                            onChange={(e) => set("personalIdNumber", e.target.value)}
                            placeholder="PESEL / Personal ID"
                            style={{
                                gridColumn: "1 / -1",
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />

                        <input
                            value={form.password}
                            onChange={(e) => set("password", e.target.value)}
                            placeholder="Hasło (min 6 znaków)"
                            type="password"
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />
                        <input
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            placeholder="Powtórz hasło"
                            type="password"
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />
                    </div>

                    {err && (
                        <div
                            style={{
                                marginTop: 12,
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

                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button
                            onClick={onRegister}
                            disabled={loading || !canSubmit}
                            style={{
                                flex: 1,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid transparent",
                                background: "var(--primary)",
                                color: "var(--primary-contrast)",
                                fontWeight: 1000,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading || !canSubmit ? 0.7 : 1,
                            }}
                        >
                            {loading ? "Tworzenie konta..." : "Zarejestruj"}
                        </button>

                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "transparent",
                                color: "var(--text)",
                                fontWeight: 1000,
                                cursor: "pointer",
                            }}
                        >
                            Mam konto
                        </button>
                    </div>

                    <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
                        Rejestracja w MVP – dane są testowe.
                    </div>
                </div>
            </main>
        </div>
    );
}
