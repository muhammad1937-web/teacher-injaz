export default async function handler(req, res) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  try {
    // 1. اقرأ محتوى الطلب (body) الذي يرسله موقعك
    const requestBody = req.body;

    // 2. استخدم مفتاح API من متغيرات البيئة
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in Vercel environment variables.");
      return res.status(500).json({ error: "API key is not configured on the server." });
    }

    // 3. بناء الرابط الصحيح
    // انتبه: الرابط يستخدم "v1beta" وهو ما يتوافق مع مفاتيح AI Studio
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // 4. أرسل الطلب إلى Gemini
    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody ), // مرر requestBody مباشرة
    });

    // 5. تحليل الاستجابة من Gemini
    const data = await apiResponse.json();

    // 6. التحقق من وجود خطأ في استجابة Gemini نفسها
    if (data.error) {
      console.error('Error from Gemini API:', data.error);
      // أعد إرسال رسالة الخطأ من جوجل كما هي لتشخيص المشكلة
      return res.status(data.error.code || 500).json({ 
        error: `Error from Gemini: ${data.error.message}`,
        details: data.error.details 
      });
    }
    
    // 7. إذا نجح كل شيء، أرسل الرد إلى موقعك
    res.status(200).json(data);

  } catch (error) {
    console.error('Critical error in serverless function:', error);
    res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
  }
}
