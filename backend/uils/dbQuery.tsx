import Database from "better-sqlite3";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

class sqlite3Controller {
    mySqlite3: any;

    async prepare() {

        const betterSqlite3 = new Database("mydb.sqlite");
        this.mySqlite3 = await open({
            filename: "database.sqlite",
            driver: sqlite3.Database
        });

        // create table if not exist
        await this.mySqlite3.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                recipient_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                is_read INTEGER DEFAULT 0,
                parent_msg_id INTEGER
            );
        `);
    }
}

class betterSqlite3Controller {
    myBetterSqlite3: any;
    getUser(username: string) {
        const stmt = this.myBetterSqlite3.prepare("SELECT * FROM USERS WHERE name = ?");
        const user = stmt.get(username); // `.get()` returns a single row object or undefined
        return user;
    }
}

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

