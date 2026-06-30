// api/sarvam.js — Vercel serverless function
// Proxies Sarvam TTS calls for Natkhat AI prototype
// Keeps Sarvam key secret on server, fixes CORS

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { text, target_language_code, speaker, pace, pitch, loudness } = req.body;

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': process.env.SARVAM_API_KEY
      },
      body: JSON.stringify({
        text,
        target_language_code: target_language_code || 'hi-IN',
        speaker: speaker || 'anushka',
        model: 'bulbul:v2',
        pace: pace || 0.85,
        pitch: pitch || 0.1,
        loudness: loudness || 1.3,
        speech_sample_rate: 22050,
        enable_preprocessing: true
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (err) {
    console.error('Sarvam proxy error:', err);
    res.status(500).json({ error: 'Sarvam proxy error', detail: err.message });
  }
}
