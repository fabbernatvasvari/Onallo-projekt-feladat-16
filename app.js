import express from "express";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import "dotenv/config";

const generateCHAT = () =>
	randomstring.generate({ length: 4, charset: "numeric" });
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
app.use(express.json());

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

