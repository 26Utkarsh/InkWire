import 'dotenv/config';
import axios from 'axios';

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiKey2 = process.env.GEMINI_API_KEY_2;
  const groqKey = process.env.GROQ_API_KEY;

  console.log('API Key 1:', apiKey ? apiKey.substring(0, 10) + '...' : 'not set');
  console.log('API Key 2:', apiKey2 ? apiKey2.substring(0, 10) + '...' : 'not set');
  console.log('Groq Key:', groqKey ? groqKey.substring(0, 10) + '...' : 'not set');

  // Test Key 1
  try {
    console.log('Testing Gemini Key 1 with gemini-2.5-flash...');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { contents: [{ parts: [{ text: 'Say hello' }] }] }
    );
    console.log('Gemini Key 1 Success:', response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error('Gemini Key 1 Failed:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data));
    }
  }

  // Test Groq Key
  try {
    console.log('Testing Groq LLaMA...');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello' }]
      },
      { headers: { Authorization: `Bearer ${groqKey}` } }
    );
    console.log('Groq Success:', response.data?.choices?.[0]?.message?.content);
  } catch (err) {
    console.error('Groq Failed:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data));
    }
  }
}

testGemini();
