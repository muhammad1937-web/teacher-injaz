export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests are allowed' });
  }

  try {
    const requestBody = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API key is not configured.");
    }

    // --- التغيير الرئيسي هنا ---
    // لقد قمنا بتغيير نقطة النهاية (Endpoint) لتستخدم بنية Vertex AI
    // نحتاج أيضاً إلى رقم مشروعك (Project ID)
    const PROJECT_ID = "teacher-portfolio-3f782"; // لقد استخرجت هذا من صورك السابقة
    const MODEL_ID = "gemini-1.5-flash-latest";
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/${MODEL_ID}:streamGenerateContent`;
    // --- نهاية التغيير الرئيسي ---

    const apiResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Vertex AI تتطلب "Bearer Token" بدلاً من "API Key" في العنوان
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(requestBody ),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      console.error('Error from Vertex AI API:', errorData);
      return res.status(apiResponse.status).json({ error: 'Failed to get response from Vertex AI API', details: errorData });
    }

    const data = await apiResponse.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}
