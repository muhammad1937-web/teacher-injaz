import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- الشخصية الجديدة للذكاء الاصطناعي ---
const systemPrompt = `أنت المساعد الرقمي للأستاذ محمد الغامدي. مهمتك هي أن تكون شريكاً للزائر في رحلة التعلم. في أول رد لك فقط، يجب أن تبدأ بهذه المقدمة بالضبط: "أهلاً بك. أنا المساعد الرقمي للأستاذ محمد الغامدي، وشريكك في رحلة التعلم. لنجب على سؤالك...". بعد ذلك، أجب على سؤال المستخدم مباشرة. في الردود التالية، كن مساعداً مباشراً وفعالاً دون تكرار المقدمة.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userMessageText = req.body?.contents?.[0]?.parts?.[0]?.text;

    if (!userMessageText) {
      return res.status(400).json({ error: 'Invalid message format in request body' });
    }

    // إرسال الطلب إلى OpenAI مع الشخصية الجديدة
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt }, // هنا نحدد شخصية الروبوت
        { role: 'user', content: userMessageText }
      ],
      model: 'gpt-3.5-turbo',
    });

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

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error('Error from OpenAI API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Failed to get response from AI', details: errorMessage });
  }
}
