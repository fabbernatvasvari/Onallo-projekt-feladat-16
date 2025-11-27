const resp = await fetch("http://localhost:3001/api/users");
const data = await resp.json();
console.log(data);
