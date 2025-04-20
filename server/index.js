// Load environment variables and start logging
require('dotenv').config();
console.log('Starting server...');

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());

// Database setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

// Keys and OpenAI client setup
const publicKey = fs.readFileSync(path.join(__dirname, 'keys', 'public_key.pem'), 'utf8');
const privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'private_key.pem'), 'utf8');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

if (!publicKey || !privateKey || !process.env.OPENAI_API_KEY || !process.env.DATABASE_URL) {
    console.error('Missing critical environment variables. Check your .env file.');
    process.exit(1);
}

// Submit feedback endpoint
app.post('/submit', async (req, res) => {
    try {
        const { feedback } = req.body;
        if (!feedback) return res.status(400).send({ error: 'Feedback is required.' });

        const buffer = Buffer.from(feedback, 'utf-8');
        const encrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, buffer);

        await pool.query(
            'INSERT INTO feedback (content, created_at, summarized) VALUES ($1, NOW(), FALSE)',
            [encrypted.toString('base64')]
        );

        res.status(200).send({ message: 'Feedback submitted successfully.' });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Summarize feedback endpoint
app.get('/summarize', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, content FROM feedback WHERE summarized = FALSE LIMIT 10');

        if (rows.length === 0) {
            return res.status(200).send({ message: 'No feedback to summarize.' });
        }

        const decryptedFeedbacks = rows.map(row => {
            const buffer = Buffer.from(row.content, 'base64');
            return crypto.privateDecrypt({
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            }, buffer).toString('utf-8');
        });

        const prompt = `You are an AI assistant summarizing feedback for an enterprise platform. Analyze the following submissions and return:

1. \u2728 Key Themes (concise bullets)
2. \ud83d\udd0d Suggested Tags (e.g., #communication, #burnout)
3. \ud83d\udd0a Tone Assessment (e.g., constructive, frustrated)
4. \u26a0\ufe0f Flagged Issues (e.g., abuse, burnout, safety concerns)

Submissions:\n\n${decryptedFeedbacks.map((f, i) => `${i + 1}. "${f}"`).join('\n\n')}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        const summary = response.choices[0].message.content;

        await pool.query('INSERT INTO summaries (content, created_at) VALUES ($1, NOW())', [summary]);

        const ids = rows.map(row => row.id);
        await pool.query('UPDATE feedback SET summarized = TRUE WHERE id = ANY($1::int[])', [ids]);

        res.status(200).send({ message: 'Batch summarized successfully.' });
    } catch (err) {
        console.error('Error summarizing feedback:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
