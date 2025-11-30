/*
16. Live Chat AlkalmazásA live chat alkalmazás célja, hogy lehetővé tegye a regisztrált felhasználók közötti valós idejű üzenetküldést. Az üzenetek azonnali megjelenítése a chat felületen, és az üzenetek közötti interakciók, válaszok dinamikus kezelésére lesz szükség. A kommunikáció a socketek segítségével valósul meg, így a felhasználók közötti üzenetek valós időben kerülnek továbbításra.  

Végpontok:
POST /api/register - Új felhasználó regisztrálása. A válasz tartalmazza a sikeres regisztráció után a felhasználói adatokat.
POST /api/login - Felhasználó bejelentkezése. A válasz egy JWT token, amelyet a következő kérésekhez fel lehet használni.
GET /api/users  - A regisztrált felhasználók listájának lekérése a bejelentkezett felhasználó számára, kivéve őt magát.
POST /api/messages - Új üzenet küldése. A kérés a címzett felhasználó azonosítóját, az üzenet tartalmát és opcionálisan a parent_id-t tartalmazza (szálakhoz). 
GET /api/messages  - A bejelentkezett felhasználó összes üzenetének lekérése (beérkezett és elküldött üzenetek). 
GET /api/messages/conversation/:userId - Két felhasználó közötti beszélgetés lekérése. 
GET /api/messages/thread/:id  - Egy üzenethez tartozó válaszok lekérése (thread nézet). 
POST /api/messages/reply  - Egy üzenetre adott válasz küldése (thread jelleggel). 

Adatbázis táblák:
id, username, email, password_hash  
messages(id, sender_id, recipient_id, content, parent_msg_id, created_at, is_read)

Frontend:
Bejelentkezés / Regisztráció oldal: Felhasználó regisztrálhat vagy bejelentkezhet.
Bejelentkezés után a WebSocket kapcsolat automatikusan létrejön.
Felhasználólista oldal: Az összes regisztrált felhasználó listája megjelenik.
„Üzenet küldése” gomb minden felhasználó mellett.
Chat felület: Az aktuális beszélgetés megjelenítése, minden üzenet kíséretében a feladó neve, időpont és tartalom.
Az új üzenetek azonnal megjelennek, miután megérkeznek a WebSocket-en.
Üzenetszál nézet: Egy üzenethez tartozó válaszok listázása.
Válasz küldésének lehetősége egy gomb segítségével.
Push értesítések: Ha egy új üzenet érkezik, a felhasználó értesítést kap (a WebSocket események segítségével).
*/

import express from "express";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import "dotenv/config";

function startServer(){

	/**
	 * Generál egy random 4 jegyű numerikus CHAT kódot.
	 */
	const generateCHAT = () =>
		randomstring.generate({ length: 4, charset: "numeric" });

	/**
	 * Ez a függvény elküldi a CHAT kódot az adott email címre.
	 * @param {*} email 
	 * @param {*} chat 
	 */
	const sendMail = async (email, chat) => {
		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.APP_PASSWORD,
			},
		});
		
		try {
			const info = await transporter.sendMail({
				from: process.env.EMAIL_USER,
				to: email,
				subject: "CHAT verification",
				text: `Your OPT verification is ${chat}`,
			});
			console.log(`Email sent ${info.response}`);
		} catch (err) {
			console.log(`Email error: ${err}`);
		}
	};

	const chatCashe = {};
	const PORT = process.env.PORT || 3001;
	const app = express();
	app.use(express.static("public"));

	app.get("/", (req, res) => {
	res.sendFile(process.cwd() + "/public/index.html");
	});

	app.post("/api/register", (req, res) => {
		const { email } = req.body;
		const chat = generateCHAT();
		chatCashe[email] = chat;
		console.log(chatCashe);
		sendMail(email, chat);
		res.cookie("chatCache", chatCashe, { httpOnly: true, maxAge: 30000 });
		res.status(200).json({ message: "CHAT sent successfully" });
	});

	app.post("/api/login", (req, res) => {
		const { email, chat } = req.body;
		if (!chatCashe[email]) {
			return res.status(400).json({ message: "Email not found" });
		}
		if (chatCashe[email] != chat) {
			return res.status(400).json({ message: "Invalid CHAT" });
		}
		delete chatCashe[email];
		res.status(200).json({ message: "CHAT verified successfully" });
	});

	app.get("/api/users", (req, res) => {
		
		res.status(200).json({ message: "CHAT verified successfully" });
	})

	app.post("/api/users", (req, res) => {
		const { email, chat } = req.body;
		if (!chatCashe[email]) {
			return res.status(400).json({ message: "Email not found" });
		}
		if (chatCashe[email] != chat) {
			return res.status(400).json({ message: "Invalid CHAT" });
		}
		delete chatCashe[email];
		res.status(200).json({ message: "CHAT verified successfully" });
	})

	app.get("/api/messages", (req, res) => {
		
		res.status(200).json({ message: "CHAT verified successfully" });
	})

	app.post("/api/messages", (req, res) => {
		const { email, chat } = req.body;
		if (!chatCashe[email]) {
			return res.status(400).json({ message: "Email not found" });
		}
		if (chatCashe[email] != chat) {
			return res.status(400).json({ message: "Invalid CHAT" });
		}
		delete chatCashe[email];
		res.status(200).json({ message: "CHAT verified successfully" });
	})

	app.get("/api/messages/conversation/:userId")
	app.get("/api/messages/thread/:id")
	app.post( "/api/messages/reply" )

	app.listen(PORT, () => {
		console.log(`Runs on port ${PORT}`);
	});
}

startServer();
