export default async function handler(req, res) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  try {
    // 1. اقرأ محتوى الطلب (body) الذي يرسله موقعك
    const requestBody = req.body;

    // 2. استخدم مفتاح API من متغيرات البيئة (الأكثر أمانًا)
    //    تأكد من إضافة GEMINI_API_KEY في إعدادات مشروعك على Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    
    // تأكد من وجود المفتاح
    if (!apiKey) {
        throw new Error("API key is not configured.");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // 3. أرسل الطلب إلى Gemini بنفس البنية التي استقبلتها
    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody ), // مرر requestBody مباشرة
    });

    // تحقق من نجاح الاستجابة من Gemini
    if (!apiResponse.ok) {
      // إذا فشل، اقرأ رسالة الخطأ من Gemini وأعد إرسالها
      const errorData = await apiResponse.json();
      console.error('Error from Gemini API:', errorData);
      return res.status(apiResponse.status).json({ error: 'Failed to get response from Gemini API', details: errorData });
    }

    // 4. أعد إرسال استجابة Gemini الكاملة إلى موقعك
    const data = await apiResponse.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
