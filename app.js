import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';

const app = express();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

app.get('/', (req, res, next) => {
	try {
		throw 'Test error handler';
	} catch (error) {
		next(error);
	}
});

app.use((err, req, res, next) => {
	console.error(err ?? 'Fatal error happened');
	res.status(500).json({ message: err.message ?? 'Something went wrong' });
});

app.listen(3000, () => {
	console.log('mail app running on http://localhost:3000');
});
