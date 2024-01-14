// app.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(express.static('public'));

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'form',
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // replace with your Gmail email address
        pass: 'your_email_password',  // replace with your Gmail password or an application-specific password
    },
});

const pool = mysql.createPool(dbConfig);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/submit', (req, res) => {
    const { name, number, email, subject, message } = req.body;

    pool.query(
        'INSERT INTO submissions (name, number, email, subject, message) VALUES (?, ?, ?, ?, ?)',
        [name, number, email, subject, message],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            } else {
                sendEmail(name, email, subject, message);

                res.status(200).send('Form submitted successfully!');
            }
        }
    );
});

// Function to send an email using Nodemailer
function sendEmail(name, email, subject, message) {
    const mailOptions = {
        from: 'your_email@gmail.com', // replace with your Gmail email address
        to: 'recipient@gmail.com', // replace with the recipient's email address
        subject: `New Form Submission: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
