export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userMessage = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'Request body is missing' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // لا تعرض الخطأ للمستخدم النهائي، فقط للتسجيل في Vercel
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // استخدمنا gemini-pro لأنه نموذج مستقر ومدعوم
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userMessage ),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error from Gemini API:', errorBody);
      return res.status(response.status).json({ error: 'Failed to get response from AI', details: errorBody });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
