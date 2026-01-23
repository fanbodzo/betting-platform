//import React, { useEffect, useState } from "react";
import { fetchTeamStats } from "../api/generatorApi";
import type { TeamStatsResponse } from "../api/generatorApi";
import React, { useEffect, useMemo, useRef, useState } from "react";


function TeamSelect({
                        teams,
                        value,
                        onChange,
                        placeholder = "Wybierz drużynę…",
                    }: {
    teams: string[];
    value: string;
    onChange: (team: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const rootRef = useRef<HTMLDivElement | null>(null);

    const filtered = useMemo(() => {
        const qq = q.trim().toLowerCase();
        if (!qq) return teams;
        return teams.filter((t) => t.toLowerCase().includes(qq));
    }, [teams, q]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div ref={rootRef} style={{ position: "relative", flex: 1, minWidth: 260 }}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: "100%",
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 12px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    fontWeight: 800,
                    cursor: "pointer",
                }}
            >
        <span style={{ opacity: value ? 1 : 0.7 }}>
          {value || placeholder}
        </span>
                <span style={{ opacity: 0.7 }}>▾</span>
            </button>

            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: 50,
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        borderRadius: 14,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        boxShadow: "var(--shadow)",
                        overflow: "hidden",
                    }}
                >
                    <div style={{ padding: 10, borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Szukaj drużyny…"
                            style={{
                                width: "100%",
                                height: 40,
                                padding: "0 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)",
                                outline: "none",
                                fontWeight: 700,
                            }}
                        />
                    </div>

                    <div style={{ maxHeight: 260, overflow: "auto" }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: 12, color: "var(--muted)", fontWeight: 800 }}>
                                Brak wyników
                            </div>
                        ) : (
                            filtered.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                        onChange(t);
                                        setOpen(false);
                                        setQ("");
                                    }}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "10px 12px",
                                        border: "none",
                                        background: t === value ? "var(--surface-2)" : "transparent",
                                        color: "var(--text)",
                                        cursor: "pointer",
                                        fontWeight: 800,
                                    }}
                                >
                                    {t}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}



export default function TeamStatsPage() {
    const [teamName, setTeamName] = useState<string>("");
    const [query, setQuery] = useState<string>("");

    const [data, setData] = useState<TeamStatsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [err, setErr] = useState<string>("");
    const TEAMS = [
        "Alavés",
        "Almería",
        "Arsenal",
        "Aston Villa",
        "Athletic Club",
        "Atlético Madrid",
        "Barcelona",
        "Betis",
        "Bournemouth",
        "Brentford",
        "Brighton",
        "Burnley",
        "Cádiz",
        "Celta Vigo",
        "Chelsea",
        "Crystal Palace",
        "Eibar",
        "Elche",
        "Espanyol",
        "Everton",
        "Fulham",
        "Getafe",
        "Girona",
        "Granada",
        "Huesca",
        "Ipswich Town",
        "Las Palmas",
        "Leeds United",
        "Leganés",
        "Leicester City",
        "Levante",
        "Liverpool",
        "Luton Town",
        "Mallorca",
        "Manchester City",
        "Manchester Utd",
        "Newcastle Utd",
        "Norwich City",
        "Osasuna",
        "Rayo Vallecano",
        "Real Madrid",
        "Real Sociedad",
        "Sevilla",
        "Sheffield Utd",
        "Southampton",
        "Tottenham",
        "Valencia",
        "Valladolid",
        "Villarreal",
        "Watford",
        "West Brom",
        "West Ham",
        "Wolves",
    ];


    useEffect(() => {
        if (!query) return;

        let cancelled = false;

        setLoading(true);
        setErr("");
        setData(null);

        fetchTeamStats(query)
            .then((json) => {
                if (!cancelled) setData(json);
            })
            .catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : "Błąd pobierania statystyk";
                if (!cancelled) setErr(msg);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [query]);
    //Do wczesniejszego uzywalem wyszukiwania
    /*
    function onSearch(): void {
        if (!canSearch) return;
        setQuery(teamName.trim());
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
        if (e.key === "Enter") onSearch();
    }

     */

    return (
        <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ marginBottom: 12 }}>Statystyki drużyny</h2>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                <TeamSelect
                    teams={TEAMS}
                    value={teamName}
                    onChange={(t) => {
                        setTeamName(t);
                        setQuery(t); // auto-fetch
                    }}
                />

                <button
                    className="btn-primary"
                    onClick={() => teamName.trim() && setQuery(teamName.trim())}
                    disabled={!teamName.trim() || loading}
                >
                    {loading ? "Ładuję..." : "Szukaj"}
                </button>
            </div>


            {err && (
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(255,0,0,0.12)", marginBottom: 12 }}>
                    {err}
                </div>
            )}

            {!loading && !err && !data && <div style={{ opacity: 0.8 }}>Wpisz nazwę drużyny i kliknij <b>Szukaj</b>.</div>}

            {data && (
                <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)" }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{data.teamName}</div>
                        <div style={{ opacity: 0.75, marginTop: 4 }}>Ostatnie 5 meczów</div>
                    </div>

                    <div style={{
                        overflowX: "auto",
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        boxShadow: "var(--shadow)",
                    }}>
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 800 }}>
                            <thead>
                            <tr style={{ textAlign: "left" }}>
                                <th style={th}>Data</th>
                                <th style={th}>Rywal</th>
                                <th style={th}>Venue</th>
                                <th style={th}>Gole</th>
                                <th style={th}>Stracone</th>
                                <th style={th}>xG</th>
                                <th style={th}>xG Conceded</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(data.last5Matches ?? []).map((m, idx) => (
                                <tr
                                    key={`${m.date}-${m.opponent}-${idx}`}
                                    style={{
                                        background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                                    }}
                                    onMouseEnter={(e) => ((e.currentTarget.style.filter = "brightness(0.98)"))}
                                    onMouseLeave={(e) => ((e.currentTarget.style.filter = "none"))}
                                >
                                    <td style={td}>{m.date}</td>
                                    <td style={td}>{m.opponent}</td>
                                    <td style={td}>{m.venue}</td>
                                    <td style={td}>{m.goalsScored}</td>
                                    <td style={td}>{m.goalsConceded}</td>
                                    <td style={td}>{formatNum(m.xG)}</td>
                                    <td style={td}>{formatNum(m.xGConceded)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: 14,
                        }}
                    >
                        {(data.last5Matches ?? []).map((m, idx) => (
                            <div key={`${m.date}-${m.opponent}-card-${idx}`} style={card}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <b>{m.opponent}</b>
                                    <span style={{ opacity: 0.75 }}>{m.date}</span>
                                </div>
                                <div style={{ marginTop: 8, opacity: 0.85 }}>
                                    {m.venue} • {m.goalsScored}:{m.goalsConceded}
                                </div>
                                <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                                    xG: {formatNum(m.xG)} • xGA: {formatNum(m.xGConceded)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const th: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    padding: "12px 12px",
    textAlign: "left",
    fontWeight: 1000,
    fontSize: 12,
    letterSpacing: 0.3,
    color: "var(--muted)",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
    padding: "12px 12px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
    fontWeight: 700,
    whiteSpace: "nowrap",
};
const card: React.CSSProperties = {
    padding: 14,
    borderRadius: 16,
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    boxShadow: "var(--shadow)",
};

function formatNum(n: unknown): string {
    if (typeof n !== "number" || Number.isNaN(n)) return "-";
    return n.toFixed(2);
}
