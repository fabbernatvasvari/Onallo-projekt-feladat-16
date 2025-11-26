import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserListPage from "./pages/UserListPage";
import {Link} from "react-router-dom";
import { toast } from "react-toastify/unstyled";
import currentUser from "./main";

export default function App() {
  const [chatCode, setChatCode] = useState<string | null>(null);

  const startChat = async () => {
    try {
      const res = await fetch("/api/register", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: currentUser.id,
          username: currentUser.username,
         })
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = await res.json();
    setChatCode(data.chatCode);
      //displayChats();

    } catch (err) {
      console.error(err);
      toast.error('A "fetch /api/register" válasza nem érvényes JSON.');
    }
  };

  return (
    <>
      <div className="p-4 text-xl flex justify-center">
     <h1>  Live Chat App</h1>
      </div>
      <div className="border-b mb-4">

      <nav className="p-4 bg-gray-900 text-white flex gap-4">
        <Link to="/" className="hover:text-blue-300">Főoldal</Link>
        <Link to="/login" className="hover:text-blue-300">Bejelentkezés</Link>
        <Link to="/register" className="hover:text-blue-300">Regisztráció</Link>
        <Link to="/logout" className="hover:text-blue-300">Kijelentkezés</Link>
        <Link to="/users" className="hover:text-blue-300">Felhasználók</Link>
        {/* A chat route paraméteres, ezért nem kerül ide fix link */}
      </nav>

      <Routes>
        <Route path="/" element={
          <main className="p-10 text-center">
            <h2 className="text-2xl mb-4">Üdvözlünk a Live Chat App-ban!</h2>
            <p className="mb-6">Kezdj el egy új csevegést az alábbi gombbal:</p>
            <button
              onClick={startChat}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Új csevegés indítása
            </button>
          </main>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/logout" element={<LoginPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
      </Routes>
      </div>
      <main className="bg-blue-100 p-6 max-w-4xl mx-auto h-screen flex items-center justify-center">
        {/* Main box */}
        <div className="m-10 p-10 rounded-xl shadow-lg text-white"
          style={{
            backgroundColor: "rgb(93,82,192)",
            backgroundImage: "url('/img/forest.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >


        </div>

        {/* Chat area */}
        {chatCode && (
          <div className="mt-10 p-6 bg-white rounded-xl shadow-lg text-black">
            <h2 className="text-2xl font-bold mb-4">Csevegés elindítva ✅</h2>

            <p>A csevegés kódja: <span className="font-mono text-blue-700">{chatCode}</span></p>

            <textarea
              className="w-full mt-4 p-2 border rounded"
              rows={5}
              placeholder="Írd be az üzeneted..."
            ></textarea>

            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Küldés
            </button>
          </div>
        )}
      </main>
    </>
  );
}
