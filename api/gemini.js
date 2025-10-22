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
    const projectId = 'teacher-portfolio-3f782'; // لقد أضفت معرّف المشروع هنا

    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // --- التغيير الرئيسي هنا ---
    // تم التبديل إلى نقطة نهاية Vertex AI الأكثر استقراراً
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-pro:streamGenerateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Vertex AI تتطلب رمز مصادقة مختلف
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(userMessage ),
    });

    if (!response.ok) {
      const errorBody = await response.text(); // أحياناً الخطأ يكون نصياً وليس JSON
      console.error('Error from Vertex AI API:', errorBody);
      return res.status(response.status).json({ error: 'Failed to get response from AI', details: errorBody });
    }

    // بما أننا نستخدم streamGenerateContent، نحتاج إلى معالجة الاستجابة بشكل مختلف قليلاً
    // للتبسيط الآن، سنعيد أول جزء من الرد فقط
    const data = await response.json();
    res.status(200).json(data[0]); // Vertex AI stream ترد بمصفوفة

  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
