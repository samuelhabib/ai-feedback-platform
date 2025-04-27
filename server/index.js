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
const cors = require('cors');

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const app = express();
const port = 3005;

// Middleware
app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3008',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

console.log('CORS and body-parser middleware set up.');

// Database setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

console.log('Database pool initialized.');

const publicKey = fs.readFileSync(path.join(__dirname, 'keys', 'public_key.pem'), 'utf8');
const privateKey = fs.readFileSync(path.join(__dirname, 'keys', 'private_key.pem'), 'utf8');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Check environment variables
if (!publicKey || !privateKey || !process.env.OPENAI_API_KEY || !process.env.DATABASE_URL) {
    console.error('Missing critical environment variables. Check your .env file.');
    process.exit(1);
}
console.log('Keys and OpenAI client setup complete.');

// -------------------------------------
// Submit feedback endpoint
// -------------------------------------
app.post('/submit', async (req, res) => {
    try {
        console.log('POST /submit - Received feedback submission request.');

        const { feedback } = req.body;
        if (!feedback) {
            console.warn('POST /submit - No feedback provided.');
            return res.status(400).send({ error: 'Feedback is required.' });
        }

        console.log('POST /submit - Encrypting feedback.');
        // Encrypt feedback with Public Key
        const buffer = Buffer.from(feedback, 'utf-8');
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer
        );

        console.log('POST /submit - Storing encrypted feedback into database.');
        // Save encrypted feedback into the database
        await pool.query(
            'INSERT INTO feedback (content, created_at, summarized) VALUES ($1, NOW(), FALSE)',
            [encrypted.toString('base64')]
        );

        console.log('POST /submit - Feedback stored successfully.');
        res.status(200).send({ message: 'Feedback submitted successfully.' });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Helper function to handle summarization
async function summarizeFeedbacks(force = false) {
    console.log(`Summarization started. Force mode: ${force}`);
    const { rows } = await pool.query('SELECT id, content FROM feedback WHERE summarized = FALSE LIMIT 10');

    if (rows.length === 0) {
        console.log('No unsummarized feedbacks found.');
        return { success: false, message: 'No feedback to summarize.' };
    }

    if (!force && rows.length < 10) {
        console.log(`Only ${rows.length} feedbacks found. Not enough to summarize in normal mode.`);
        return { success: false, message: 'Not enough feedback to summarize yet.' };
    }

    console.log(`Found ${rows.length} feedbacks to summarize.`);

    const decryptedFeedbacks = rows.map(row => {
        const buffer = Buffer.from(row.content, 'base64');
        return crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, buffer).toString('utf-8');
    });

    console.log('Decrypted feedbacks successfully.');

    const prompt = `You are an AI assistant summarizing feedback for an enterprise platform. Analyze the following submissions and return:

    1. ✨ Key Themes (concise bullets)
    2. 🔍 Suggested Tags (e.g., #communication, #burnout)
    3. 🔊 Tone Assessment (e.g., constructive, frustrated)
    4. ⚠️ Flagged Issues (e.g., abuse, burnout, safety concerns)

    Submissions:\n\n${decryptedFeedbacks.map((f, i) => `${i + 1}. "${f}"`).join('\n\n')}`;

    console.log('Sending summarization prompt to OpenAI.');
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
    });

    const summary = response.choices[0].message.content;
    console.log('Received summary from OpenAI.');

    await pool.query('INSERT INTO summaries (content, created_at) VALUES ($1, NOW())', [summary]);
    console.log('Stored new summary into database.');

    const ids = rows.map(row => row.id);
    await pool.query('UPDATE feedback SET summarized = TRUE WHERE id = ANY($1::int[])', [ids]);
    console.log(`Marked ${ids.length} feedbacks as summarized.`);

    return { success: true, message: 'Batch summarized successfully.' };
}

// -------------------------------------
// Summarize feedback endpoint (normal)
// -------------------------------------
app.get('/summarize', async (req, res) => {
    try {
        const result = await summarizeFeedbacks(false);
        res.status(200).send({ message: result.message });
    } catch (err) {
        console.error('Error in /summarize:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// -------------------------------------
// Summarize feedback endpoint (forced)
// -------------------------------------
app.get('/summarize-force', async (req, res) => {
    try {
        const result = await summarizeFeedbacks(true);
        res.status(200).send({ message: result.message });
    } catch (err) {
        console.error('Error in /summarize-force:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// -------------------------------------
// Get summaries endpoint
// -------------------------------------
app.get('/summaries', async (req, res) => {
    try {
        console.log('GET /summaries - Fetching summaries.');
        const { rows } = await pool.query('SELECT id, content, created_at FROM summaries ORDER BY created_at DESC');
        console.log(`GET /summaries - Retrieved ${rows.length} summaries.`);
        res.status(200).send(rows);
    } catch (err) {
        console.error('Error fetching summaries:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// -------------------------------------
// Get feedback (encrypted) endpoint
// -------------------------------------
app.get('/feedback', async (req, res) => {
    try {
        console.log('GET /feedback - Fetching feedback entries.');
        const { rows } = await pool.query('SELECT id, content, created_at, summarized FROM feedback ORDER BY created_at DESC');
        console.log(`GET /feedback - Retrieved ${rows.length} feedback entries.`);
        res.status(200).send(rows);
    } catch (err) {
        console.error('Error fetching feedback:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


// -------------------------------------
// Health check endpoint
// -------------------------------------
app.get('/health', (req, res) => {
    console.log('GET /health - Health check OK.');
    res.status(200).send({ status: 'ok' });
});


// -------------------------------------
// Start server
// -------------------------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
