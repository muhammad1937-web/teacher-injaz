export default async function handler(req, res) {
  // السماح بطلبات POST فقط
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { message } = await req.json();

    // مفتاح Gemini (استبدل YOUR_API_KEY بمفتاحك)
    const apiKey = "YOUR_API_KEY";
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
      }),
    });

    const data = await response.json();

    // إرسال الرد إلى واجهة الموقع
    res.status(200).json({
      reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || "لم يتم الحصول على رد من الذكاء الاصطناعي.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بـ Gemini API" });
  }
}
