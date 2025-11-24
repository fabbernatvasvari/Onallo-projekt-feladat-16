import { useState } from "react";
import { login } from "../api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await login(username, password);

    if (!result.ok) {
      console.log(result.error);
      return;
    }

    localStorage.setItem("token", result.token);
    window.location.href = "/users";
  }

  return (
    <div className="p-10 max-w-md mx-auto">
      <h1 className="text-3xl mb-4">Bejelentkezés</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="test"
          placeholder="Felhasználónév"
          className="border p-2 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Jelszó"
          className="border p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white p-2 rounded">
          Bejelentkezés
        </button>
      </form>

      <a className="text-blue-700" href="/register">Regisztráció</a>
    </div>
  );
}
