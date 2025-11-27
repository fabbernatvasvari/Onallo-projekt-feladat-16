import { useState } from "react";
import { register } from "../api/auth";
import { toast } from "react-toastify";
import IdGenerator from "../helperScripts/idGenerator";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("A jelszavak nem egyeznek!");
            toast.info("A jelszavak nem egyeznek!");
            return;
        }
        const success = await register(username, email, password);

        if (typeof success !== "string") {
            // registration failed
            return;
        }

        localStorage.setItem("token", success);
        localStorage.setItem("user", JSON.stringify({ id: IdGenerator.generateId(), email, username }));

        if (success) {
            window.location.href = "/users";
        } else {
            alert("A regisztráció sikertelen!");
            toast.info("A regisztráció sikertelen!");
        }
    }

    return (
        <div className="p-10 max-w-md mx-auto">
            <h1 className="text-3xl mb-4">Regisztráció</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Felhasználónév"
                    className="border p-2 rounded"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="E-mail"
                    className="border p-2 rounded"
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Jelszó"
                    className="border p-2 rounded"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Jelszó megerősítése"
                    className="border p-2 rounded"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="bg-blue-600 text-white p-2 rounded">
                    Regisztráció
                </button>
            </form>

            <a className="text-blue-700" href="/">Bejelentkezés</a>
        </div>
    );
}