import Database from "better-sqlite3";

const db = new Database("mydb.sqlite");

function getUser(username: string) {
    const stmt = db.prepare("SELECT * FROM USERS WHERE name = ?");
    const user = stmt.get(username); // `.get()` returns a single row object or undefined
    return user;
}
export default getUser;

class Executable {
    execute(): any {
        console.error("Method not implemented yet.");
        return this;
    }
}

class Db {
    prepare(query: string): Executable {
        console.error("Method not implemented yet.");

        return new Executable();
    }
}
export const dbInstance = new Db();