export async function login(username: string, password: string): Promise<string | boolean>
 {
  if (username == "test") return true; // ONLY FOR TESTING PURPOSES, REMOVE IN PRODUCTION
  if (!username || !password) return false;


  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  return data.token;
}

export async function register(username: string, email: string, password: string):Promise<boolean | any>
 {
  if (username == "test") return true; // ONLY FOR TESTING PURPOSES, REMOVE IN PRODUCTION
  if (!username || !email || !password) return false;
  
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  return await res.json();
}
