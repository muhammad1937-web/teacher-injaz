// استيراد مكتبة OpenAI
import OpenAI from 'openai';

// تهيئة عميل OpenAI باستخدام المفتاح من متغيرات البيئة
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // جسم الطلب القادم من موقعك يجب أن يكون بهذا الشكل:
    // { "contents": [{ "parts": [{ "text": "رسالتك هنا" }] }] }
    // سنقوم باستخراج الرسالة من هذا الجسم
    const userMessageText = req.body?.contents?.[0]?.parts?.[0]?.text;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Invalid message format in request body' });
    }

    // إرسال الطلب إلى OpenAI
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: userMessageText }],
      model: 'gpt-3.5-turbo', // نموذج سريع وفعال من حيث التكلفة
    });

    // OpenAI ترد ببنية مختلفة، لذلك سنقوم بتنسيق الرد
    // ليطابق ما يتوقعه موقعك (نفس بنية Gemini)
    const responsePayload = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: completion.choices[0].message.content,
              },
            ],
          },
        },
      ],
    };

    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Error from OpenAI API:', error);
    // تعديل رسالة الخطأ لتكون أوضح
    res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
  }
}
