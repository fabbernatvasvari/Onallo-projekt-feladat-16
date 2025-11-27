var resp = await fetch("http://localhost:3001/api/users");
var data = await resp.json();
console.log(data);
