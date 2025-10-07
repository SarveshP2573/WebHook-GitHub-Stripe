require('dotenv').config();


class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-2.0-flash';
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  async analyzeCode(code, language, fileName) {
    try {
     
      const truncatedCode =
        code.length > 5000 ? code.substring(0, 5000) + '... // truncated' : code;

      const prompt = `
Analyze this ${language} code from ${fileName} for security and quality:

\`\`\`${language}
${truncatedCode}
\`\`\`

Respond with ONLY valid JSON in this exact format:
{
  "security_issues": [],
  "code_quality": [],
  "improvements": [],
  "overall_score": 85,
  "summary": "brief assessment"
}
`;

      // Call Gemini API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      });

      const data = await response.json();

      // Extract text safely
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      // Clean and parse JSON
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return this.createFallbackResponse('Invalid JSON response format');
      }
    } catch (error) {
      console.error('Gemini analysis error:', error.message);
      return this.createFallbackResponse(`Analysis error: ${error.message}`);
    }
  }

  createFallbackResponse(reason) {
    return {
      security_issues: [reason],
      code_quality: ['Analysis failed'],
      improvements: ['Check API key or free tier limits'],
      overall_score: 0,
      summary: 'Analysis unavailable',
    };
  }
}

module.exports = new GeminiService();
