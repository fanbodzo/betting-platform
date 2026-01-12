import { useState } from "react";
import { addBalance, deductBalance } from "../api/balanceApi";

type Props = {
    onBalanceChanged?: () => void;
};

export function AppHeader({ onBalanceChanged }: Props) {
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? Number(userIdStr) : null;
    const [busy, setBusy] = useState(false);

    async function handle(kind: "add" | "deduct") {
        if (userId === null || !Number.isFinite(userId)) return;

        const label = kind === "add" ? "wpłacić" : "wypłacić";
        const input = prompt(`Ile chcesz ${label}? (kwota)`);
        if (!input) return;

        const amount = Number(input);
        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Kwota musi być liczbą > 0");
            return;
        }

        setBusy(true);
        try {
            if (kind === "add") await addBalance(userId, amount);
            else await deductBalance(userId, amount);

            alert(kind === "add" ? "Wpłata OK" : "Wypłata OK");
            onBalanceChanged?.();
        } catch (e: any) {
            alert(e?.response?.data?.message ?? e?.message ?? "Błąd transakcji");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, borderBottom: "1px solid #ddd" }}>
            <b>Betting App</b>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => handle("add")} disabled={busy}>
                    Wpłata
                </button>
                <button onClick={() => handle("deduct")} disabled={busy}>
                    Wypłata
                </button>
            </div>
        </div>
    );
}
