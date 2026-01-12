import { useEffect, useMemo, useState } from "react";
import {
    adminCreateEvent,
    deleteEventById,
    getEvents,
    type EventDto,
    type EventStatus,
} from "../api/eventsApi";

import { getUsers, getBalance } from "../api/userApi";
import { getBets } from "../api/betsApi";
import { settleMarket } from "../api/adminApi";
import { EventCard } from "../components/EventCard";

type Tab = "CREATE" | "DELETE" | "USERS" | "SETTLE";

type BetStatus = "PENDING" | "LOST" | "WIN" | "VOID";

function toBackendLocalDateTime(input: string): string {
    // datetime-local: "2026-01-11T17:30" -> backend: "2026-01-11T17:30:00"
    if (!input) return input;
    return input.length === 16 ? `${input}:00` : input;
}

function formatBalance(value: unknown): string {
    if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(2);
    if (value && typeof value === "object") {
        const v = value as any;
        if (typeof v.balance === "number" && Number.isFinite(v.balance)) return v.balance.toFixed(2);
        if (typeof v.amount === "number" && Number.isFinite(v.amount)) return v.amount.toFixed(2);
    }
    if (value == null) return "—";
    return String(value);
}

function TabButton({
                       active,
                       label,
                       onClick,
                   }: {
    active: boolean;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "10px 12px",
                borderRadius: 999,
                border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                background: active ? "var(--primary)" : "transparent",
                color: active ? "var(--primary-contrast)" : "var(--text)",
                fontWeight: 1000,
                cursor: "pointer",
            }}
        >
            {label}
        </button>
    );
}

