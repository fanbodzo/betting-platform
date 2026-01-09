import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../api/authApi";
import { getUsers } from "../api/userApi";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function onLogin() {
        try {
            const { token } = await loginApi(email, password);
            localStorage.setItem("token", token);

            const users = await getUsers();
            const me = users.find(
                (u) => u.email === email || u.username === email
            );

            if (!me) {
                alert("Nie znaleziono usera po loginie");
                return;
            }

            localStorage.setItem("userId", String(me.userId));
            navigate("/bets");
        } catch {
            alert("Błąd logowania");
        }
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>LOGIN</h1>
            <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
            <input
                placeholder="hasło"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={onLogin}>Zaloguj</button>
        </div>
    );
}
