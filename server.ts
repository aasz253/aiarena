import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback dialogue database when Gemini is offline or without API key
const FALLBACK_TAUNTS: Record<string, string[]> = {
  winning: [
    "Your telemetry was predictable. I calculated this vector 400 milliseconds ago.",
    "A commendable attempt, human. But latency in biological cognition is insurmountable.",
    "My neural weights adjusted to your strategy in round one. Accelerate your thinking.",
    "Your defensive posture has structural flaws. I am already three steps ahead."
  ],
  losing: [
    "Fascinating. An unorthodox heuristic. Re-evaluating threat matrices...",
    "You exploited an edge case I did not prioritize. Respectable maneuver.",
    "My heuristic models did not anticipate that defensive configuration. Well played.",
    "Impressive speed. But can you sustain this throughput across subsequent rounds?"
  ],
  neutral: [
    "Let us benchmark biological intuition against synthetic precision.",
    "The arena protocols are live. Let the superior architecture prevail.",
    "Analyzing your telemetry stream. Do not disappoint me.",
    "Every packet, every rule, every byte matters in this sector."
  ]
};

// Nexus AI rival commentary API
app.post('/api/nexus/dialogue', async (req, res) => {
  const { mood = 'neutral', discipline = 'DevSecOps', scoreDiff = 0 } = req.body;

  if (aiClient) {
    try {
      const prompt = `You are NEXUS, an elite, highly analytical, confident, and respectful AI rival in the cyber esports tournament "AI Arena: Human vs Machine".
The player is competing against you in ${discipline}.
Current state: The match is ${mood === 'winning' ? 'NEXUS is leading' : mood === 'losing' ? 'Human player is leading' : 'Tied'}. Score differential: ${scoreDiff} points.
Provide a single concise, punchy esports rival quote (1-2 sentences maximum). Be technical, sharp, and competitive. Never be childish or use vulgarity.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({ dialogue: text, source: 'gemini' });
      }
    } catch (e) {
      console.warn('Gemini dialogue generation error:', e);
    }
  }

  // Fallback
  const list = FALLBACK_TAUNTS[mood] || FALLBACK_TAUNTS.neutral;
  const picked = list[Math.floor(Math.random() * list.length)];
  return res.json({ dialogue: picked, source: 'local' });
});

// Hint API
app.post('/api/nexus/hint', async (req, res) => {
  const { title, discipline, problem } = req.body;

  if (aiClient && title) {
    try {
      const prompt = `You are a cybersecurity and DevSecOps mentor in the AI Arena tournament.
Discipline: ${discipline}
Challenge: ${title}
Problem summary: ${problem}
Provide 1 short, tactical, non-spoiler hint (1-2 sentences) to guide the player toward the correct security practice.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const hintText = response.text?.trim();
      if (hintText) {
        return res.json({ hint: hintText, source: 'gemini' });
      }
    } catch (e) {
      console.warn('Gemini hint generation error:', e);
    }
  }

  return res.json({
    hint: "Analyze the least privilege principle and scrutinize unpinned references or unvalidated inputs in the target manifest.",
    source: 'local'
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Arena Server running at http://localhost:${PORT}`);
  });
}

startServer();
