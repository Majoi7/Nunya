import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

function getConfiguredGeminiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim().length < 10) {
    return null;
  }
  return key.trim();
}

function getPublicAppUrl(): string | null {
  const url = process.env.APP_URL;
  if (!url || url === 'MY_APP_URL' || !url.startsWith('http')) {
    return null;
  }
  return url.replace(/\/+$/, '');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'LumiMath' });
});

app.get('/api/config', (_req, res) => {
  res.json({
    hasGeminiKey: Boolean(getConfiguredGeminiKey()),
    publicUrl: getPublicAppUrl(),
  });
});

app.post('/api/tutor', async (req, res) => {
  const apiKey = getConfiguredGeminiKey();
  if (!apiKey) {
    res.status(200).json({
      source: 'offline-required',
      message: 'Aucune clé Gemini configurée sur le serveur.',
    });
    return;
  }

  const { questionPrompt, visualHint, userAnswer, correctAnswer, gradeLevel, topic } = req.body ?? {};
  if (!questionPrompt || correctAnswer === undefined) {
    res.status(400).json({ error: 'Paramètres manquants pour le tuteur.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction =
      `Tu es Lumi, un tuteur de mathématiques bienveillant, joyeux et patient pour un enfant en classe de ${gradeLevel || 'CE2'} (6 à 12 ans) en France. ` +
      `Explique toujours avec des mots très simples, positifs et concrets (pommes, billes, paquets, étoiles). ` +
      `Ne fais jamais de reproche. Sois bref (2 à 3 phrases courtes maximum par champ).`;

    const prompt = [
      `Thème : ${topic || 'Mathématiques'}`,
      `Question posée : ${questionPrompt}`,
      visualHint ? `Indice visuel affiché : ${visualHint}` : '',
      `Réponse donnée par l'enfant : ${userAnswer ?? 'aucune'}`,
      `Bonne réponse : ${correctAnswer}`,
      `Donne une autre explication très simple et imagée adaptée au niveau ${gradeLevel || 'CE2'}, puis propose un petit exercice similaire très simple avec 3 choix pour qu'il reprenne confiance.`,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: 'Explication douce et simple en 2 phrases maximum.',
            },
            visualStep: {
              type: Type.STRING,
              description: 'Image mentale ou exemple concret avec des objets du quotidien.',
            },
            practicePrompt: {
              type: Type.STRING,
              description: 'Une courte question similaire de réassurance.',
            },
            practiceChoices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactement 3 choix de réponse courts.',
            },
            practiceAnswer: {
              type: Type.STRING,
              description: 'La bonne réponse parmi les 3 choix.',
            },
          },
          required: ['explanation', 'visualStep', 'practicePrompt', 'practiceChoices', 'practiceAnswer'],
        },
      },
    });

    const rawText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(rawText);
    res.json({
      source: 'gemini',
      ...parsed,
    });
  } catch (err) {
    console.error('Erreur Gemini /api/tutor:', err);
    res.status(502).json({
      error: 'Le tuteur IA en ligne est momentanément indisponible.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LumiMath server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
