# Feedback Platform

An AI-powered feedback platform with a **Node.js (Express)** backend and a **Next.js** frontend.

- Encrypts feedback submissions securely.
- Summarizes batches of feedback using OpenAI API.
- Full-stack TypeScript ready (optional upgrade).
  
---

## 🚀 Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, OpenAI API
- **Frontend**: Next.js (React)
- **Database**: PostgreSQL
- **Hosting**: Local development (ready for Vercel, Render, or AWS)

---

## 📦 Project Structure

```
/client    --> Next.js frontend
/server    --> Node.js backend (Express server)
```

---

## 🛠️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <your-project-folder>
```

---

### 2. Backend Setup (Node.js)

```bash
cd server
npm install
```

Create a `.env` file inside `/server`:

```env
DATABASE_URL=your_postgres_connection_string
OPENAI_API_KEY=your_openai_api_key
```

Also add your encryption keys:

```
/server/keys/public_key.pem
/server/keys/private_key.pem
```

Start the backend server:
```bash
npm run dev
```
Runs on [http://localhost:3001](http://localhost:3001).

---

### 3. Frontend Setup (Next.js)

```bash
cd client
npm install
```

Create a `.env.local` file inside `/client`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend server:
```bash
npm run dev
```
Runs on [http://localhost:3000](http://localhost:3000).

---

## 🔥 Quick Commands

| Service | Location | Command | URL |
|:---|:---|:---|:---|
| Backend (Node.js) | `/server` | `npm start` | [http://localhost:3001](http://localhost:3001) |
| Frontend (Next.js) | `/client` | `npm run dev` | [http://localhost:3000](http://localhost:3000) |

---

## 📄 Environment Variables

| Variable | Description |
|:---|:---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API Key |
| `NEXT_PUBLIC_API_URL` | (Frontend) Base URL for API requests |

---

## 🛡️ Notes
- Ensure `.env` and `keys/` are ignored in your `.gitignore`.
- If using production, secure your API routes and DB properly.
- Database migrations may be needed depending on your setup.

---

## 📚 Future Enhancements
- Switch to TypeScript.
- Add API authentication with JWT.
- Deploy to production (Vercel, AWS, Render).
- Improve encryption with separate symmetric/asymmetric key rotation.

---

## 📣 License
MIT License.  
Feel free to use, improve, and contribute!

---

### 📸 Final visual
It'll look clean like this:

> ![Example of badges and clean README](https://img.shields.io/badge/Node.js-18.x-green) ![Next.js](https://img.shields.io/badge/Next.js-13.x-blue) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---
Commands:
```
curl -v http://127.0.0.1:3001/submit \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Another test!"}'

```

```
curl -v http://127.0.0.1:3001/submit \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Another test!"}'

```

```
curl http://localhost:3001/summarize
```

```
psql postgres
\c feedbackdb
\dt

```


## Pitch: Anonymous Feedback Platform
In today’s workplace, only 1 in 3 employees feel psychologically safe giving honest feedback. Traditional surveys don’t guarantee anonymity — they track IPs, metadata, and timestamps — quietly eroding trust.

Our platform changes everything.

We’re building the first AI-powered feedback platform where:

* Messages are immediately encrypted at ingestion.

* No human, not even us, can read the original submissions.

* Feedback is batch summarized by AI, ensuring zero traceability.

* Organizations only see structured insights, not individuals.

Key Stats:

* 76% of employees say they would give more feedback if it were truly anonymous. (Gallup, 2023)

* Companies with high feedback cultures outperform competitors by 21%. (Harvard Business Review)

* $1 trillion lost annually in the U.S. due to voluntary turnover — often because of unaddressed feedback. (Gallup)

* Our system integrates effortlessly with Slack, Teams, Email, Web — meeting users where they are.

First Target Markets:

* Tech companies scaling fast and struggling with retention.

* Universities fighting disengagement post-COVID.

* Healthcare institutions needing HIPAA-grade feedback systems.

Why Now?

* The rise of remote work demands new trust models.

* Privacy expectations are skyrocketing (GDPR, CCPA, HIPAA).

* AI can finally summarize massive feedback pools with nuance and accuracy.

In short:

`We unlock honest insights — securely, at scale, without fear.`
