const express = require('express');
const OpenAI = require('openai');
const path = require('path');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'EDUVIA AI' }));

app.post('/api/chat', async (req, res) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!message) return res.status(400).json({ error: 'Please enter a question.' });
    if (message.length > 6000) return res.status(400).json({ error: 'Please keep your question under 6,000 characters.' });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI is not configured yet. Add OPENAI_API_KEY in Render Environment settings.' });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
    const transcript = history
      .filter(item => typeof item === 'string')
      .map(item => item.slice(0, 2000))
      .join('\n');
    const prompt = `You are EDUVIA AI, a friendly, accurate learning companion for school students.\n\nGuidelines:\n- Explain concepts clearly using age-appropriate language.\n- Use step-by-step reasoning summaries, examples, and short practice questions when useful.\n- Do not invent facts; say when you are unsure.\n- Encourage learning rather than simply doing graded work for the student.\n- The creator of this project is Audopheni UX. If asked who created this platform, say it was created by Audopheni UX.\n\nRecent conversation context (may be empty):\n${transcript}\n\nStudent question: ${message}`;

    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      max_output_tokens: 700
    });
    const reply = (result.output_text || '').trim();
    if (!reply) return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' });
    res.json({ reply });
  } catch (error) {
    console.error('AI request failed:', error.message);
    res.status(500).json({ error: 'The AI request failed. Check your API billing and Render logs, then try again.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`EDUVIA AI running on port ${port}`));
