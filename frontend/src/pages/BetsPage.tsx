import { useEffect, useState } from "react";
import { getBalance } from "../api/userApi";
import { getBets } from "../api/betsApi";

export function BetsPage() {
    const userIdStr = localStorage.getItem("userId");

    if (!userIdStr) {
        return (
            <div style={{ padding: 24 }}>
                <h1>BETS</h1>
                <p>Brak userId. Zaloguj się ponownie.</p>
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userId");
                        window.location.href = "/login";
                    }}
                >
                    Przejdź do logowania
                </button>
            </div>
        );
    }

    const userId = Number(userIdStr);

    const [balance, setBalance] = useState<any>(null);
    const [balanceError, setBalanceError] = useState<string | null>(null);

    const [bets, setBets] = useState<any[]>([]);
    const [betsError, setBetsError] = useState<string | null>(null);

    const [loadingBalance, setLoadingBalance] = useState(true);
    const [loadingBets, setLoadingBets] = useState(true);

    useEffect(() => {
        // SALDO — osobno, żeby działało nawet jak bety padają
        async function loadBalance() {
            setLoadingBalance(true);
            setBalanceError(null);
            try {
                const bal = await getBalance(userId);
                setBalance(bal);
            } catch (e: any) {
                setBalanceError(e?.message ?? "Nie udało się pobrać salda.");
            } finally {
                setLoadingBalance(false);
            }
        }

        // BETY — osobno, żeby 500 nie psuło strony
        async function loadBets() {
            setLoadingBets(true);
            setBetsError(null);
            try {
                const b = await getBets(userId, "PENDING");
                setBets(Array.isArray(b) ? b : []);
            } catch (e: any) {
                // Axios często trzyma szczegóły tu:
                const msg =
                    e?.response?.data?.message ??
                    e?.response?.statusText ??
                    e?.message ??
                    "Nie udało się pobrać betów.";
                setBetsError(msg);
                setBets([]); // żeby UI był spójny
            } finally {
                setLoadingBets(false);
            }
        }

        loadBalance();
        loadBets();
    }, [userId]);

    const onLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>BETS</h1>

            <div style={{ marginBottom: 16 }}>
                <button onClick={onLogout}>Wyloguj</button>
            </div>

            <h2>Saldo</h2>
            {loadingBalance ? (
                <p>Ładowanie salda...</p>
            ) : balanceError ? (
                <p style={{ color: "crimson" }}>{balanceError}</p>
            ) : (
                <pre>{JSON.stringify(balance, null, 2)}</pre>
            )}

            <h2>Lista betów</h2>
            {loadingBets ? (
                <p>Ładowanie betów...</p>
            ) : betsError ? (
                <div>
                    <p style={{ color: "crimson" }}>Błąd pobierania betów:</p>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{betsError}</pre>
                    <p>Na MVP to wystarczy — saldo działa, a bety są chwilowo niedostępne.</p>
                </div>
            ) : bets.length === 0 ? (
                <p>Brak betów.</p>
            ) : (
                <ul>
                    {bets.map((bet, idx) => (
                        <li key={idx} style={{ marginBottom: 12 }}>
                            <pre>{JSON.stringify(bet, null, 2)}</pre>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
