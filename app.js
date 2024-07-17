import 'dotenv/config';
import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import Joi from 'joi';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

const schema = Joi.object({
	email: Joi.string().email({
		minDomainSegments: 2,
		tlds: { allow: ['com', 'dev'] },
	}),
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
	service: 'Gmail',
	host: 'smtp.gmail.com',
	from: process.env.EMAIL,
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static('./index.html'));

const prepareEmailContent = (subject, text, imageUrl) => {
	const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
	return template
		.replace('{{subject}}', subject)
		.replace('{{text}}', text)
		.replace('{{imageUrl}}', imageUrl);
};

app.get('/', (req, res) => {
	res.send(
		prepareEmailContent(
			'Custom Web Apps, built by experts',
			"Let's build web apps, with confidence",
			process.env.IMAGE_URL
		)
	);
});

app.post('/send', async (req, res, next) => {
	try {
		const email = req.body.email;
		const subject = 'Custom Web Apps, built by experts';
		const text = "Let's build web apps, with confidence";
		const imageUrl = process.env.IMAGE_URL ?? 'https://placehold.co/600x400';
		const validValue = await schema.validateAsync({ email });
		const htmlContent = prepareEmailContent(subject, text, imageUrl);
		const mailOptions = {
			from: process.env.EMAIL,
			to: validValue.email,
			subject,
			text,
			html: htmlContent,
		};
		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent: ' + info.response);
		res.json({ message: 'Email sent successfully', info: info.response });
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
