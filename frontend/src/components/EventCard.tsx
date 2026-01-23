import type {EventDto} from "../api/eventsApi";
import {formatDateTime} from "../utils/date.ts";

type OddActionMode = "BET" | "SETTLE";

type Props = {
    event: EventDto;
    mode: OddActionMode;

    // BET
    onAddOdd?: (oddId: number) => void;
    disabledOddIds?: Set<number>;
    loadingOddId?: number | null;

    // SETTLE
    selectedWinningOddId?: number | null;
    onSelectWinningOdd?: (marketId: number, oddId: number) => void;
};

export function EventCard({
                              event,
                              mode,
                              onAddOdd,
                              disabledOddIds,
                              loadingOddId,
                              selectedWinningOddId,
                              onSelectWinningOdd,
                          }: Props) {
    return (
        <div
            style={{
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: 14,
                background: "var(--surface)",
                boxShadow: "var(--shadow)",
            }}
        >
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {event.eventName}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{formatDateTime(event.startTime)}</div>
                </div>
            </div>

            {/* MARKETY */}
            {event.markets?.length ? (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                    {event.markets.map((m) => (
                        <div key={m.marketId}>
                            <div style={{ fontWeight: 800, marginBottom: 8 }}>
                                {m.marketName}
                                {mode === "SETTLE" && (
                                    <span style={{ fontWeight: 600, color: "var(--muted)" }}>
                                        {" "} (marketId: {m.marketId})
                                    </span>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {m.odds.map((o) => {
                                    const isSelected =
                                        mode === "SETTLE" && selectedWinningOddId === o.oddId;

                                    const disabled =
                                        mode === "BET" &&
                                        (loadingOddId === o.oddId || disabledOddIds?.has(o.oddId));

                                    return (
                                        <button
                                            key={o.oddId}
                                            onClick={() => {
                                                if (mode === "BET") onAddOdd?.(o.oddId);
                                                else onSelectWinningOdd?.(m.marketId, o.oddId);
                                            }}
                                            disabled={mode === "BET" && disabled}
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: 999,
                                                border: "1px solid var(--border)",
                                                background:
                                                    mode === "SETTLE" && isSelected
                                                        ? "var(--primary)"
                                                        : "var(--surface-2)",
                                                color:
                                                    mode === "SETTLE" && isSelected
                                                        ? "var(--primary-contrast)"
                                                        : "var(--text)",
                                                opacity: disabled ? 0.6 : 1,
                                                cursor: disabled ? "not-allowed" : "pointer",
                                                fontWeight: 800,
                                            }}
                                        >
                                            {o.outcomeName} — {o.oddValue.toFixed(2)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ marginTop: 12, marginBottom: 0, color: "var(--muted)" }}>
                    Brak marketów/odds.
                </p>
            )}
        </div>
    );
}
