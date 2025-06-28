const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiCodeReview = async (code) => {
    const prompt = `Analyze the following code and return a JSON object with the following fields:
{
  "codeQuality": number (1-10),
  "readabilityScore": number (1-10),
  "complexityAnalysis": { "time": string, "space": string },
  "optimizationSuggestions": string[],
  "bestPractices": string[],
  "styleIssues": string[]
}
Only return the JSON object, no explanation.\nCode:\n${code}`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a code review assistant. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.3,
        });

        const response = completion.choices[0].message.content;
        
        // Try to parse the response as JSON
        try {
            const jsonStart = response.indexOf('{');
            const jsonEnd = response.lastIndexOf('}');
            const jsonString = response.substring(jsonStart, jsonEnd + 1);
            const review = JSON.parse(jsonString);
            return review;
        } catch (e) {
            // Fallback: return a default object if parsing fails
            return {
                codeQuality: 5,
                readabilityScore: 5,
                complexityAnalysis: { time: "O(n)", space: "O(1)" },
                optimizationSuggestions: ["Could not parse AI response"],
                bestPractices: [],
                styleIssues: ["Could not parse AI response"]
            };
        }
    } catch (err) {
        console.error('OpenAI API error:', err);
        // Fallback: return a default object if API call fails
        return {
            codeQuality: 5,
            readabilityScore: 5,
            complexityAnalysis: { time: "O(n)", space: "O(1)" },
            optimizationSuggestions: ["API error occurred"],
            bestPractices: [],
            styleIssues: ["API error occurred"]
        };
    }
};

module.exports = { aiCodeReview }; 