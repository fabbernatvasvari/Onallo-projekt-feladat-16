type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function login(username: string, password: string): Promise<LoginResult>
 {
  if (username === "test")
    return { ok: true, token: "dev-token" }; // ONLY FOR TESTING PURPOSES, REMOVE IN PRODUCTION
  if (!username || !password) 
    return { ok: false, error: "Missing username or password" };


  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  return { ok: true, token: data.token };
}

interface RegisterSuccess {
  ok: true;
  token: string;
}

interface RegisterFailure {
  ok: false;
  error: string;
}

export type RegisterResult = RegisterSuccess | RegisterFailure;

export async function register(username: string, email: string, password: string):Promise<RegisterResult>
 {
  if (username === "test") {
    return { ok: true, token: "dev-token" };
  } // ONLY FOR TESTING PURPOSES, REMOVE IN PRODUCTION
  if (!username || !email || !password)
    return { ok: false, error: "Missing username, email, or password" };
  
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  // Assuming that backend returns { token: string } on success
  if (data?.token) {
    return { ok: true, token: data.token };
  }

  // If API returns something else then treat it as a failure
  return { ok: false, error: data?.error ?? "Registration failed" };
}