export function AdminPage() {
    const [tab, setTab] = useState<Tab>("CREATE");

    // ---- EVENTS: shared state
    const [status, setStatus] = useState<EventStatus>("UPCOMING");
    const [events, setEvents] = useState<EventDto[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [eventsErr, setEventsErr] = useState<string | null>(null);

    // ---- CREATE EVENT
    const [eventName, setEventName] = useState("");
    const [startTime, setStartTime] = useState(""); // datetime-local string
    const [creating, setCreating] = useState(false);

    // ---- DELETE EVENT (double confirm)
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // ---- USERS
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersErr, setUsersErr] = useState<string | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [usersRows, setUsersRows] = useState<
        Array<{ userId: number; label: string; balance: string; betsCount: number }>
    >([]);
    const [loadingUserRows, setLoadingUserRows] = useState(false);

    // default startTime = now + 1h
    useEffect(() => {
        if (startTime) return;

        const d = new Date();
        d.setHours(d.getHours() + 1);

        const pad = (n: number) => String(n).padStart(2, "0");
        const v = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
            d.getHours()
        )}:${pad(d.getMinutes())}`;

        setStartTime(v);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

// reset scroll przy zmianie zakładki/statusu
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [tab, status]);

// wyczyść "potwierdź usuwanie" przy zmianie listy
    useEffect(() => {
        setConfirmDeleteId(null);
    }, [tab, status, events.length]);


    async function loadEvents() {
        setLoadingEvents(true);
        setEventsErr(null);
        try {
            const data = await getEvents(status);
            setEvents(Array.isArray(data) ? data : []);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się pobrać eventów.";
            setEventsErr(msg);
            setEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    }

    // ładowanie eventów tylko gdy jesteśmy na zakładkach eventowych
    useEffect(() => {
        if (tab === "CREATE" || tab === "DELETE" || tab == "SETTLE") {
            loadEvents();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, tab]);

    async function onCreate() {
        if (!eventName.trim()) return setEventsErr("Event name jest wymagany.");
        if (!startTime.trim()) return setEventsErr("Start time jest wymagany.");

        setCreating(true);
        setEventsErr(null);
        try {
            await adminCreateEvent({
                eventName: eventName.trim(),
                startTime: toBackendLocalDateTime(startTime.trim()),
            });
            setEventName("");
            await loadEvents();
            // po dodaniu przerzuć na listę usuwania, jak chcesz:
            // setTab("DELETE");
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się dodać meczu.";
            setEventsErr(msg);
        } finally {
            setCreating(false);
        }
    }

    async function onDelete(id: number) {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }

        setDeletingId(id);
        setEventsErr(null);
        try {
            await deleteEventById(id);
            setConfirmDeleteId(null);
            await loadEvents();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się usunąć meczu.";
            setEventsErr(msg);
        } finally {
            setDeletingId(null);
        }
    }

    async function loadUsers() {
        setUsersLoading(true);
        setUsersErr(null);
        try {
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się pobrać użytkowników.";
            setUsersErr(msg);
            setUsers([]);
        } finally {
            setUsersLoading(false);
        }
    }

    async function loadUsersRows() {
        setLoadingUserRows(true);
        setUsersErr(null);

        try {
            // MVP: dla każdego usera bierzemy saldo + liczbę kuponów (suma wszystkich statusów)
            const rows = await Promise.all(
                users.map(async (u: any) => {
                    const userId = Number(u.userId ?? u.id);
                    const label = u.email ?? u.username ?? `userId ${userId}`;

                    let bal: unknown = null;
                    let totalBets = 0;

                    try {
                        bal = await getBalance(userId);
                    } catch {
                        // ignore, pokażemy "błąd" jako —
                    }

                    // liczenie kuponów: sumujemy po statusach
                    const statuses: BetStatus[] = ["PENDING", "LOST", "WIN", "VOID"];
                    for (const st of statuses) {
                        try {
                            const b = await getBets(userId, st);
                            totalBets += Array.isArray(b) ? b.length : 0;
                        } catch {
                            // ignore
                        }
                    }

                    return {
                        userId,
                        label,
                        balance: formatBalance(bal),
                        betsCount: totalBets,
                    };
                })
            );

            // sort: najwięcej kuponów na górze
            rows.sort((a, b) => b.betsCount - a.betsCount);
            setUsersRows(rows);
        } finally {
            setLoadingUserRows(false);
        }
    }

    function SettlePanel() {
        const [status, setStatus] = useState<EventStatus>("UPCOMING");
        const [events, setEvents] = useState<EventDto[]>([]);
        const [loading, setLoading] = useState(false);
        const [err, setErr] = useState<string | null>(null);

        const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
        const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
        const [selectedWinningOddId, setSelectedWinningOddId] = useState<number | null>(null);

        const selectedEvent = useMemo(
            () => events.find((e) => e.eventId === selectedEventId) ?? null,
            [events, selectedEventId]
        );

        const selectedMarket = useMemo(
            () => selectedEvent?.markets.find((m) => m.marketId === selectedMarketId) ?? null,
            [selectedEvent, selectedMarketId]
        );

        async function refresh() {
            setLoading(true);
            setErr(null);
            try {
                const e = await getEvents(status);
                setEvents(e);
            } catch (e: any) {
                setErr(e?.response?.data?.message ?? e?.message ?? "Nie udało się pobrać eventów.");
                setEvents([]);
            } finally {
                setLoading(false);
            }
        }

        async function onSettle() {
            if (!selectedMarketId || !selectedWinningOddId) {
                setErr("Wybierz market i zwycięski odd.");
                return;
            }

            setLoading(true);
            setErr(null);
            try {
                await settleMarket(selectedMarketId, selectedWinningOddId);
                alert("Market rozliczony ✅");
                // po rozliczeniu odśwież listę (czasem statusy się zmieniają)
                await refresh();
            } catch (e: any) {
                setErr(e?.response?.data?.message ?? e?.message ?? "Nie udało się rozliczyć marketu.");
            } finally {
                setLoading(false);
            }
        }

        // startowo: pobierz po pierwszym renderze (albo kliknij "Odśwież")
        // jeśli w AdminPage masz już globalny refresh, możesz to wywalić
        // i sterować z zewnątrz.
        // (Tu minimalnie: user kliknie Odśwież)
        return (
            <div style={{ display: "flex", gap: 16 }}>
                {/* LEWA: lista eventów */}
                <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 14, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontWeight: 900 }}>Eventy</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Status</span>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value as EventStatus);
                                    setSelectedEventId(null);
                                    setSelectedMarketId(null);
                                    setSelectedWinningOddId(null);
                                }}
                            >
                                <option value="UPCOMING">UPCOMING</option>
                                <option value="LIVE">LIVE</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="FINISHED">FINISHED</option>
                            </select>
                            <button onClick={refresh} disabled={loading}>
                                {loading ? "..." : "Odśwież"}
                            </button>
                        </div>
                    </div>

                    {err && <div style={{ marginTop: 10, color: "crimson", whiteSpace: "pre-wrap" }}>{err}</div>}

                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        {events.length === 0 ? (
                            <div style={{ color: "var(--muted)" }}>Brak eventów (kliknij Odśwież).</div>
                        ) : (
                            events.map((ev) => {
                                const active = selectedEventId === ev.eventId;

                                return (
                                    <div
                                        key={ev.eventId}
                                        onClick={() => {
                                            setSelectedEventId(ev.eventId);
                                            setSelectedMarketId(null);
                                            setSelectedWinningOddId(null);
                                        }}
                                        style={{
                                            borderRadius: 14,
                                            outline: active ? "2px solid var(--primary)" : "2px solid transparent",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <EventCard
                                            event={ev}
                                            mode="SETTLE"
                                            selectedWinningOddId={selectedWinningOddId}
                                            onSelectWinningOdd={(marketId, oddId) => {
                                                setSelectedEventId(ev.eventId);
                                                setSelectedMarketId(marketId);
                                                setSelectedWinningOddId(oddId);
                                            }}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* PRAWA: market + wybór wyniku */}
                <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 14, padding: 12 }}>
                    <div style={{ fontWeight: 900, marginBottom: 10 }}>Rozliczanie</div>

                    {!selectedEvent ? (
                        <div style={{ color: "var(--muted)" }}>Wybierz event po lewej.</div>
                    ) : (
                        <>
                            <div style={{ fontWeight: 900 }}>{selectedEvent.eventName}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                                eventId: {selectedEvent.eventId}
                            </div>

                            <div style={{ fontWeight: 900, marginBottom: 6 }}>Market</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                                {selectedEvent.markets.map((m) => (
                                    <button
                                        key={m.marketId}
                                        onClick={() => {
                                            setSelectedMarketId(m.marketId);
                                            setSelectedWinningOddId(null);
                                        }}
                                        style={{
                                            textAlign: "left",
                                            padding: "10px 12px",
                                            borderRadius: 12,
                                            border: "1px solid var(--border)",
                                            background: m.marketId === selectedMarketId ? "var(--surface-2)" : "transparent",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div style={{ fontWeight: 900 }}>{m.marketName}</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>marketId: {m.marketId}</div>
                                    </button>
                                ))}
                            </div>

                            {!selectedMarket ? (
                                <div style={{ color: "var(--muted)" }}>Wybierz market.</div>
                            ) : (
                                <>
                                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Zwycięski wynik</div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {selectedMarket.odds.map((o) => (
                                            <label
                                                key={o.oddId}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    border: "1px solid var(--border)",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="winningOdd"
                                                    checked={selectedWinningOddId === o.oddId}
                                                    onChange={() => setSelectedWinningOddId(o.oddId)}
                                                />
                                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                    <div>
                                                        <div style={{ fontWeight: 900 }}>{o.outcomeName}</div>
                                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>oddId: {o.oddId}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 900 }}>{o.oddValue.toFixed(2)}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 12 }}>
                                        <button onClick={onSettle} disabled={loading || !selectedWinningOddId}>
                                            {loading ? "..." : "Rozlicz market"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }



    useEffect(() => {
        if (tab !== "USERS") return;
        loadUsers();
    }, [tab]);

    // gdy mamy users i tab USERS, policz saldo/kupony
    useEffect(() => {
        if (tab !== "USERS") return;
        if (users.length === 0) {
            setUsersRows([]);
            return;
        }
        loadUsersRows();
    }, [users, tab]);

    const headerRight = useMemo(() => {
        if (tab === "USERS") {
            return (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    Użytkownicy: <b style={{ color: "var(--text)" }}>{users.length}</b>
                </div>
            );
        }

        return (
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Eventy: <b style={{ color: "var(--text)" }}>{events.length}</b>
            </div>
        );
    }, [tab, users.length, events.length]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h1 style={{ margin: 0 }}>Admin</h1>
                {headerRight}
            </div>

            {/* TABS */}
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
                <TabButton active={tab === "CREATE"} label="Dodaj mecz" onClick={() => setTab("CREATE")} />
                <TabButton active={tab === "DELETE"} label="Usuń mecze" onClick={() => setTab("DELETE")} />
                <TabButton active={tab === "USERS"} label="Użytkownicy" onClick={() => setTab("USERS")} />
                <TabButton active={tab === "SETTLE"} label="Rozlicz" onClick={() => setTab("SETTLE")} />


                {/* status select tylko dla event tabów */}
                {(tab === "CREATE" || tab === "DELETE") && (
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 900, marginLeft: "auto" }}>
                        Status
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as EventStatus)}
                            style={{
                                padding: "8px 10px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)",
                            }}
                        >
                            <option value="UPCOMING">UPCOMING</option>
                            <option value="LIVE">LIVE</option>
                            <option value="FINISHED">FINISHED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </label>
                )}

                {/* refresh button */}
                {tab === "USERS" ? (
                    <button
                        onClick={loadUsers}
                        disabled={usersLoading}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--text)",
                            fontWeight: 1000,
                            cursor: usersLoading ? "not-allowed" : "pointer",
                        }}
                    >
                        {usersLoading ? "Ładowanie..." : "Odśwież użytkowników"}
                    </button>
                ) : (
                    <button
                        onClick={loadEvents}
                        disabled={loadingEvents}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 12,
                            border: "1px solid var(--border)",
                            background: "var(--surface)",
                            color: "var(--text)",
                            fontWeight: 1000,
                            cursor: loadingEvents ? "not-allowed" : "pointer",
                        }}
                    >
                        {loadingEvents ? "Ładowanie..." : "Odśwież eventy"}
                    </button>
                )}
            </div>

            {/* ERRORS */}
            {eventsErr && tab !== "USERS" && (
                <pre style={{ margin: 0, color: "var(--danger)", whiteSpace: "pre-wrap" }}>{eventsErr}</pre>
            )}
            {usersErr && tab === "USERS" && (
                <pre style={{ margin: 0, color: "var(--danger)", whiteSpace: "pre-wrap" }}>{usersErr}</pre>
            )}

            {/* TAB CONTENT */}
            {tab === "CREATE" && (
                <div
                    style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        borderRadius: 18,
                        padding: 14,
                        boxShadow: "var(--shadow)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <div style={{ fontWeight: 1000 }}>Dodaj mecz</div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            placeholder="Nazwa eventu (np. Real vs Barca)"
                            style={{
                                flex: 1,
                                minWidth: 260,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />
                        <input
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            type="datetime-local"
                            style={{
                                flex: 1,
                                minWidth: 260,
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface-2)",
                                color: "var(--text)",
                            }}
                        />
                        <button
                            onClick={onCreate}
                            disabled={creating}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 12,
                                border: "1px solid transparent",
                                background: "var(--primary)",
                                color: "var(--primary-contrast)",
                                fontWeight: 1000,
                                cursor: creating ? "not-allowed" : "pointer",
                                opacity: creating ? 0.7 : 1,
                            }}
                        >
                            {creating ? "Dodawanie..." : "Dodaj"}
                        </button>
                    </div>
                </div>
            )}

            {tab === "DELETE" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {loadingEvents ? (
                        <p style={{ margin: 0 }}>Ładowanie...</p>
                    ) : events.length === 0 ? (
                        <p style={{ margin: 0, color: "var(--muted)" }}>Brak eventów.</p>
                    ) : (
                        events.map((ev) => (
                            <div
                                key={ev.eventId}
                                style={{
                                    border: "1px solid var(--border)",
                                    background: "var(--surface)",
                                    borderRadius: 18,
                                    padding: 14,
                                    boxShadow: "var(--shadow)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {ev.eventName}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                                        eventId: <b style={{ color: "var(--text)" }}>{ev.eventId}</b> • start: {String(ev.startTime)}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    {confirmDeleteId === ev.eventId ? (
                                        <>
                                            <button
                                                onClick={() => onDelete(ev.eventId)}
                                                disabled={deletingId === ev.eventId}
                                                style={{
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    border: "1px solid var(--danger)",
                                                    background: "var(--danger)",
                                                    color: "white",
                                                    fontWeight: 1000,
                                                    cursor: deletingId === ev.eventId ? "not-allowed" : "pointer",
                                                    opacity: deletingId === ev.eventId ? 0.7 : 1,
                                                }}
                                            >
                                                {deletingId === ev.eventId ? "Usuwanie..." : "Potwierdź"}
                                            </button>

                                            <button
                                                onClick={() => setConfirmDeleteId(null)}
                                                disabled={deletingId === ev.eventId}
                                                style={{
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    border: "1px solid var(--border)",
                                                    background: "transparent",
                                                    color: "var(--text)",
                                                    fontWeight: 1000,
                                                    cursor: deletingId === ev.eventId ? "not-allowed" : "pointer",
                                                    opacity: deletingId === ev.eventId ? 0.7 : 1,
                                                }}
                                            >
                                                Anuluj
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => onDelete(ev.eventId)}
                                            style={{
                                                padding: "10px 12px",
                                                borderRadius: 12,
                                                border: "1px solid var(--danger)",
                                                background: "transparent",
                                                color: "var(--danger)",
                                                fontWeight: 1000,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Usuń
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === "USERS" && (
                <div
                    style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        borderRadius: 18,
                        padding: 14,
                        boxShadow: "var(--shadow)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                        <div style={{ fontWeight: 1000 }}>Użytkownicy</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            {loadingUserRows ? "Liczenie..." : `Rekordy: ${usersRows.length}`}
                        </div>
                    </div>

                    {usersLoading ? (
                        <p style={{ marginTop: 12 }}>Ładowanie użytkowników...</p>
                    ) : users.length === 0 ? (
                        <p style={{ marginTop: 12, color: "var(--muted)" }}>Brak użytkowników.</p>
                    ) : loadingUserRows ? (
                        <p style={{ marginTop: 12 }}>Liczenie sald i kuponów...</p>
                    ) : (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                            {usersRows.map((r) => (
                                <div
                                    key={r.userId}
                                    style={{
                                        border: "1px solid var(--border)",
                                        background: "var(--surface-2)",
                                        borderRadius: 16,
                                        padding: 12,
                                        display: "grid",
                                        gridTemplateColumns: "minmax(0, 1fr) auto auto",
                                        gap: 12,
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {r.label}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>userId: {r.userId}</div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Saldo</div>
                                        <div style={{ fontWeight: 1000, fontVariantNumeric: "tabular-nums" }}>{r.balance}</div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Kupony</div>
                                        <div style={{ fontWeight: 1000, fontVariantNumeric: "tabular-nums" }}>{r.betsCount}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {tab === "SETTLE" && (
                <div
                    style={{
                        border: "1px solid var(--border)",
                        background: "var(--surface)",
                        borderRadius: 18,
                        padding: 14,
                        boxShadow: "var(--shadow)",
                    }}
                >
                    <SettlePanel />
                </div>
            )}

        </div>
    );
}