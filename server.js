const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const apiKey = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
const isOpenRouterKey = Boolean(apiKey && apiKey.startsWith('sk-or-v1-'));
const apiBaseUrl = isOpenRouterKey ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1';
const model = isOpenRouterKey ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/generate-recipes', async (req, res) => {
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key in .env' });
  }

  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      `${apiBaseUrl}/chat/completions`,
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'Return only valid JSON array data. Do not include markdown, code fences, or extra text.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...(isOpenRouterKey ? { 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'AI Recipe Generator' } : {}),
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || '[]';
    const cleanedContent = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const recipes = JSON.parse(cleanedContent);

    return res.json({ recipes });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'OpenAI request failed';

    return res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Recipe API server running on http://localhost:${port}`);
});