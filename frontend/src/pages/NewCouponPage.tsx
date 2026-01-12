import { useEffect, useMemo, useState } from "react";
import { getEvents, type EventDto, type EventStatus } from "../api/eventsApi";
import { addToCoupon, clearCoupon, getCoupon, type CouponDto } from "../api/couponApi";
import { placeBet } from "../api/betsApi";
import { EventCard } from "../components/EventCard";

const STATUSES: EventStatus[] = ["CANCELLED", "UPCOMING", "LIVE", "FINISHED"];

export function NewCouponPage() {
    const userId = useMemo(() => {
        const s = localStorage.getItem("userId");
        if (!s) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    }, []);

    const [status, setStatus] = useState<EventStatus>("UPCOMING");
    const [events, setEvents] = useState<EventDto[]>([]);
    const [coupon, setCoupon] = useState<CouponDto | null>(null);

    const [stake, setStake] = useState<string>("10");
    const [placing, setPlacing] = useState(false);

    const [loadingEvents, setLoadingEvents] = useState(false);
    const [loadingCoupon, setLoadingCoupon] = useState(false);

    const [eventsError, setEventsError] = useState<string | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    const [addingOddId, setAddingOddId] = useState<number | null>(null);

    //do filtrow
    const [q, setQ] = useState<string>("");

    const [dateFrom, setDateFrom] = useState<string>(""); // "YYYY-MM-DD"
    const [dateTo, setDateTo] = useState<string>("");

    const [oddMin, setOddMin] = useState<string>("");
    const [oddMax, setOddMax] = useState<string>("");


    async function refreshCoupon() {
        if (userId === null) return;
        setLoadingCoupon(true);
        setCouponError(null);
        try {
            const c = await getCoupon(userId);
            setCoupon(c);
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się pobrać kuponu.";
            setCouponError(msg);
            setCoupon(null);
        } finally {
            setLoadingCoupon(false);
        }
    }

    async function loadEvents(s: EventStatus) {
        setLoadingEvents(true);
        setEventsError(null);
        try {
            const e = await getEvents(s);
            setEvents(e);
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? err?.message ?? "Nie udało się pobrać eventów.";
            setEventsError(msg);
            setEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    }

    useEffect(() => {
        loadEvents(status);
    }, [status]);

    useEffect(() => {
        refreshCoupon();

    }, [userId]);

    async function onClearCoupon() {
        if (userId === null) return;
        setCouponError(null);
        try {
            await clearCoupon(userId);
            await refreshCoupon();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się wyczyścić kuponu.";
            setCouponError(msg);
        }
    }

    async function onAddOdd(oddId: number) {
        if (userId === null) return;

        setAddingOddId(oddId);
        setCouponError(null);
        try {
            await addToCoupon(userId, oddId);
            await refreshCoupon();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się dodać do kuponu.";
            setCouponError(msg);
        } finally {
            setAddingOddId(null);
        }
    }

    async function onPlaceBet() {
        if (userId === null) return;

        const stakeNumber = Number(stake);
        if (!Number.isFinite(stakeNumber) || stakeNumber <= 0) {
            setCouponError("Stake musi być liczbą > 0.");
            return;
        }

        setPlacing(true);
        setCouponError(null);
        try {
            await placeBet(userId, stakeNumber);
            await refreshCoupon();
            alert("Kupon postawiony!");
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? "Nie udało się postawić kuponu.";
            setCouponError(msg);
        } finally {
            setPlacing(false);
        }
    }

    if (userId === null) {
        return (
            <div>
                <h1 style={{ marginTop: 0 }}>New coupon</h1>
                <p>Brak userId. Zaloguj się ponownie.</p>
            </div>
        );
    }

    const selectedOddIds = new Set(coupon?.selections.map((s) => s.oddId) ?? []);

    function parseIsoDateSafe(value: string): number | null {
        const t = Date.parse(value);
        return Number.isFinite(t) ? t : null;
    }

// dateFrom/dateTo są w formacie YYYY-MM-DD z inputa.
// Żeby "do" działało intuicyjnie, ustawiamy koniec dnia.
    function parseDayStart(day: string): number | null {
        if (!day) return null;
        const t = Date.parse(`${day}T00:00:00`);
        return Number.isFinite(t) ? t : null;
    }
    function parseDayEnd(day: string): number | null {
        if (!day) return null;
        const t = Date.parse(`${day}T23:59:59`);
        return Number.isFinite(t) ? t : null;
    }

    const filteredEvents = useMemo(() => {
        const qNorm = q.trim().toLowerCase();

        const fromT = parseDayStart(dateFrom);
        const toT = parseDayEnd(dateTo);

        const minOdd = oddMin.trim() === "" ? null : Number(oddMin);
        const maxOdd = oddMax.trim() === "" ? null : Number(oddMax);

        const hasMin = minOdd !== null && Number.isFinite(minOdd);
        const hasMax = maxOdd !== null && Number.isFinite(maxOdd);

        return events
            .map((ev) => {
                // 1) filtr po nazwie eventu
                if (qNorm && !String(ev.eventName ?? "").toLowerCase().includes(qNorm)) {
                    return null;
                }

                // 2) filtr po dacie
                const evT = parseIsoDateSafe(String(ev.startTime));
                if (fromT !== null && evT !== null && evT < fromT) return null;
                if (toT !== null && evT !== null && evT > toT) return null;

                // 3) filtr po kursach: filtrujemy odds w marketach
                if (!hasMin && !hasMax) {
                    return ev; // bez filtra kursów – zwracamy jak jest
                }

                const filteredMarkets =
                    ev.markets?.map((m) => {
                        const odds = (m.odds ?? []).filter((o) => {
                            const v = Number(o.oddValue);
                            if (!Number.isFinite(v)) return false;
                            if (hasMin && v < (minOdd as number)) return false;
                            if (hasMax && v > (maxOdd as number)) return false;
                            return true;
                        });

                        // jeśli w tym markecie nie zostało żadnego odda -> wywalamy market
                        if (odds.length === 0) return null;
                        return { ...m, odds };
                    }).filter(Boolean) ?? [];

                if (filteredMarkets.length === 0) return null;

                return { ...ev, markets: filteredMarkets };
            })
            .filter(Boolean) as EventDto[];
    }, [events, q, dateFrom, dateTo, oddMin, oddMax]);


    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                <h1 style={{ margin: 0 }}>New coupon</h1>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>userId: {userId}</div>
            </div>

            {/* GRID*/}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 2fr) minmax(340px, 1fr)",
                    gap: 16,
                    alignItems: "start",
                }}
            >
                {/* LEWA KOLUMNA */}
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Filtry */}
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                            padding: 12,
                            borderRadius: 16,
                            border: "1px solid var(--border)",
                            background: "var(--surface-2)",
                        }}
                    >
                        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 700 }}>
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
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            onClick={() => loadEvents(status)}
                            disabled={loadingEvents}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: loadingEvents ? "not-allowed" : "pointer",
                            }}
                        >
                            {loadingEvents ? "Ładowanie..." : "Odśwież eventy"}
                        </button>

                        {/* FILTRY */}
                        <div
                            style={{
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                borderRadius: 16,
                                padding: 12,
                                boxShadow: "var(--shadow)",
                                display: "flex",
                                gap: 10,
                                flexWrap: "wrap",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Szukaj (np. Real)"
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 12,
                                    border: "1px solid var(--border)",
                                    background: "var(--surface-2)",
                                    color: "var(--text)",
                                    minWidth: 200,
                                    flex: 1,
                                }}
                            />

                            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                                Data od
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    style={{
                                        padding: "8px 10px",
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surface-2)",
                                        color: "var(--text)",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                                Data do
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    style={{
                                        padding: "8px 10px",
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surface-2)",
                                        color: "var(--text)",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                                Kurs min
                                <input
                                    inputMode="decimal"
                                    value={oddMin}
                                    onChange={(e) => setOddMin(e.target.value.replace(",", "."))}
                                    placeholder="np. 1.5"
                                    style={{
                                        width: 110,
                                        padding: "8px 10px",
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surface-2)",
                                        color: "var(--text)",
                                    }}
                                />
                            </label>

                            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--muted)" }}>
                                Kurs max
                                <input
                                    inputMode="decimal"
                                    value={oddMax}
                                    onChange={(e) => setOddMax(e.target.value.replace(",", "."))}
                                    placeholder="np. 3.0"
                                    style={{
                                        width: 110,
                                        padding: "8px 10px",
                                        borderRadius: 12,
                                        border: "1px solid var(--border)",
                                        background: "var(--surface-2)",
                                        color: "var(--text)",
                                    }}
                                />
                            </label>

                            <button
                                onClick={() => {
                                    setQ("");
                                    setDateFrom("");
                                    setDateTo("");
                                    setOddMin("");
                                    setOddMax("");
                                }}
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
                                Wyczyść filtry
                            </button>
                        </div>


                        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
                            Eventy: <b style={{ color: "var(--text)" }}>{events.length}</b>
                        </div>
                    </div>

                    {/* Lista eventów */}
                    {eventsError ? (
                        <pre style={{ color: "var(--danger)", whiteSpace: "pre-wrap", margin: 0 }}>{eventsError}</pre>
                    ) : loadingEvents ? (
                        <p style={{ margin: 0 }}>Ładowanie...</p>
                    ) : events.length === 0 ? (
                        <p style={{ margin: 0 }}>Brak eventów.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {filteredEvents.map((ev) => (
                                <EventCard
                                    key={ev.eventId}
                                    event={ev}
                                    mode="BET"
                                    onAddOdd={onAddOdd}
                                    disabledOddIds={selectedOddIds}
                                    loadingOddId={addingOddId}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Prawa kolumna kupon*/}
                <div
                    style={{
                        border: "1px solid var(--border)",
                        borderRadius: 18,
                        padding: 14,
                        background: "var(--surface-2)",
                        position: "sticky",
                        top: 88, // pod headerem
                        height: "fit-content",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                        <h2 style={{ margin: 0 }}>Kupon</h2>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                            {coupon ? `Selections: ${coupon.numberOfSelections}` : "—"}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button
                            onClick={refreshCoupon}
                            disabled={loadingCoupon}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: loadingCoupon ? "not-allowed" : "pointer",
                            }}
                        >
                            {loadingCoupon ? "..." : "Odśwież"}
                        </button>

                        <button
                            onClick={onClearCoupon}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "transparent",
                                color: "var(--text)",
                                fontWeight: 800,
                                cursor: "pointer",
                            }}
                        >
                            Wyczyść
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                        <input
                            value={stake}
                            onChange={(e) => setStake(e.target.value)}
                            placeholder="stake"
                            style={{
                                width: 120,
                                padding: "8px 10px",
                                borderRadius: 12,
                                border: "1px solid var(--border)",
                                background: "var(--surface)",
                                color: "var(--text)",
                            }}
                        />
                        <button
                            onClick={onPlaceBet}
                            disabled={placing || !coupon || coupon.numberOfSelections === 0}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 12,
                                border: "1px solid transparent",
                                background: "var(--primary)",
                                color: "var(--primary-contrast)",
                                fontWeight: 900,
                                cursor: placing ? "not-allowed" : "pointer",
                                opacity: placing || !coupon || coupon.numberOfSelections === 0 ? 0.7 : 1,
                            }}
                        >
                            {placing ? "Stawiam..." : "Postaw kupon"}
                        </button>
                    </div>

                    {couponError && (
                        <pre style={{ color: "var(--danger)", whiteSpace: "pre-wrap", marginTop: 12, marginBottom: 0 }}>
              {couponError}
            </pre>
                    )}

                    <div style={{ marginTop: 12 }}>
                        {loadingCoupon ? (
                            <p style={{ margin: 0 }}>Ładowanie kuponu...</p>
                        ) : coupon ? (
                            <>
                                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                                    Total odd: <b style={{ color: "var(--text)" }}>{coupon.totalOdd}</b>
                                </div>

                                {coupon.selections.length === 0 ? (
                                    <p style={{ margin: 0, color: "var(--muted)" }}>Pusty kupon.</p>
                                ) : (
                                    <ul style={{ paddingLeft: 16, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                                        {coupon.selections.map((s, i) => (
                                            <li key={i}>
                                                <div style={{ fontWeight: 900 }}>{s.eventName}</div>
                                                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                                                    {s.marketName} — {s.outcomeName}
                                                </div>
                                                <div style={{ fontSize: 13 }}>
                                                    Odd: <b>{s.oddValue}</b>{" "}
                                                    <span style={{ color: "var(--muted)" }}>(oddId: {s.oddId})</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        ) : (
                            <p style={{ margin: 0, color: "var(--muted)" }}>Brak danych kuponu.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
