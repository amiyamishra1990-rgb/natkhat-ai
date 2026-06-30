// api/leo.js — Vercel serverless function
// Proxies Claude calls through AiCredits.in (OpenAI-compatible, INR billing)
// Fixes CORS so Android Chrome can call Leo's brain

export default async function handler(req, res) {
  // CORS headers — allow any origin for prototype testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    // Incoming body uses Anthropic-style shape: { model, max_tokens, system, messages }
    const { max_tokens, system, messages } = req.body;

    // Build OpenAI-style messages array: system message first, then conversation
    const openaiMessages = [
      { role: 'system', content: system },
      ...messages
    ];

    const response = await fetch('https://api.aicredits.in/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AICREDITS_API_KEY}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-6',
        max_tokens: max_tokens || 1000,
        messages: openaiMessages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AiCredits error:', data);
      res.status(response.status).json({ error: 'AiCredits API error', detail: data });
      return;
    }

    // Translate OpenAI-shape response → Anthropic-shape response
    // so the frontend HTML doesn't need to change its parsing logic
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({
      content: [{ type: 'text', text }]
    });

  } catch (err) {
    console.error('Leo proxy error:', err);
    res.status(500).json({ error: 'Leo proxy error', detail: err.message });
  }
}
