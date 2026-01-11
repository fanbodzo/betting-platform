import { useEffect, useMemo, useState } from "react";
import { getBets } from "../api/betsApi";

type BetStatus = "PENDING" | "LOST" | "WON" | "VOID";

type BetSelectionDto = {
    eventName: string;
    marketName: string;
    outcomeName: string;
    oddValue: number;
    status: BetStatus;
};

type BetDto = {
    betId: number;
    stake: number;
    totalOdd: number;
    potentialPayout: number;
    status: BetStatus;
    placedAt: string;
    selections: BetSelectionDto[];
};

const STATUSES: BetStatus[] = ["PENDING", "LOST", "WON", "VOID"];

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function fmt(n: number, digits = 2) {
    if (!Number.isFinite(n)) return String(n);
    return n.toFixed(digits);
}

function StatusPill({ status }: { status: BetStatus }) {

    const map: Record<BetStatus, { bg: string; fg: string; border: string }> = {
        PENDING: { bg: "var(--surface-2)", fg: "var(--text)", border: "var(--border)" },
        WON: { bg: "var(--primary)", fg: "var(--primary-contrast)", border: "transparent" },
        LOST: { bg: "transparent", fg: "var(--danger)", border: "var(--danger)" },
        VOID: { bg: "transparent", fg: "var(--muted)", border: "var(--border)" },
    };

    const s = map[status];

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${s.border}`,
                background: s.bg,
                color: s.fg,
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: 0.2,
            }}
        >
      {status}
    </span>
    );
}

function StatBox({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                borderRadius: 14,
                padding: 12,
                minWidth: 160,
            }}
        >
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 1000 }}>{value}</div>
        </div>
    );
}

function BetCard({ bet }: { bet: BetDto }) {
    const selections = bet.selections ?? [];

    return (
        <div
            style={{
                border: "1px solid var(--border)",
                background: "var(--surface)",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "var(--shadow)",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    padding: 14,
                    borderBottom: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                }}
            >
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 1000, fontSize: 16 }}>Kupon #{bet.betId}</div>
                        <StatusPill status={bet.status} />
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {selections.length} {selections.length === 1 ? "selekcja" : "selekcji"}
            </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                        Postawiono: {formatDate(bet.placedAt)}
                    </div>
                </div>

                <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)" }}>
                    Kurs łączny: <b style={{ color: "var(--text)" }}>{fmt(bet.totalOdd, 2)}</b>
                </div>
            </div>

            {/* STATS */}
            <div style={{ padding: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <StatBox label="Stawka" value={fmt(bet.stake, 2)} />
                <StatBox label="Kurs" value={fmt(bet.totalOdd, 2)} />
                <StatBox label="Potencjalna wygrana" value={fmt(bet.potentialPayout, 2)} />
            </div>

            {/* SELECTIONS */}
            <div style={{ padding: 14, paddingTop: 0 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900, marginBottom: 10 }}>
                    Selekcje
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {selections.map((s, idx) => (
                        <div
                            key={idx}
                            style={{
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                borderRadius: 16,
                                padding: 12,
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1fr) auto",
                                gap: 10,
                                alignItems: "center",
                            }}
                        >
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {s.eventName}
                                </div>
                                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                                    {s.marketName} — <b style={{ color: "var(--text)" }}>{s.outcomeName}</b>
                                </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 1000 }}>{fmt(s.oddValue, 2)}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.status}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function BetsPage() {
    const userId = useMemo(() => {
        const s = localStorage.getItem("userId");
        if (!s) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    }, []);

    const [status, setStatus] = useState<BetStatus>("PENDING");
    const [bets, setBets] = useState<BetDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load() {
        if (userId == null) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getBets(userId, status);
            setBets(Array.isArray(data) ? (data as BetDto[]) : []);
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ??
                e?.response?.statusText ??
                e?.message ??
                "Nie udało się pobrać kuponów.";
            setError(msg);
            setBets([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [userId, status]);

    if (userId == null) {
        return (
            <div>
                <h1 style={{ marginTop: 0 }}>Bets</h1>
                <p>Brak userId. Zaloguj się ponownie.</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1 style={{ margin: 0 }}>Bets</h1>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>userId: {userId}</div>
            </div>

            {/* FILTER BAR */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                }}
            >
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900 }}>
                    Status
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as BetStatus)}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--text)",
                        }}
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    onClick={load}
                    disabled={loading}
                    style={{
                        padding: "8px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        color: "var(--text)",
                        fontWeight: 1000,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Ładowanie..." : "Odśwież"}
                </button>

                <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
                    Kupony: <b style={{ color: "var(--text)" }}>{bets.length}</b>
                </div>
            </div>

            {error && <pre style={{ color: "var(--danger)", whiteSpace: "pre-wrap", margin: 0 }}>{error}</pre>}

            {loading ? (
                <p style={{ margin: 0 }}>Ładowanie...</p>
            ) : bets.length === 0 ? (
                <p style={{ margin: 0, color: "var(--muted)" }}>Brak kuponów dla wybranego statusu.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {bets.map((b) => (
                        <BetCard key={b.betId} bet={b} />
                    ))}
                </div>
            )}
        </div>
    );
}
