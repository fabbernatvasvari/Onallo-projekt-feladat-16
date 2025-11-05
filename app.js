import express from "express";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import "dotenv/config";

const generateOTP = () =>
	randomstring.generate({ length: 4, charset: "numeric" });
const sendMail = async (email, otp) => {
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
			subject: "OTP verification",
			text: `Your OPT verification is ${otp}`,
		});
		console.log(`Email sent ${info.response}`);
	} catch (err) {
		console.log(`Email error: ${err}`);
	}
};

const otpCashe = {};
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

app.post("/api/requestotp", (req, res) => {
	const { email } = req.body;
	const otp = generateOTP();
	otpCashe[email] = otp;
	console.log(otpCashe);
	sendMail(email, otp);
	res.cookie("otpCache", otpCashe, { httpOnly: true, maxAge: 30000 });
	res.status(200).json({ message: "OTP sent successfully" });
});

app.post("/api/verifyotp", (req, res) => {
	const { email, otp } = req.body;
	if (!otpCashe[email]) {
		return res.status(400).json({ message: "Email not found" });
	}
	if (otpCashe[email] != otp) {
		return res.status(400).json({ message: "Invalid OTP" });
	}
	delete otpCashe[email];
	res.status(200).json({ message: "OTP verified successfully" });
});

app.listen(PORT, () => {
	console.log(`Runs on port ${PORT}`);
});

