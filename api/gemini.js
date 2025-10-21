export default async function handler(req, res) {
  // ✅ السماح لجميع المواقع بالوصول
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ التعامل مع طلبات OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  try {
    // ✅ استخدم مفتاح API الحقيقي هنا
    const API_KEY = 'AIzaSyD9orw8acx1GrdSMAmZBrH1z5rdBhArMX0';
    
    const { contents } = await req.json();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // ✅ إرجاع البيانات كاملة (ليس فقط reply)
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Server failed to connect to Gemini.'
    });
  }
}
