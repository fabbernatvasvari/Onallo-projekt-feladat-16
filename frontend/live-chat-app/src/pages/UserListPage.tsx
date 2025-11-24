import { useEffect, useState } from "react";
import { toast } from "react-toastify/unstyled";

export default function UserListPage() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [offlineUsers, setOfflineUsers] = useState<any[]>([]);

  const placeholderUsers = [
    {
      id: "temp-q1",
      username: "Csevegő Zsófi",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=PumpkinQueen",
    },
    {
      id: "temp-q2",
      username: "Csetes Márk",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=TurboDuck",
    },
    {
      id: "temp-q3",
      username: "Vasvári Lili",
      avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=SleepyCat",
    },
    {
      id: "temp-g1",
      username: "Írogatós Béla",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=JellyfishHero",
    },
    {
      id: "temp-g2",
      username: "Írogatós Kata",
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=CoffeeGremlin",
    },
    {
      id: "temp-g3",
      username: "Írogatós Áron",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=SpacePotato",
    },
  ];

  useEffect(() => {
    fetch("/api/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((realUsers) => {
        setOnlineUsers(realUsers);
        setOfflineUsers(placeholderUsers);
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          'A "fetch api/users" error occurred while retrieving the user list.'
        );
        setOnlineUsers([]);
        setOfflineUsers(placeholderUsers);
      });
  }, []);

   function StatusDot({ online }: { online: boolean }) {
    return (
      <span
        className={
          "h-3 w-3 rounded-full " + (online ? "bg-green-500" : "bg-black")
        }
      ></span>
    );
  }
  const users = [...onlineUsers, ...offlineUsers];
  
  return (
    <div className="p-10">
      {/* Online users */}
      <h1 className="text-3xl mb-4">Most aktív</h1>
      {onlineUsers.map((u: any) => (
        <div
          key={u.id}
          className="flex justify-between items-center border p-3 mb-2 rounded"
        >
          <div className="flex items-center gap-3">
            <StatusDot online={true} />
            <img
              src={u.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full border"
            />
            <div>{u.username}</div>
          </div>

          <button
            className="bg-green-600 text-white px-4 py-1 rounded"
            onClick={() => (window.location.href = `/chat/${u.id}`)}
          >
            Üzenet küldése
          </button>
        </div>
      ))}

      {/* Offline users */}
      <h1 className="text-3xl mb-4 mt-10">Offline</h1>
      {offlineUsers.map((u: any) => (
        <div
          key={u.id}
          className="flex justify-between items-center border p-3 mb-2 rounded"
        >
          <div className="flex items-center gap-3">
            <StatusDot online={false} />
            <img
              src={u.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full border"
            />
            <div>{u.username}</div>
          </div>

          <button
            className="bg-gray-400 text-white px-4 py-1 rounded cursor-not-allowed"
            disabled
          >
            Offline
          </button>
        </div>
      ))}
    </div>
  );
}
