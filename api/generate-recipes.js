const axios = require('axios');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Validate request body
  const { prompt, ingredients, diet, cuisine, mealType } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required in request body' });
  }

  // Check API key exists
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY environment variable is not set');
    return res.status(500).json({ 
      error: 'Server configuration error: API key not found. Please contact administrator.' 
    });
  }

  try {
    console.log('Calling OpenAI API with ingredients:', ingredients);
    
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef. Always respond with valid JSON only. No markdown, no explanation, just the JSON array.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Extract content from response
    const rawContent = openAIResponse.data.choices[0].message.content;
    console.log('Raw OpenAI response:', rawContent.substring(0, 100));

    // Clean and parse JSON - remove any markdown code fences
    const cleanContent = rawContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let recipes;
    try {
      recipes = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Content that failed to parse:', cleanContent);
      return res.status(500).json({ 
        error: 'AI returned invalid format. Please try again.' 
      });
    }

    // Validate recipes is an array
    if (!Array.isArray(recipes)) {
      return res.status(500).json({ 
        error: 'AI returned unexpected format. Please try again.' 
      });
    }

    console.log(`Successfully generated ${recipes.length} recipes`);
    return res.status(200).json({ recipes });

  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);

    // Handle specific OpenAI errors
    if (err.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your environment variables.' 
      });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI rate limit reached or quota exceeded. Please check your billing.' 
      });
    }
    if (err.response?.status === 500) {
      return res.status(500).json({ 
        error: 'OpenAI server error. Please try again in a moment.' 
      });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: 'Request timed out. Please try again.' 
      });
    }

    return res.status(500).json({
      error: err.response?.data?.error?.message || 'Failed to generate recipes. Please try again.'
    });
  }
};
