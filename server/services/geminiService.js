require('dotenv').config();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is missing in .env');
    }

    this.model = 'gemini-2.0-flash';
this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

  }

  async analyzeCode(code, language, fileName) {
    try {
      if (!code || code.trim().length === 0) {
        return this.createFailureResponse('No code provided for analysis');
      }

      const truncatedCode =
        code.length > 5000
          ? code.substring(0, 5000) + '\n// Code truncated for analysis'
          : code;

      const prompt = `
Analyze the following ${language} file (${fileName}) for security vulnerabilities and code quality issues.

Return ONLY valid JSON in this exact format:

{
  "security_issues": [],
  "code_quality": [],
  "improvements": [],
  "overall_score": 85,
  "summary": "brief assessment"
}

Code:
\`\`\`${language}
${truncatedCode}
\`\`\`
`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000
          }
        })
      });

      // ✅ Proper HTTP error handling
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Optional debug (remove in production)
      // console.log("Gemini full response:", JSON.stringify(data, null, 2));

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      // Remove markdown formatting if present
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Invalid JSON format returned by Gemini');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        ...parsed
      };

    } catch (error) {
      console.error('Gemini analysis error:', error.message);
      return this.createFailureResponse(error.message);
    }
  }

  createFailureResponse(reason) {
    return {
      success: false,
      security_issues: [reason],
      code_quality: [],
      improvements: ['Verify API key, quota limits, or model configuration'],
      overall_score: 0,
      summary: 'AI analysis failed'
    };
  }
}

module.exports = new GeminiService();
