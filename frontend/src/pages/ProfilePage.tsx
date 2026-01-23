import { useEffect, useMemo, useState } from "react";
import { getUsers } from "../api/userApi";

type UserDto = {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    cashBalance: number;
    bonusBalance: number;
    roles: string[];
};

function fmtMoney(n: unknown): string {
    const x = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(x)) return "—";
    return x.toFixed(2);
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                borderRadius: 16,
                padding: 14,
                boxShadow: "var(--shadow)",
                minWidth: 200,
            }}
        >
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 1000, fontVariantNumeric: "tabular-nums" }}>{value}</div>
        </div>
    );
}

export function ProfilePage() {
    const userId = useMemo(() => {
        const s = localStorage.getItem("userId");
        if (!s) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    }, []);

    const [me, setMe] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        if (userId == null) return;
        setLoading(true);
        setErr(null);

        try {
            const users = await getUsers();
            const arr = Array.isArray(users) ? (users as UserDto[]) : [];
            const found = arr.find((u) => Number(u.userId) === userId) ?? null;

            if (!found) {
                setErr("Nie znaleziono użytkownika po userId. Zaloguj się ponownie.");
                setMe(null);
            } else {
                setMe(found);
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ??
                e?.response?.statusText ??
                e?.message ??
                "Nie udało się pobrać profilu.";
            setErr(msg);
            setMe(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    if (userId == null) {
        return (
            <div>
                <h1 style={{ marginTop: 0 }}>Profil</h1>
                <p>Brak userId. Zaloguj się ponownie.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1 style={{ margin: 0 }}>Profil</h1>

                <button
                    onClick={load}
                    disabled={loading}
                    style={{
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 12px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text)",
                        fontWeight: 900,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Ładowanie..." : "Odśwież"}
                </button>
            </div>

            {err && <pre style={{ margin: 0, color: "var(--danger)", whiteSpace: "pre-wrap" }}>{err}</pre>}

            {loading && !me ? (
                <p style={{ margin: 0 }}>Ładowanie profilu...</p>
            ) : !me ? (
                <p style={{ margin: 0, color: "var(--muted)" }}>Brak danych profilu.</p>
            ) : (
                <>
                    {/* HEADER CARD */}
                    <div
                        style={{
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                            borderRadius: 18,
                            padding: 16,
                            boxShadow: "var(--shadow)",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 14,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ minWidth: 260 }}>
                            <div style={{ fontSize: 18, fontWeight: 1000 }}>
                                {me.firstName} {me.lastName}
                            </div>
                            <div style={{ marginTop: 4, color: "var(--muted)", fontWeight: 900 }}>
                                @{me.username} • {me.email}
                            </div>

                        </div>


                    </div>

                    {/* BALANCES */}
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <StatBox label="Saldo" value={fmtMoney(me.cashBalance)} />
                        <StatBox label="Saldo bonusowe" value={fmtMoney(me.bonusBalance)} />
                        <StatBox label="Razem" value={fmtMoney((me.cashBalance ?? 0) + (me.bonusBalance ?? 0))} />
                    </div>
                </>
            )}
        </div>
    );
}
